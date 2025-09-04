import { execa } from 'execa'

const options = {
    stdio: 'inherit',
    reject: false
}

const isDev = process.argv.includes('--dev')

const result = isDev ?
    await execa('npm run build-dev --prefix ./app/core/', options)
    :
    await execa('npm run build --prefix ./app/core/', options)

if (result.failed) {
    process.exit(result.exitCode)
} 