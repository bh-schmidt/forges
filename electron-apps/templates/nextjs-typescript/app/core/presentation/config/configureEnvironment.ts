import { appPaths, setAppPaths } from "@infrastructure/constants/appPaths";
import { app } from "electron";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

export function configureEnvironment() {
    const filePath = fileURLToPath(import.meta.url);
    const directory = dirname(filePath)
    const indexDirectory = join(directory, '../');
    console.log(indexDirectory)

    process.env['APP_NAME'] = app.name
    process.env['APP_ENV'] = app.isPackaged ? 'PRODUCTION' : 'DEVELOPMENT'

    setAppPaths(indexDirectory)
    process.env['APP_PATHS'] = JSON.stringify(appPaths)
}