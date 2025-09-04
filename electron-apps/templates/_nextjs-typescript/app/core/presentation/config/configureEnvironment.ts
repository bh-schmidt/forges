import { appPaths, setAppPaths } from "@infrastructure/constants/appPaths";
import { app } from "electron";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const filePath = fileURLToPath(import.meta.url);
const directory = dirname(filePath)
const indexDirectory = join(directory, '../');

process.env['APP_NAME'] = app.name
process.env['APP_ENV'] = app.isPackaged ? 'PRODUCTION' : 'DEVELOPMENT'

setAppPaths(indexDirectory)
process.env['APP_PATHS'] = JSON.stringify(appPaths)