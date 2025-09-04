const { contextBridge, ipcRenderer } = require("electron")

const obj = {
    async send(channel, ...args) {
        return await ipcRenderer.invoke(channel, ...args)
    },
    listen(channel, callback) {
        const subscription = (_, ...args) => callback(...args)
        ipcRenderer.on(channel, subscription)

        return () => ipcRenderer.removeListener(channel, subscription)
    }
}

contextBridge.exposeInMainWorld('electron', obj)