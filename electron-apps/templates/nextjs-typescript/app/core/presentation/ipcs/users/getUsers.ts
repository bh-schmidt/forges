import { UserDto } from "@domain/dtos/UserDto"
import { ipcPiscina } from "@shared/common/piscinas"
import { ResultObject } from "@shared/common/ResultObject"
import { workerPath } from "@shared/common/workerPath"
import { ipcMain } from "electron"

async function handler(): Promise<ResultObject<UserDto[]>> {
    return await ipcPiscina.run(null, {
        filename: workerPath('./worker.ts', import.meta.url)
    })
}

ipcMain.handle('users.get-users', async (_, ...args) => {
    const func = handler as (...params: any[]) => any
    return await func(...args)
})