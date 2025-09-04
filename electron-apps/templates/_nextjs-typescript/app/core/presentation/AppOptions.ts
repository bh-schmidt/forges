import { Command, InvalidArgumentError } from "commander"

export function parseOptions() {
    const command = new Command()
        .option('--install-dependencies', 'Executes program in installer mode')
        .option('--callback-port <port>', 'Callback port for communication between instances', intParser)
        .option('--dev-mode', 'Runs app in dev mode')

    command.parse()
    return command.opts<AppOptions>()
}

export interface AppOptions {
    installDependencies?: boolean
    callbackPort?: number
    devMode?: boolean
}

function intParser(value: string) {
    const parsedValue = parseInt(value, 10);
    if (isNaN(parsedValue)) {
        throw new InvalidArgumentError('Not a number.');
    }
    return parsedValue;
}
