import { getMainWindow } from "@presentation/mainWindow"

export function bringToFront() {
    const mainWindow = getMainWindow()
    if (mainWindow.isMinimized()) {
        mainWindow.restore()
        return
    }

    mainWindow.show()
}