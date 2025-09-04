import { homedir, tmpdir } from "os";
import { isAbsolute, join } from "path";

export namespace AppPath {
    export function getTemp(...path: string[]) {
        const p = join(...path)

        if (isAbsolute(p)) {
            return p
        }

        return join(tmpdir(), process.env['APP_NAME']!, p)
    }

    export function getDownloads(...path: string[]) {
        const p = join(...path)

        if (isAbsolute(p)) {
            return p
        }

        return join(homedir(), 'Downloads', p)
    }
}