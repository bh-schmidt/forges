import { BrowserWindow } from "electron"

let _mainWindow: BrowserWindow

export function setMainWindow(mainWindow: BrowserWindow) {
    _mainWindow = mainWindow
}

export function getMainWindow() {
    return _mainWindow
}