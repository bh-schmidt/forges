import { execa } from 'execa'
import { copy, remove } from 'fs-extra'

const options = {
    stderr: process.stderr,
    stdout: process.stdout
}

await remove('_build')
await remove('src/renderer/out')

await execa('npm run build --prefix ./src/renderer/', options)
await execa('tsc --build src/core/tsconfig.json && tsc-alias -p src/core/tsconfig.json', options)

await copy('assets', '_build/assets')
await copy('src/renderer/out', '_build/renderer')

await remove('src/renderer/out')
