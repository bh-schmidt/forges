export function workerPath(fileName: string, moduleUrl: string) {
    if (!fileName) {
        throw new Error('fileName is required')
    }

    fileName = fileName.replace(/[.]ts$/, '.js')

    return new URL(fileName, moduleUrl).href
}