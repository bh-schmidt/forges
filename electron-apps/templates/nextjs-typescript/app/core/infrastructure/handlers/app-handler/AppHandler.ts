import { AppLogger } from "@infrastructure/logger/Logger";
import { app, RelaunchOptions } from "electron";
import { execa, Options } from "execa";
import { injectable } from "tsyringe";

@injectable()
export class AppHandler {
    constructor(private logger: AppLogger) { }
    async hasAdminPrivileges() {
        const { failed } = await execa<Options>('NET SESSION', { reject: false, shell: true })
        return !failed
    }

    async restart(options?: RelaunchOptions) {
        app.relaunch(options)
    }

    async restartAsAdmin() {
        if (await this.hasAdminPrivileges()) {
            this.logger.info('App already has admin privileges')
            return
        }

        const hasLock = app.hasSingleInstanceLock()
        if (hasLock) {
            app.releaseSingleInstanceLock()
        }

        const args = [...process.argv]
        const executable = args.shift()
        const cleanArgs = args.map(e => e.replace('"', '\\"'))

        const command = args.length > 0
            ? `Start-Process "${executable}" -ArgumentList "${cleanArgs.join(`", "`)}" -Verb runAs`
            : `Start-Process "${executable}" -Verb runAs`

        const { failed, all } = await execa<Options>(
            'powershell',
            [
                '-Command',
                command
            ],
            {
                all: true,
                shell: true,
                reject: false
            })

        if (all) {
            this.logger.info(all as string)
        }

        if (!failed) {
            app.quit()
            return
        }

        if (hasLock) {
            const locked = app.requestSingleInstanceLock()
            if (!locked) {
                this.logger.error(`Couldn't re-aquire the instance lock after failing the restart.`)
            }
        }
    }
}