import { getMainWindow } from "@presentation/mainWindow"
import { ResultObject } from "@shared/common/ResultObject"
import { dialog, ipcMain, OpenDialogOptions } from "electron"

interface FileFilter {
    name?: string,
    extensions: string[]
}

type PathType = 'file' | 'directory'

interface Properties {
    multiple?: boolean
    showHiddenFiles?: boolean
    allowCreateDirectory?: boolean
    noResolveAliases?: boolean
    treatPackageAsDirectory?: boolean
    dontAddToRecent?: boolean
}

interface Input {
    title?: string
    type?: PathType
    filters?: FileFilter[]
    properties?: Properties
    defaultPath?: string
    buttonLabel?: string
    message?: string
}

async function handler(input: Input) {
    const props = input.properties ?? {}
    const properties: OpenDialogOptions['properties'] = []

    if (input.type == 'directory') {
        properties.push('openDirectory')
    } else {
        properties.push('openFile')
    }

    if (props.multiple) {
        properties.push('multiSelections')
    }

    if (props.showHiddenFiles) {
        properties.push('showHiddenFiles')
    }

    if (props.allowCreateDirectory) {
        properties.push('createDirectory')
    }

    if (props.noResolveAliases) {
        properties.push('noResolveAliases')
    }

    if (props.treatPackageAsDirectory) {
        properties.push('treatPackageAsDirectory')
    }

    if (props.dontAddToRecent) {
        properties.push('dontAddToRecent')
    }

    const result = await dialog.showOpenDialog(getMainWindow(), {
        title: input.title,
        message: input.message,
        properties: properties,
        buttonLabel: input.buttonLabel,
        defaultPath: input.defaultPath,
        filters: input.filters?.map(e => ({
            extensions: e.extensions,
            name: e.name ?? e.extensions.join(',')
        })),
    })

    return new ResultObject()
        .setValue(result.filePaths)
}

ipcMain.handle('dialogs.pick-path', async (_, ...args) => {
    const func = handler as (...params: any[]) => any
    return await func(...args)
})
