import concurrently from "concurrently"

await concurrently(
    [
        {
            command: `nodemon --watch ./src/core --ext ts,js,json --exec \
                "tsc -p src/core/tsconfig.json \
                    --noUnusedLocals false \
                    --noUnusedParameters false \
                && tsc-alias -p src/core/tsconfig.json"`,
            name: 'REBUILD',
            prefixColor: 'magenta'
        },
        {
            command: 'nodemon --watch assets --ext * --exec "node scripts/copyAssets.js"',
            name: 'ASSETS',
            prefixColor: 'yellow'
        },
        {
            command: 'npm run dev --prefix ./src/renderer/',
            name: 'NEXT',
            prefixColor: 'green'
        },
        {
            command: 'wait-on -d 3000 ./_build/core/presentation/index.js && nodemon --watch _build --ext * --exec "electron ."',
            name: 'ELECTRON',
            prefixColor: 'blue'
        }
    ],
    {
        killOthers: true
    }
)