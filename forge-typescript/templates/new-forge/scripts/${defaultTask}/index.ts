import { createForge } from 'file-forge'

export default createForge()
    .configureCommands(program => {
        program
            .option('--project-name <name>', 'The name of the new project.')
            .option('--target-dir <directory>', 'The directory to inject the files. Default is a mix between CWD and the Project Name.')
    })
    .validateOptions((option, value) => {
        if (option.name() == 'project-name') {
            if (!value || value.trim() == '')
                throw 'Invalid project name'

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
        ])

        const targetDir = ff.variables.get('targetDir') ?? ff.variables.get('projectName')
        ff.paths.setTargetDir(targetDir)
    })
    .on('write', async ff => {
        await ff.memFs.inject('**/*')
    })
    .on('commit', async ff => {
        // Saving the config even if empty is a good practice to help other tasks identify the root of the project.
        await ff.config.save()
    })