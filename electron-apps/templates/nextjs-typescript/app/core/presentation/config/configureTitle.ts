import { container } from "tsyringe";
import { mainWindow } from "..";
import { AppHandler } from "@infrastructure/handlers/app-handler/AppHandler";
import { AppLogger } from "@infrastructure/logger/Logger";

const appHandler = container.resolve(AppHandler)
const logger = container.resolve(AppLogger)


export async function configureTitle() {
    const isAdmin = await appHandler.hasAdminPrivileges();

    if (isAdmin) {
        logger.info('Running app as admin/root')
    } else {
        logger.info('Running app as common user')
    }

    const baseTitle = isAdmin ? 'Admin: ' : ''
    mainWindow.webContents.on('page-title-updated', (event, title) => {
        event.preventDefault()
        mainWindow.setTitle(baseTitle + title)
    })
}