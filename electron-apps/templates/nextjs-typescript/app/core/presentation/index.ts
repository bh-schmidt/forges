import { availableParallelism } from "os";
process.env.UV_THREADPOOL_SIZE = availableParallelism().toString()
//
import "reflect-metadata";
import "./config/configureDayJs";
import "./config/configureEnvironment";
//
import { app, BrowserWindow, Menu } from "electron";
import serve from 'electron-serve';
import { appPaths } from "../infrastructure/constants/appPaths";
import { parseOptions } from "./AppOptions";
import { configureLock } from "./config/configureLock";
import { configureQuiting } from "./config/configureQuiting";
import { configureTitle } from "./config/configureTitle";
import { configureTray } from "./config/configureTray";
import { installDependencies } from "./config/installDependencies";
import { loadDependencies } from "./config/loadDependencies";
import { loadIpcs } from "./config/loadIpcs";
import { startHttpServer } from "./http/server";
import { setMainWindow } from "./mainWindow";

const options = parseOptions()

await installDependencies(options)
configureLock()

const serveApp = app.isPackaged ? serve({ directory: appPaths.renderer }) : null
app.on('ready', async () => {
    await loadDependencies(options)

    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: appPaths.icon,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: appPaths.preload,
            devTools: !app.isPackaged || options.devMode
        },
    });
    setMainWindow(mainWindow)

    await configureTitle()
    configureQuiting()
    configureTray()

    mainWindow.maximize()

    if (app.isPackaged) {
        if (!options.devMode) {
            Menu.setApplicationMenu(null)
        }

        serveApp!(mainWindow)
    }
    else {
        mainWindow.webContents.openDevTools()
        mainWindow.loadURL('http://localhost:8000')
    }
})

app.on('window-all-closed', app.quit)

await loadIpcs()
await startHttpServer()