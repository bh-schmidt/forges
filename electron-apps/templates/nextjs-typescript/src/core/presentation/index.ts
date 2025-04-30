import "reflect-metadata";

import { DependencyHandler } from "@infrastructure/handlers/dependency-handler/DependencyHandler";
import { AppLogger } from "@infrastructure/logs/Logger";
import { app, BrowserWindow } from "electron";
import serve from 'electron-serve';
import { availableParallelism } from "os";
import { container } from "tsyringe";
import { parseOptions } from "./parseOptions";
import { appPaths } from "./paths";
import { httpPort, startHttpServer } from "./server";
import { join } from "path";
import { glob } from "glob";
import { pathToFileURL } from "url";

process.env.UV_THREADPOOL_SIZE = availableParallelism() as any

const dependencyHandler = container.resolve(DependencyHandler)
const logger = container.resolve(AppLogger)

const options = parseOptions()
if (options.installDependencies) {
    await dependencyHandler.install(options.callbackPort)
    app.exit()
}

await startHttpServer()

export let mainWindow: BrowserWindow
const serveApp = app.isPackaged ? serve({ directory: appPaths.renderer }) : null

app.on('ready', async () => {
    const loadingWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false
    })

    if (!app.isPackaged) {
        loadingWindow.webContents.openDevTools()
    }

    await loadingWindow.loadFile(appPaths.loading)

    try {
        if (!await dependencyHandler.check()) {
            await dependencyHandler.runInstaller(httpPort)
        }
    } catch (error) {
        logger.error('Error checking/installing dependencies.', error)
        app.exit(1)
    }

    loadingWindow.close()

    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: appPaths.icon,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: appPaths.preload,
        },
    });

    mainWindow.maximize()

    if (app.isPackaged) {
        serveApp!(mainWindow)
    }
    else {
        mainWindow.webContents.openDevTools()
        mainWindow.loadURL('http://localhost:8000')
    }
})

app.on('window-all-closed', app.quit)

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