import { getMainWindow } from "@presentation/mainWindow"
import { app } from "electron"

export function configureQuiting() {
    let isQuiting = false
    
    app.on('before-quit', () => {
        isQuiting = true
    })

    const mainWindow = getMainWindow()
    mainWindow.on('close', (event) => {
        if (!isQuiting) {
            event.preventDefault()
            mainWindow.hide()
        }
    })
}