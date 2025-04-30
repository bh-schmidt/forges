import { IpcChannels } from "./IpcChannels"

interface ElectronIpc {
    send<T = unknown>(channel: IpcChannels, ...args: any[]): Promise<T>
    listen(channel: IpcChannels, callback: (...args: any[]) => void): () => void
}

declare global {
    interface Window {
        electron: ElectronIpc
    }
}

function ensureClientSide() {
    if (window === undefined)
        throw new Error(`Can't use ipc on server side component.`)
}

export const ipc: ElectronIpc = {
    async send(channel, ...args) {
        ensureClientSide()
        return await window.electron.send(channel, ...args)
    },
    listen(channel, callback) {
        ensureClientSide()
        return window.electron.listen(channel, callback)
    }
}