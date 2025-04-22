import concurrently from "concurrently"

async function run() {
    await concurrently([
        {
            command: 'nodemon --watch main --ext ts,js,json --exec tsc -p main && tsc-alias -p main/tsconfig.json',
            name: 'REBUILD',
            prefixColor: 'magenta'
        },
        {
            command: 'nodemon --watch assets --ext * --exec node scripts/copyAssets.js',
            name: 'ASSETS',
            prefixColor: 'yellow'
        },
        {
            command: 'npm run dev --prefix ./renderer/',
            name: 'NEXT',
            prefixColor: 'green'
        },
        {
            command: 'wait-on -d 3000 ./_build/main/index.js && nodemon --watch _build/main --ext js,json --exec electron .',
            name: 'ELECTRON',
            prefixColor: 'blue'
        }
    ], {
        killOthers: true
    })
}

run()