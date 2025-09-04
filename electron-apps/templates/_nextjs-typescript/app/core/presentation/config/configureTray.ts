import { app, Menu, Tray } from "electron"
import { bringToFront } from "./bringToFront"
import { appPaths } from "@presentation/appPaths"

export function configureTray() {
    const menu = Menu.buildFromTemplate([
        {
            label: 'View',
            type: 'normal',
            click() {
                bringToFront()
            }
        },
        {
            type: 'separator'
        },
        {
            label: 'Quit',
            type: 'normal',
            click() {
                app.quit()
            }
        }
    ])

    const tray = new Tray(appPaths.icon)
    tray.on('double-click', bringToFront)
    tray.setToolTip(app.name)
    tray.setContextMenu(menu)
}