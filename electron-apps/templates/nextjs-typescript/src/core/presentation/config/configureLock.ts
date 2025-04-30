import { app } from "electron"
import { bringToFront } from "./bringToFront"

export function configureLock() {
    const gotTheLock = app.requestSingleInstanceLock()
    if (!gotTheLock) {
        app.exit(0)
    }

    app.on('second-instance', () => {
        bringToFront()
    })
}