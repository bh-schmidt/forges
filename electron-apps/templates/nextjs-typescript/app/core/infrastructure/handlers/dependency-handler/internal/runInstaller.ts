import { execa, Options } from "execa"
import { DependencyHandler } from "../DependencyHandler"

export async function runInstaller(this: DependencyHandler,listeningPort: number) {
    const args = [...process.argv]
    const executable = args.shift()
    const cleanArgs = args.map(e => e.replace('"', '\\"'))

    const controller = new AbortController()

    const waiter = waitForCallback(controller.signal)

    const command = args.length > 0 ?
        `Start-Process "${executable}" -ArgumentList "${cleanArgs.join(`", "`)}", "--install-dependencies", "--callback-port", "${listeningPort}" -Verb runAs` :
        `Start-Process "${executable}" -ArgumentList "--install-dependencies", "--callback-port", "${listeningPort}" -Verb runAs`

    const { failed, all } = await execa<Options>(
        'powershell',
        [
            '-Command',
            command
        ],
        {
            all: true,
            shell: false,
            reject: false
        })

    if (all) {
        this.logger.info(all)
    }

    if (failed) {
        throw new Error('Error installing dependencies.')
    }

    const success = await waiter
    if (!success) {
        throw new Error('Error waiting for dependencies to be installed')
    }

    this.logger.info('Dependencies installed')
}

async function waitForCallback(signal: AbortSignal) {
    return await new Promise<boolean>((res, rej) => {
        signal.addEventListener('abort', () => {
            rej()
        })

        DependencyHandler.events.on('install', (value) => {
            console.log(value)
            res(value)
        })
    })
}