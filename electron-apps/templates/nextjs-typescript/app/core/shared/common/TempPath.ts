import { app } from "electron";
import { tmpdir } from "os";
import { isAbsolute, join } from "path";

export namespace TempPath {
    export function get(...path: string[]) {
        const p = join(...path)

        if (isAbsolute(p)) {
            return p
        }

        return join(tmpdir(), app.name, p)
    }
}