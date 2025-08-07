import { createForge } from 'hyper-forge'

export default createForge()
    .configureCommands(program => {
        program
            .option('--project-name <name>', 'The name of the new project.')
    })
    .validateOptions((option, value) => {
        if (option.name() == 'project-name') {
            if (!value || value.trim() == '')
                throw 'Invalid project name'

            return true
        }
    })
    .on('prompt', async hf => {
        // Putting any path into targetDirectory variable changes automatically the forge's targetDirectory
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
    })
    .on('write', async hf => {
        await hf.memFs.inject('**/*')
    })
    .on('commit', async hf => {
        // Saving the config even if empty is a good practice to help other tasks identify the root of the project.
        await hf.config.save()
    })