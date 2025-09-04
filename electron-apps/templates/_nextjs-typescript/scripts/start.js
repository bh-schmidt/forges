import concurrently from "concurrently"

await concurrently(
    [
        {
            command: `nodemon --watch ./app/core --ext ts,js,json --exec "npm run build-dev --prefix app/core || exit 1"`,
            name: 'REBUILD',
            prefixColor: 'magenta'
        },
        {
            command: 'nodemon --watch assets --ext * --exec "node scripts/copyAssets.js || exit 1"',
            name: 'ASSETS',
            prefixColor: 'yellow'
        },
        {
            command: 'npm run dev --prefix ./app/renderer/ || exit 1',
            name: 'NEXT',
            prefixColor: 'green'
        },
        {
            command: 'wait-on -d 3000 ./_build/core/presentation/index.js && nodemon --watch _build --ext * --exec "electron . || exit 1"',
            name: 'ELECTRON',
            prefixColor: 'blue'
        }
    ],
    {
        killOthers: true
    }
)