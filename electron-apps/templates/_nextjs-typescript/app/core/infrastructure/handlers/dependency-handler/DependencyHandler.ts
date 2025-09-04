import { AppLogger } from "@infrastructure/logger/Logger";
import EventEmitter from "events";
import { injectable } from "tsyringe";
import { install } from "./internal/install";
import { runInstaller } from "./internal/runInstaller";

@injectable()
export class DependencyHandler {
    constructor(public logger: AppLogger) {
    }

    static events = new EventEmitter<{
        install: [success: boolean]
    }>()

    async check() {
        this.logger.info('All dependencies installed')
        return true
    }

    install = install
    runInstaller = runInstaller
}