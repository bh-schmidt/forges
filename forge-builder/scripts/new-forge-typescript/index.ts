import { createForge, Utils, VariableMapper } from 'hyper-forge'
import z from 'zod'

const idValidation = z
    .string()
    .regex(/^[a-zA-Z0-9_-]+$/g, 'Invalid id, allowed characters: (a-z) (A-Z) (0-9) (_) (-).')

const mapper = new VariableMapper({
    // rename names for ids
    // add names
    forgeId: {
        parser: z.string('Invalid forge id.')
            .trim()
            .nonempty('Forge id required.')
            .pipe(idValidation)
    },
    forgeName: {
        parser: z.string('Invalid forge name.')
            .trim()
            .nonempty('Forge name required.')
    },
    forgeDescription: {
        parser: z.string('Invalid forge description.')
            .default('')
    },
    targetDirectory: {
        parser: z.string('Invalid target directory.')
            .trim()
            .nonempty('Target directory is required.')
            .refine(value => !/[<>:"|?*\x00-\x1F]/.test(value), "Invalid directory.")
    },
    defaultTaskId: {
        parser: z.string('Invalid default task id.')
            .trim()
            .nonempty('Default task id is required.')
            .pipe(idValidation)
    },
    defaultTaskName: {
        parser: z.string('Invalid default task name.')
            .trim()
            .nonempty('Default task name is required.')
    },
    defaultTaskDescription: {
        parser: z.string('Invalid default task description.')
            .trim()
            .nonempty('Default task description is required.')
    },
    autoInstall: {
        parser: z.coerce.boolean('Invalid variable: autoInstall.')
    },
    rebuildStrategy: {
        parser: z.literal(Utils.rebuildStrategies, `Invalid rebuild strategy.`)
    }
})

export default createForge()
    .registerVariables(mapper)
    .configureCommands(program => {
        program
            .option('--forge-name <name>', 'The name of the new forge.')
            .option('--target-directory <directory>', 'The directory to inject the files.')
    })
    .validateOptions((option, value) => {
        if (option.name() == 'forge-name') {
            if (!value || value.trim() == '')
                throw 'Invalid forge name'

            return true
        }
    })
    .on('prompt', async hf => {
        await hf.prompts.prompt([
            {
                name: 'forgeId',
                type: 'text',
                message: 'Type the new forge id:',
                validate(value) {
                    return mapper.validate('forgeId', value)
                }
            },
            {
                name: 'forgeName',
                type: 'text',
                message: 'Type the new forge name:',
                initial(_, values) {
                    return values.forgeId
                },
                validate(value) {
                    return mapper.validate('forgeName', value)
                }
            },
            {
                name: 'forgeDescription',
                type: 'text',
                message: 'Set the description of your forge',
                initial: 'Scaffolds files and folders based on customizable tasks',
                validate(value) {
                    return mapper.validate('forgeDescription', value)
                }
            },
            {
                name: 'targetDirectory',
                type: 'text',
                message: 'Type the target directory:',
                initial(_, values) {
                    return `./${values.forgeId}`
                },
                validate(value) {
                    return mapper.validate('targetDirectory', value)
                }
            },
            {
                name: 'defaultTaskId',
                type: 'text',
                message: 'Type the id of the default task:',
                initial: '_default',
                validate(value) {
                    return mapper.validate('defaultTaskId', value)
                }
            },
            {
                name: 'defaultTaskName',
                type: 'text',
                message: 'Type the name of the default task:',
                initial: 'Default',
                validate(value) {
                    return mapper.validate('defaultTaskName', value)
                }
            },
            {
                name: 'defaultTaskDescription',
                type: 'text',
                message: 'Type the description of the default task:',
                initial: 'Creates a new folder and injects the template files',
                validate(value) {
                    return mapper.validate('defaultTaskName', value)
                }
            },
            {
                name: 'autoInstall',
                type: 'toggle',
                message: 'Automatically install the forge?',
                initial: true,
                active: 'yes',
                inactive: 'no',
                validate(value) {
                    return mapper.validate('autoInstall', value)
                }
            },
            {
                name: 'rebuildStrategy',
                type: (_, values) => values.autoInstall ? 'select' : false,
                message: 'Which is the rebuild strategy to use?',
                choices: Utils.rebuildStrategies.map(e => ({ title: e, value: e })),
                validate(value) {
                    return mapper.validate('autoInstall', value)
                }
            }
        ])
    })
    .on('prepare', async hf => {
        const dir = await hf.variables.get('targetDirectory')
        hf.paths.setTargetDir(dir)
    })
    .on('write', async hf => {
        await hf.memFs.inject('**/*')
    })
    .on('commit', async hf => {
        await hf.program.runCommand('npm install')

        await hf.program.runCommand('npm install', {
            args: [
                'hyper-forge',

                // fix zod version
                'zod'
            ]
        })

        await hf.program.runCommand('npm install -D', {
            args: [
                '@types/node',
                'nodemon',
                'tsc-alias',
                'typescript',
            ]
        })

        if (await hf.variables.get('autoInstall')) {
            Utils.ForgeInstaller.installForge({
                type: 'directory',
                replace: true,
                args: {
                    directory: hf.paths.targetPath(),
                    rebuildStrategy: await hf.variables.get('rebuildStrategy')
                }
            })
        }

        await hf.config.save()
    })