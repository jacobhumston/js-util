# Delete and create build directory.
rm -rf ./build
mkdir ./build

# Bun single builds.
bun build src/index.ts > ./build/single-browser.js
bun build src/index.ts --target node > ./build/single-node.js
bun build src/index.ts --target bun > ./build/single-bun.js

# TSC builds.
bunx tsc

# Format
bun run format ./build/ --write --ignore-path .prettierignore --cache