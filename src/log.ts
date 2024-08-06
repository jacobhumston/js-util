/**
 * Copyright of Jacob Humston
 * Licensing details can be found in the LICENSE.txt file.
 */

/** Type of logger. */
export type LoggerType = 'info' | 'warn' | 'error' | 'debug' | 'success' | 'misc';

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
    /** Optional function which is called every time something is logged using `this.log`. */
    public onLog?: (type: LoggerType, message: string) => void;
    /** Optional override function for `this.getPrefixForType`. */
    public getPrefixForTypeOverride?: (type: LoggerType, useColorOverride: boolean | null) => string;

    /**
     * @param useColor Override the default color setting. (Default: `true`)
     * @param consoleFunction Override the default console function. (Default: `process.stdout.write`)
     */
    constructor(
        useColor: typeof this.useColor = true,
        consoleFunction: typeof this.consoleFunction = process.stdout.write.bind(process.stdout)
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
     * @returns The prefix.
     */
    public getPrefixForType(type: LoggerType, useColorOverride: boolean | null = null): string {
        if (this.getPrefixForTypeOverride) return this.getPrefixForTypeOverride(type, useColorOverride);
        return (useColorOverride == null ? this.useColor : useColorOverride)
            ? this.colorType(type, `[${type}]:`)
            : `[${type}]:`;
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
}

/** Logger with default settings. */
export const DefaultLogger = new Logger();
