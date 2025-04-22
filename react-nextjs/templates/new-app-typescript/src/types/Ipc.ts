import { IpcChannels } from "./IpcChannels"

interface ElectronIpc {
    send(channel: IpcChannels, ...args: unknown[]): Promise<unknown>
    listen(channel: IpcChannels, callback: (...args: unknown[]) => void): () => unknown
}

declare global {
    interface Window {
        electron: ElectronIpc
    }
}

export const ipc: ElectronIpc = {
    async send(channel, ...args) {
        return await window.electron.send(channel, ...args)
    },
    listen(channel, callback) {
        return window.electron.listen(channel, callback)
    }
}