import { execa } from 'execa'
import { copy, remove } from 'fs-extra'

const options = {
    stdio: 'inherit',
}

await remove('_build')
await remove('app/renderer/out')

await execa('node scripts/build/build-core.js', options)
await execa('npm run build --prefix ./app/renderer/', options)

await copy('assets', '_build/assets')
await copy('app/renderer/out', '_build/renderer')

await remove('app/renderer/out')
