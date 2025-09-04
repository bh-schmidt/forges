import { DependencyHandler } from "@infrastructure/handlers/dependency-handler/DependencyHandler"
import { AppLogger } from "@infrastructure/logger/Logger"
import { AppOptions } from "@presentation/AppOptions"
import { app } from "electron"
import { container } from "tsyringe"

export async function installDependencies(options: AppOptions) {
    if (!options.installDependencies) {
        return
    }

    const dependencyHandler = container.resolve(DependencyHandler)
    const logger = container.resolve(AppLogger)

    try {
        await dependencyHandler.install(options.callbackPort)
        app.exit()
    } catch (error) {
        logger.error('Error installing dependencies.', error)
        app.exit(1)
    }
}