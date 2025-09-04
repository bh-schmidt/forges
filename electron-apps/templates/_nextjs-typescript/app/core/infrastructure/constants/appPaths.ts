import { app } from "electron";
import { join } from "path";

export interface AppPaths {
    build: string
    buildUnpacked: string
    core: string
    renderer: string
    assets: string
    assetsUnpacked: string
    preload: string
    icon: string
    loading: string
}

const json = process.env['APP_PATHS']
export let appPaths: AppPaths = json ? JSON.parse(json) : undefined!

export function setAppPaths(indexDirectory: string) {
    const build = app.isPackaged ?
        join(process.resourcesPath, 'app.asar/_build') :
        join(indexDirectory, '../../')

    const buildUnpacked = app.isPackaged ?
        join(process.resourcesPath, 'app.asar.unpacked/_build') :
        build

    const core = join(build, 'core');
    const renderer = join(build, 'renderer');
    const assets = join(build, 'assets');
    const assetsUnpacked = join(buildUnpacked, 'assets');

    const preload = join(core, 'presentation/preload.js');
    const icon = join(assets, 'taskbar.ico')
    const loading = join(assets, 'loading.html')

    appPaths = {
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
}