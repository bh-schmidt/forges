import "reflect-metadata";
//
import { configureEnvironment } from "./config/configureEnvironment";
configureEnvironment()
//
import { app, BrowserWindow, Menu } from "electron";
import serve from 'electron-serve';
import { availableParallelism } from "os";
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

process.env.UV_THREADPOOL_SIZE = availableParallelism() as any
const options = parseOptions()

await installDependencies(options)
configureLock()

export let mainWindow: BrowserWindow
const serveApp = app.isPackaged ? serve({ directory: appPaths.renderer }) : null

app.on('ready', async () => {
    await loadDependencies(options)

    mainWindow = new BrowserWindow({
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