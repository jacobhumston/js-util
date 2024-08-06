# @jacobhumston/util

A JavaScript util library, includes features such as logging. This package is intended mostly for personal use, however anyone is free to contribute and use if they wish to.

## Install & Usage

```bash
npm install @jacobhumston/util
```

```js
import * as util from `@jacobhumston/util`;

// Logger example.
const logger = new util.Logger(); // Or: const logger = util.DefaultLogger
logger.onLog = function() {} // Useful for writing logs to a file.
logger.log('info', 'Hello world!'); // Log something to the terminal.
```

## Development

```bash
git clone https://github.com/jacobhumston/js-util.git .
bun install
mkdir test
echo "import * as util from \"../src\";" > test/index.ts
```

-   `bun run test` - Run your test file.
-   `bun run format` - Format your code.
-   `bun run build` - Build the package as well as some bundled versions. _(https://bun.sh/docs/bundler & https://www.typescriptlang.org/docs/handbook/compiler-options.html)_
-   `bun run bt` - Build and then test.

Bun is required for development, but is not required for usage of the package itself.
