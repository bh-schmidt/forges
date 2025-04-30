import { mainWindow } from ".."

export function bringToFront() {
    if (mainWindow.isMinimized()) {
        mainWindow.restore()
        return
    }

    mainWindow.show()
}