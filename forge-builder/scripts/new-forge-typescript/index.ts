import { createForge, Utils, VariableMapper } from 'hyper-forge'
import z from 'zod'

const idValidation = z
    .string()
    .regex(/^[a-zA-Z0-9_-]+$/g, 'Invalid id, allowed characters: (a-z) (A-Z) (0-9) (_) (-).')

const mapper = new VariableMapper({
    forgeId: {
        description: 'Forge id of the new forge.',
        parser: z.string('Invalid forge id.')
            .trim()
            .nonempty('Forge id required.')
            .pipe(idValidation)
    },
    forgeName: {
        description: 'Name of the new forge.',
        parser: z.string('Invalid forge name.')
            .trim()
            .nonempty('Forge name required.')
    },
    forgeDescription: {
        description: 'Description of the new forge.',
        parser: z.string('Invalid forge description.')
            .default('')
    },
    targetDirectory: {
        description: 'Target directory where the new forge will be created.',
        parser: z.string('Invalid target directory.')
            .trim()
            .nonempty('Target directory is required.')
            .refine(value => !/[<>:"|?*\x00-\x1F]/.test(value), "Invalid directory.")
    },
    defaultTaskId: {
        description: 'Default task id.',
        parser: z.string('Invalid default task id.')
            .trim()
            .nonempty('Default task id is required.')
            .pipe(idValidation)
    },
    defaultTaskName: {
        description: 'Default task name.',
        parser: z.string('Invalid default task name.')
            .trim()
            .optional()
    },
    defaultTaskDescription: {
        description: 'Default task description.',
        parser: z.string('Invalid default task description.')
            .trim()
            .optional()
    },
    autoInstall: {
        description: 'Whether to automatically install the forge after its creation.',
        parser: z.coerce.boolean('Invalid variable: autoInstall.')
    },
    rebuildStrategy: {
        description: 'Rebuild strategy used at forge auto installation.',
        parser: z.literal(Utils.rebuildStrategies, `Invalid rebuild strategy.`)
    }
})

export default createForge()
    .registerVariables(mapper)
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
                'zod@4.0.15'
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