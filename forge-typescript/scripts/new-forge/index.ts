import { createForge } from 'file-forge'

export default createForge()
    .configureCommands(program => {
        program
            .option('--forge-name <name>', 'The name of the new forge.')
            .option('--target-dir <directory>', 'The directory to inject the files. Default is a mix between CWD and the Project Name.')
    })
    .validateOptions((option, value) => {
        if (option.name() == 'forge-name') {
            if (!value || value.trim() == '')
                throw 'Invalid forge name'

            return true
        }

        if (option.name() == 'target-dir') {
            if (!value || value.trim() == '')
                return 'Invalid target directory'

            return true
        }
    })
    .on('prompt', async ff => {
        await ff.prompts.promptWithConfirmation([
            {
                name: 'forgeName',
                type: 'text',
                message: 'Type the forge name:',
                validate(value) {
                    if (!value || value.trim() == '') {
                        return 'Forge name is required'
                    }

                    return true
                }
            },
            {
                name: 'targetDir',
                type: 'text',
                message: 'Type the target directory:',
                initial(_, values) {
                    return `./${values.forgeName}`
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
            {
                name: 'defaultTask',
                type: 'text',
                message: 'Type the name of the default task:',
                initial: '_default',
                validate(value) {
                    if (!value || value.trim() == '') {
                        return 'Default task name is required'
                    }

                    if (/[<>:"\/\\|?*\x00-\x1F]/.test(value)) {
                        return "Invalid task name"
                    }

                    return true
                }
            },
            {
                name: 'description',
                type: 'text',
                message: 'Set the description of your forge'
            },
            {
                name: 'autoLink',
                type: 'toggle',
                message: 'Automatically install the template? (npm link)',
                initial: true,
                active: 'yes',
                inactive: 'no'
            }
        ])

        const targetDir = ff.variables.get('targetDir') ?? ff.variables.get('forgeName')
        ff.paths.setTargetDir(targetDir)
    })
    .on('write', async ff => {
        await ff.memFs.inject('**/*')
    })
    .on('commit', async ff => {
        await ff.program.runCommand('npm install')

        if (ff.variables.get('autoLink')) {
            await ff.program.runCommand('npm link')
        }

        await ff.config.save()
    })