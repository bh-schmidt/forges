import { app, BrowserWindow } from "electron";
import serve from 'electron-serve';
import { availableParallelism } from "os";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

process.env.UV_THREADPOOL_SIZE = availableParallelism() as any

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const buildPath = resolve(join(__dirname, '../'))
const assetsPath = join(buildPath, 'assets')

const preloadPath = join(__dirname, 'preload.js')
const iconPath = join(assetsPath, 'taskbar.ico')
const rendererPath = join(buildPath, 'renderer')

export let mainWindow: BrowserWindow

const serveApp = app.isPackaged ? serve({ directory: rendererPath }) : null

app.on('ready', async () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: iconPath,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: preloadPath,
        },
    });

    mainWindow.maximize()

    if (app.isPackaged) {
        serveApp!(mainWindow)
    }
    else {
        mainWindow.webContents.openDevTools()
        mainWindow.loadURL('http://localhost:8000')
    }
})

app.on('window-all-closed', app.quit)