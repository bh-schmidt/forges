import { appPaths } from "@presentation/appPaths"
import { glob } from "glob"
import { join } from "path"
import { pathToFileURL } from "url"

export async function loadIpcs() {
    const ipcsDir = join(appPaths.core, 'presentation/ipcs')
    const files = await glob('**/*.js', {
        cwd: ipcsDir,
        absolute: true,
        nodir: true,
        stat: true
    })

    for (const file of files) {
        const url = pathToFileURL(file)
        await import(url.href)
    }
}