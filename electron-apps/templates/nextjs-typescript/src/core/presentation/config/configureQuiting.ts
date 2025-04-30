import { app } from "electron"
import { mainWindow } from ".."

export function configureQuiting() {
    let isQuiting = false
    
    app.on('before-quit', () => {
        isQuiting = true
    })

    mainWindow.on('close', (event) => {
        if (!isQuiting) {
            event.preventDefault()
            mainWindow.hide()
        }
    })
}