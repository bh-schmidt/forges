import { ipcMain } from "electron"

async function handler(){
    return []
}

ipcMain.handle('GetUsers', async (_, ...args) => {
    const func = handler as (...params: any[]) => any
    return await func(...args)
})