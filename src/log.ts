/**
 * Copyright of Jacob Humston
 * Licensing details can be found in the LICENSE.txt file.
 */

import { isNode } from './etc/browser-or-node.js';

/** Type of logger. */
export type LoggerType = 'info' | 'warn' | 'error' | 'debug' | 'success' | 'misc';

/** An array of logger types. */
export const loggerTypes: Array<LoggerType> = ['info', 'warn', 'error', 'debug', 'success', 'misc'];

/** The largest logger type in string length. */
export const largestLoggerTypeLength: number = Math.max(...loggerTypes.map((type) => type.length));
/** The smallest logger type in string length. */
export const smallestLoggerTypeLength: number = Math.min(...loggerTypes.map((type) => type.length));

/**
 * Type of line/escape sequence to use.
 * - `new`: New line. `'\n'`
 * - `current`: Current line. `''`
 * - `overlap`: Overlap current line. `'\r'`
 * - `doubleNew`: Double new line. `'\n\n'`
 * - `space`: Space. `' '`
 * - `replace`: Replace current line. `'\u001b[2K\r'`
 */
export type LineType = 'new' | 'current' | 'overlap' | 'doubleNew' | 'space' | 'replace';

/**
 * Logger class which provides custom methods for logging to the console.
 */
export class Logger {
    /** Defines if this logger should include color. */
    public useColor: boolean;
    /** The function this logger uses to output to the console. */
    public consoleFunction: (message: string) => void;
    /** Optional function which is called every time something is logged. */
    public onLog?: (type: LoggerType, message: string) => void;
    /** Optional override function for `this.getPrefixForType`. */
    public getPrefixForTypeOverride?: (
        type: LoggerType,
        useColorOverride: boolean | null,
        overridePrefixText: string | null
    ) => string;

    /**
     * @param useColor Override the default color setting. (Default: `true`)
     * @param consoleFunction Override the default console function. (Default: `process.stdout.write`)
     */
    constructor(
        useColor: typeof this.useColor = true,
        consoleFunction: typeof this.consoleFunction = isNode ? process.stdout.write.bind(process.stdout) : console.log
    ) {
        this.useColor = useColor;
        this.consoleFunction = consoleFunction;
    }

    /**
     * Plain text logger primarily used by other methods. This function does not call `this.onLog`.
     * @param message The message to log.
     * @param lineType The type of escape sequence to use. (Default: `'new'`)
     */
    public plain(message: string, lineType: LineType = 'new'): void {
        const escapeSequence: { [key in LineType]: string } = {
            new: '\n',
            current: '',
            overlap: '\r',
            doubleNew: '\n\n',
            space: ' ',
            replace: '\u001b[2K\r',
        };
        return this.consoleFunction(`${escapeSequence[lineType]}${message}`);
    }

    /**
     * Color the type prefix of a message.
     * @param type The type of message.
     * @param typeString The string to colorize.
     * @returns The colorized type.
     */
    public colorType(type: LoggerType, typeString: string): string {
        const colors: { [key in LoggerType]: string } = {
            info: '\x1b[34m',
            warn: '\x1b[33m',
            error: '\x1b[31m',
            debug: '\x1b[36m',
            success: '\x1b[32m',
            misc: '\x1b[37m',
        };
        return `${colors[type]}${typeString}\x1b[0m`;
    }

    /**
     * Get the prefix of a log type.
     * @param type The log type.
     * @param useColorOverride If the prefix should be colored. If null, `this.useColor` is used. (Default: `null`)
     * @param overridePrefixText Override the prefix text. (Default: `null`)
     * @returns The prefix.
     */
    public getPrefixForType(
        type: LoggerType,
        useColorOverride: boolean | null = null,
        overridePrefixText: string | null = null
    ): string {
        if (this.getPrefixForTypeOverride)
            return this.getPrefixForTypeOverride(type, useColorOverride, overridePrefixText);
        const prefixText = (overridePrefixText ?? type).toUpperCase();
        const prefixString = `${prefixText}${' '.repeat(largestLoggerTypeLength - prefixText.length)} |`;
        return (useColorOverride == null ? this.useColor : useColorOverride)
            ? this.colorType(type, prefixString)
            : prefixString;
    }

    /**
     * Log a message to the console.
     * @param type The type of message to log.
     * @param message The message to log.
     */
    public log(type: LoggerType, message: string): void {
        if (this.onLog) this.onLog(type, message);
        return this.plain(`${this.getPrefixForType(type)} ${message}`);
    }

    /**
     * Log JSON to the console. This function will stringify the object for you.
     * @param type The type of message to log.
     * @param objectOrArray The JSON object to log.
     * @param indentLength The length of the indent. (Default: `4`)
     */
    public logJSON(type: LoggerType, objectOrArray: any, indentLength: number = 4): void {
        if (this.onLog) this.onLog(type, JSON.stringify(objectOrArray));
        let jsonText = JSON.stringify(objectOrArray, null, indentLength);

        if (this.useColor) {
            const colors = {
                key: {
                    color: '\x1b[34m',
                    regex: /"([^"\\]*(\\.[^"\\]*)*)"\s*:/g,
                },
                string: {
                    color: '\x1b[32m',
                    regex: /"([^"\\]*(\\.[^"\\]*)*)"/g,
                },
                number: {
                    color: '\x1b[33m',
                    regex: /-?\d+(\.\d+)?([eE][+-]?\d+)?/g,
                },
                boolean: {
                    color: '\x1b[33m',
                    regex: /true|false/g,
                },
                null: {
                    color: '\x1b[33m',
                    regex: /null/g,
                },
            };

            const matches: Array<{ text: string; color: string }> = [];
            for (const [_, { color, regex }] of Object.entries(colors)) {
                jsonText.replace(regex, (string) => {
                    matches.push({ text: string, color });
                    return '';
                });
            }

            for (const match of matches) {
                jsonText = jsonText.replaceAll(match.text, `${match.color}${match.text}\x1b[0m`);
            }
        }

        return this.plain(
            `${this.getPrefixForType(type)} ${jsonText.replaceAll('\n', `\n${this.getPrefixForType(type, null, '')} `)}`
        );
    }
}

/** Logger with default settings. */
export const defaultLogger = new Logger();
