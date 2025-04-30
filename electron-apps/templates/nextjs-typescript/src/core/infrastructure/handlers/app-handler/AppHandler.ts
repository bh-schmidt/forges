import { AppLogger } from "@infrastructure/logger/Logger";
import { app } from "electron";
import { execa, Options } from "execa";
import { injectable } from "tsyringe";

@injectable()
export class AppHandler {
    constructor(private logger: AppLogger) { }
    async hasAdminPrivileges() {
        const { failed } = await execa<Options>('NET SESSION', { reject: false, shell: true })
        return !failed
    }

    async restartAsAdmin() {
        if (await this.hasAdminPrivileges()) {
            this.logger.info('App already has admin privileges')
            return
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
            this.logger.info(all)
        }

        if (!failed) {
            app.quit()
        }
    }
}