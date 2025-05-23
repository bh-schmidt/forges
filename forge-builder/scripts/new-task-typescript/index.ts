import { createForge } from 'hyper-forge'

export default createForge()
    .configureCommands(program => {
        program
            .option('--task-name <name>', 'The name of the new task.')
    })
    .validateOptions((option, value) => {
        if (option.name() == 'task-name') {
            if (!value || value.trim() == '')
                throw 'Invalid name'

            return true
        }
    })
    .on('prompt', async hf => {
        await hf.prompts.promptWithConfirmation([
            {
                name: 'taskName',
                type: 'text',
                message: 'Type the task name:',
                validate(value) {
                    if (!value || value.trim() == '') {
                        return 'Name is required'
                    }

                    return true
                }
            },
            {
                name: 'buildForge',
                type: 'toggle',
                message: 'Build the forge when finished?',
                initial: true,
                active: 'yes',
                inactive: 'no'
            },
        ])
    })
    .on('write', async hf => {
        await hf.memFs.inject('**/*')
    })
    .on('commit', async hf => {
        if (hf.variables.get('buildForge')) {
            await hf.program.runCommand('npm run build')
        }

        await hf.config.save()
    })