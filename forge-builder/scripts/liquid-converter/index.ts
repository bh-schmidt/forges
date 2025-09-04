import { createForge, ForgeError, Utils, VariableMapper } from 'hyper-forge'
import { isText } from 'istextorbinary'
import { basename } from 'path'
import z from 'zod'

function getExtension(path: string) {
    return path.match(/[^\/\\.]+$/)?.[0]
}

const mapper = new VariableMapper({
    convertAllTasks: {
        description: 'If it should convert all tasks',
        parser: z.coerce.boolean(`'convertAllTasks' should be a boolean.`)
            .default(false)
    },
    taskId: {
        description: 'Id of the task that should be converted.',
        parser: z.string(`'taskId' should be a string.`)
    },
    extensions: {
        description: 'The extensions that should be converted to liquid.',
        parser: z.union([z.string(), z.array(z.string())], 'The extensions should be a string separated by comma or an array of strings.')
            .transform(arg => {
                if (typeof arg == 'string') {
                    return arg.split(',')
                        .map(e => e.trim())
                        .filter(e => e)
                }

                return arg
            })
            .refine(arg => arg.length > 0, 'There should be at least one extension.')
    },
    convertAllFiles: {
        description: 'If all files should be converted with the informed extensions should be converted to liquid.',
        parser: z.coerce
            .boolean(`'convertAllFiles' should be a boolean`)
            .default(false)
    },
    fileNames: {
        description: 'Paths of the files that should be converted to liquid.',
        parser: z.union([z.string(), z.array(z.string())], 'The filenames should be a string separated by comma or an array of strings.')
            .transform(arg => {
                if (typeof arg == 'string') {
                    return arg.split(',')
                        .map(e => e.trim())
                        .filter(e => e)
                }

                return arg
            })
            .refine(arg => arg.length > 0, 'There should be at least one filename.')
    },
    saveExtensions: {
        description: 'If the informed extensions should be saved and be used automatically at next conversion.',
        parser: z.coerce
            .boolean('Save extensions should be a boolean')
            .default(false)
    }
})

export default createForge()
    .registerVariables(mapper)
    .on('init', async hf => {
        if (!await hf.fs.existsTarget('package.json')) {
            throw new ForgeError(
                'There is no package.json in the target directory.',
                `This probably isn't a forge directory.\ntarget directory: ${hf.paths.targetPath()}`)
        }

        if (!await hf.fs.existsTarget('templates')) {
            throw new ForgeError(
                'There is no templates folder in the target directory.',
                `This probably isn't a forge directory.\ntarget directory: ${hf.paths.targetPath()}`)
        }
    })
    .on('prompt', async hf => {
        let files: string[] = []
        let textExtensions: Set<string>

        await hf.prompts.prompt([
            {
                name: 'convertAllTasks',
                type: 'toggle',
                message: "Convert all tasks?",
                active: 'Yes',
                inactive: 'No',
                initial: false
            },
            {
                name: 'taskId',
                type: 'select',
                message: 'Task id:',
                choices() {
                    const folders = Utils.GlobberSync.getAll("*/", {
                        cwd: hf.paths.targetPath('templates')
                    })

                    const ids = folders.map(e => basename(e))
                    return ids.map(e => ({
                        title: e,
                        value: e
                    }))
                }
            },
            {
                name: 'extensions',
                type: 'multiselect',
                message: 'Extensions:',
                choices(_, values) {
                    if (values.convertAllTasks) {
                        files = Utils.GlobberSync.getAll('**/*', {
                            nodir: true,
                            cwd: hf.paths.targetPath('templates')
                        })
                    }
                    else {
                        files = Utils.GlobberSync.getAll(`**/*`, {
                            nodir: true,
                            cwd: hf.paths.targetPath(`templates/${values.taskId}`)
                        })
                    }

                    const extensions = [
                        ...new Set(
                            files.map(e => getExtension(e)!)
                        )
                    ].filter(e => isText(e))

                    textExtensions = new Set(extensions)

                    return extensions.map(e => ({
                        title: e,
                        value: e
                    }))
                }
            },
            {
                name: 'convertAllFiles',
                type: 'toggle',
                message: 'Convert all files?',
                active: 'Yes',
                inactive: 'No',
                initial: false
            },
            {
                name: 'fileNames',
                type: 'multiselect',
                message: 'File names:',
                choices() {
                    const newFiles = files
                        .filter(e => textExtensions.has(getExtension(e)!))

                    return newFiles.map(e => ({
                        title: e,
                        value: e
                    }))
                }
            },
            {
                name: 'saveExtensions',
                type: 'toggle',
                message: 'Save extensions?',
                active: 'Yes',
                inactive: 'No',
                initial: false
            },
        ])
    })
    .on('write', async hf => {
        // await hf.memFs.copy('**/*')
    })