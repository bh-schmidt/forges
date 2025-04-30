import { app } from "electron";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const filePath = fileURLToPath(import.meta.url);
const directory = dirname(filePath)

const build = app.isPackaged ?
    join(process.resourcesPath, 'app.asar/build') :
    join(directory, '../../')

const buildUnpacked = app.isPackaged ?
    join(process.resourcesPath, 'app.asar.unpacked/build') :
    build

const core = join(build, 'core');
const renderer = join(build, 'renderer');
const assets = join(build, 'assets');
const assetsUnpacked = join(buildUnpacked, 'assets');

const preload = join(core, 'presentation/preload.js');
const icon = join(assets, 'taskbar.ico')
const loading = join(assets, 'loading.html')

export const appPaths = {
    build,
    buildUnpacked,
    core,
    renderer,
    assets,
    assetsUnpacked,
    preload,
    icon,
    loading
}