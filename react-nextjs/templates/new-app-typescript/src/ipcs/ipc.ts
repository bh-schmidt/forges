import { ResultObject } from "@/common/classes/ResultObject"

interface ElectronIpc {
    send<TValue = any, TError = any>(channel: string, ...args: any[]): Promise<ResultObject<TValue, TError>>
    listen(channel: string, callback: (...args: any[]) => void): () => void
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
        const result = await window.electron.send(channel, ...args)
        return new ResultObject(result)
    },
    listen(channel, callback) {
        ensureClientSide()
        return window.electron.listen(channel, callback)
    }
}