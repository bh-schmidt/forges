import { createForge } from 'hyper-forge'

export default createForge()
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
    .on('prompt', async hf => {
        await hf.prompts.promptWithConfirmation([
            {
                name: 'projectName',
                type: 'text',
                message: 'Type the project name:',
                validate(value) {
                    if (!value) {
                        return 'Project name is required'
                    }

                    return true
                }
            },
            {
                name: 'targetDirectory',
                type: 'text',
                message: 'Type the target directory:',
                initial(_, values) {
                    return `./${values.projectName}`
                },
                validate(value) {
                    if (!value || value.trim() == '') {
                        return 'Target directory is required'
                    }

                    if (/[<>:"|?*\x00-\x1F]/.test(value)) {
                        return "Invalid directory"
                    }

                    return true
                }
            },
        ])

        hf.paths.setTargetDir(hf.variables.get('targetDirectory')!)
    })
    .on('write', async hf => {
        await hf.memFs.inject('**/*')
    })
    .on('commit', async hf => {
        // Saving the config even if empty is a good practice to help other tasks identify the root of the project.
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
                "moment",
                "reflect-metadata",
                "tsyringe",
                "winston",
                "winston-daily-rotate-file",
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
                "tsc-alias",
                "typescript",
                "wait-on",
            ]
        })

        await hf.program.runCommand('hf', {
            args: [
                'run',
                'react-nextjs',
                'new-app-typescript',
                '--project-name',
                'renderer',
                '--target-directory',
                hf.paths.targetPath('app/renderer'),
                '--template',
                'electron',
                '--local-port',
                '8000',
                '--disable-prompt-confirmation',
            ],
        })

        await hf.program.runCommand('npm install')

        await hf.program.runCommand('hf', {
            args: [
                'config',
                'set',
                'forge',
                'targetDir',
                './renderer',
                '--forge',
                'react-nextjs'
            ]
        })
    })