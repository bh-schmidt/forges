import { createForge, ForgeComposer, VariableMapper } from 'hyper-forge'
import z from 'zod'

const idValidation = z
    .string()
    .regex(/^[a-zA-Z0-9_-]+$/g, 'Invalid id, allowed characters: (a-z) (A-Z) (0-9) (_) (-).')

const map = new VariableMapper({
    projectName: {
        parser: z.string('Project name is required.')
            .trim()
            .nonempty('Project name is required.')
            .pipe(idValidation)
    },
    targetDirectory: {
        parser: z
            .string('Target directory is required.')
            .trim()
            .nonempty('Target directory is required.')
            .refine(arg => {
                return !/[<>:"|?*\x00-\x1F]/.test(arg)
            }, 'Invalid directory')
    }
}).withOptions({
    allowUnmapped: true
})

const reactComposer = new ForgeComposer({
    forgeId: 'react-nextjs',
    taskId: 'new-app-typescript',
    composerName: 'React options',
    initialVariables: {
        projectName: 'renderer',
        template: 'electron',
        localPort: 8000,
        targetDirectory: '.',
        SKIP_PROMPTS: ['projectName', 'template', 'localPort', 'targetDirectory'],
    }
})


export default createForge()
    .registerVariables(map)
    .configureCommands(program => {
        program
            .option('--project-name <name>', 'The name of the new project.')
            .option('--target-directory <directory>', 'The directory to inject the files.')
    })
    .validateOptions((option, value) => {
        if (option.name() == 'project-name') {
            if (!value || value.trim() == '')
                throw 'Invalid project name'

            return true
        }
    })
    .registerComposer(reactComposer)
    .on('prompt', async hf => {
        await hf.prompts.prompt([
            {
                name: 'projectName',
                type: 'text',
                message: 'Type the project name:',
                async validate(value) {
                    return await map.validate('projectName', value)
                }
            },
            {
                name: 'targetDirectory',
                type: 'text',
                message: 'Type the target directory:',
                initial(_, values) {
                    return `./${values.projectName}`
                },
                async validate(value) {
                    return await map.validate('targetDirectory', value)
                }
            },
        ])
    })
    .on('prepare', async hf => {
        const targetDirectory = await hf.variables.get('targetDirectory')
        hf.paths.setTargetDir(targetDirectory)
        const rendererDir = hf.paths.targetPath('app/renderer')
        reactComposer.paths.setTargetDir(rendererDir)
    })
    .on('write', async hf => {
        await hf.memFs.inject('**/*')
    })
    .on('commit', async hf => {
        await hf.config.save()

        await hf.program.runCommand('npm install')

        await hf.program.runCommand('npm install -w app/core', {
            args: [
                "commander",
                "electron-serve",
                "execa",
                "express",
                "express-query-parser",
                "fs-extra",
                "glob",
                "lodash",
                "dayjs",
                "reflect-metadata",
                "tsyringe",
                "winston",
                "winston-daily-rotate-file",
                "piscina"
            ]
        })

        await hf.program.runCommand('npm install -D -w app/core', {
            args: [
                "@types/concurrently",
                "@types/execa",
                "@types/express",
                "@types/fs-extra",
                "@types/jest",
                "@types/lodash",
                "@types/node",
                "electron",
                "electron-builder",
            ]
        })

        await hf.program.runCommand('npm install -D', {
            args: [
                "@types/execa",
                "@types/fs-extra",
                "execa",
                "fs-extra",
                "nodemon",
                "concurrently",
                "jest",
                "ts-jest",
                "ts-mockito",
                "ts-node",
                "tsc-alias",
                "typescript",
                "wait-on",
            ]
        })

        await hf.program.runCommand('npm install')

        await hf.config.set({
            key: 'INITIAL_DIRECTORY',
            value: './app/renderer',
            scope: 'forge',
            forgeId: 'react-nextjs'
        })
    })