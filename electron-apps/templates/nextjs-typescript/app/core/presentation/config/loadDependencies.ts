import { DependencyHandler } from "@infrastructure/handlers/dependency-handler/DependencyHandler"
import { AppLogger } from "@infrastructure/logger/Logger"
import { AppOptions } from "@presentation/AppOptions"
import { appPaths } from "@presentation/appPaths"
import { httpPort } from "@presentation/http/server"
import { app, BrowserWindow } from "electron"
import { container } from "tsyringe"

const dependencyHandler = container.resolve(DependencyHandler)
const logger = container.resolve(AppLogger)

export async function loadDependencies(options: AppOptions) {
    const loadingWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        icon: appPaths.icon,
        webPreferences: {
            devTools: !app.isPackaged || options.devMode
        }
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
}