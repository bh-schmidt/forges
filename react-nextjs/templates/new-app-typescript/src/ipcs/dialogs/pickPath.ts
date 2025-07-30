import { ipc } from "@/ipcs/ipc";

export interface FileFilter {
    name?: string,
    extensions: string[]
}

export type PathType = 'file' | 'directory'

export interface Properties {
    multiple?: boolean
    showHiddenFiles?: boolean
    allowCreateDirectory?: boolean
    noResolveAliases?: boolean
    treatPackageAsDirectory?: boolean
    dontAddToRecent?: boolean
}

export interface PickPathInput {
    title?: string
    type: PathType
    filters?: FileFilter[]
    properties?: Properties
    defaultPath?: string
    buttonLabel?: string
    message?: string
}

export async function pickPath(input: PickPathInput) {
    return await ipc.send<string[], string[]>('dialogs.pick-path', input)
}