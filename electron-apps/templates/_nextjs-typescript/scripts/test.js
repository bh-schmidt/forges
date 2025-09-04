import { execa } from 'execa'

const options = {
    stdio: 'inherit',
    reject: false,
}

const watchCmd = 'watch'
const watch = process.argv[2] == watchCmd

const newArgs = [...process.argv]
if (watch) {
    newArgs.splice(0, 3)
} else {
    newArgs.splice(0, 2)
}

if (watch) {
    const cleanArgs = newArgs.length > 0 ?
        `""${newArgs.join(`"" ""`)}""` :
        ''

    const result = await execa(`nodemon --watch "./app/core" --watch "./scripts" --ext ts,js --exec "clear && npm run clear && npm run test -- ${cleanArgs} || exit 1"`, options)
    if (result.failed) {
        process.exit(result.exitCode)
    }
}
else {
    const buildResult = await execa('node scripts/build/build-core.js --dev', options)
    if (buildResult.failed) {
        process.exit(buildResult.exitCode)
    }

    const cleanArgs = newArgs.length > 0 ?
        `"${newArgs.join(`" "`)}"` :
        ''
    const testResult = await execa(`node --experimental-vm-modules node_modules/jest/bin/jest.js --passWithNoTests --config ./app/core/jest.config.ts --detectOpenHandles --verbose ${cleanArgs}`, options)

    if (testResult.failed) {
        process.exit(testResult.exitCode)
    }
}
