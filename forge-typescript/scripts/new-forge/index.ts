import { createForge, HyperForgeData } from 'hyper-forge'

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
    .on('prompt', async hf => {
        await hf.prompts.promptWithConfirmation([
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
                name: 'autoInstall',
                type: 'toggle',
                message: 'Automatically install the forge?',
                initial: true,
                active: 'yes',
                inactive: 'no'
            },
            {
                name: 'rebuildStrategy',
                type: (_, values) => values.autoInstall ? 'select' : false,
                message: 'Which is the rebuild strategy to use?',
                choices: HyperForgeData.rebuildStrategies.map(e => ({ title: e, value: e }))
            }
        ])

        const targetDir = hf.variables.get('targetDir') ?? hf.variables.get('forgeName')
        hf.paths.setTargetDir(targetDir)
    })
    .on('write', async hf => {
        await hf.memFs.inject('**/*')
    })
    .on('commit', async hf => {
        await hf.program.runCommand('npm install')

        if (hf.variables.get('autoInstall')) {
            await hf.program.runCommand(
                'hf install local-dir',
                {
                    args: [
                        hf.paths.targetPath(),
                        '--rebuild-strategy',
                        hf.variables.get('rebuildStrategy')!
                    ]
                })
        }

        await hf.config.save()
    })