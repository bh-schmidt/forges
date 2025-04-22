import { createForge } from 'hyper-forge'

export default createForge()
    .configureCommands(program => {
        program
            .option('--project-name <name>', 'The name of the new project.')
            .option('--target-dir <directory>', 'The directory to inject the files. Default is a mix between CWD and the Project Name.')
            .option('--template <template>', 'The predefined templated to generate')
    })
    .validateOptions((option, value) => {
        if (option.name() == 'project-name') {
            if (!value || value.trim() == '')
                throw 'Invalid project name'
        }

        if (option.name() == 'target-dir') {
            if (!value || value.trim() == '')
                return 'Invalid target directory'
        }

        if (option.name() == 'template') {
            if (!value || value.trim() == '')
                return 'Template is required'

            if (!['default', 'electron'].includes(value)) {
                return 'Invalid template. Allowed options: default, electron.'
            }
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
                name: 'targetDir',
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
            {
                name: 'template',
                type: 'select',
                message: 'Select the template:',
                initial: 0,
                choices: [
                    {
                        title: 'Default',
                        value: 'default'
                    },
                    {
                        title: 'Electron',
                        value: 'electron',
                    }
                ],
            }
        ])

        const targetDir = hf.variables.get('targetDir') ?? hf.variables.get('projectName')
        hf.paths.setTargetDir(targetDir)
    })
    .on('write', async hf => {
        await hf.memFs.inject('**/*', undefined, {
            ignore: [
                'src/types/Ipc.ts',
                'src/types/IpcChannels.ts',
            ]
        })

        if (hf.variables.get('template') == 'electron') {
            await hf.memFs.inject([
                'src/types/Ipc.ts',
                'src/types/IpcChannels.ts',
            ])
        }

        await hf.memFs.ensureDirectory('src/types')
        await hf.memFs.ensureDirectory('src/common')
        await hf.memFs.ensureDirectory('src/stores')
        await hf.memFs.ensureDirectory('src/states')
    })
    .on('commit', async hf => {
        await hf.program.runCommand('npm install', {
            args: [
                'react',
                'react-dom',
                'next',
                'moment',
                'zustand'
            ]
        })

        await hf.program.runCommand('npm install -D', {
            args: [
                'typescript',
                '@types/node',
                '@types/react',
                '@types/react-dom',
                'sass'
            ]
        })

        await hf.program.runCommand('npm install')

        await hf.config.save()
    })