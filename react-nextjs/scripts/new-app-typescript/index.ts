import { createForge } from 'hyper-forge'

export default createForge()
    .configureCommands(program => {
        program
            .option('--project-name <name>', 'The name of the new project.')
            .option('--target-directory <directory>', 'The directory to inject the files.')
            .option('--template <template>', 'The predefined templated to generate')
            .option('--local-port <port>', 'The port used to run the app locally')
    })
    .validateOptions((option, value) => {
        if (option.name() == 'project-name') {
            if (!value || value.trim() == '')
                throw 'Invalid project name'
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
            },
            {
                name: 'localPort',
                type: 'number',
                message: 'Inform the port for running local:',
                initial: 3000,
            }
        ])

        hf.paths.setTargetDir(hf.variables.get('targetDirectory')!)
    })
    .on('write', async hf => {
        const electronFiles = [
            'src/common/ipc/**/*',
        ]
        await hf.memFs.inject('**/*', undefined, {
            ignore: electronFiles
        })

        if (hf.variables.get('template') == 'electron') {
            await hf.memFs.inject(electronFiles)
        }

        await hf.memFs.ensureDirectory('src/common/interfaces')
        await hf.memFs.ensureDirectory('src/common/types')
        await hf.memFs.ensureDirectory('src/common/enums')
        await hf.memFs.ensureDirectory('src/common/ipc')
        await hf.memFs.ensureDirectory('src/stores')
        await hf.memFs.ensureDirectory('src/states')
    })
    .on('commit', async hf => {
        console.log('path: ', hf.paths.targetPath())
        
        await hf.program.runCommand('npm install')

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