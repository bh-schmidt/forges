import { execa } from 'execa'
import { copy, remove, ensureDir } from 'fs-extra'

const options = {
    stderr: process.stderr,
    stdout: process.stdout
}

await remove('_build')
await remove('renderer/out')

await execa('npm run build --prefix ./renderer/', options)
await execa('tsc -p main && tsc-alias -p main/tsconfig.json', options)

await copy('assets', '_build/assets')
await copy('renderer/out', '_build/renderer')

await remove('renderer/out')
