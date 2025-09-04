import { createForge, ForgeError, Utils, VariableMapper } from 'hyper-forge'
import z from 'zod'

const idValidation = z
    .string()
    .regex(/^[a-zA-Z0-9_-]+$/g, 'Invalid id, allowed characters: (a-z) (A-Z) (0-9) (_) (-).')

const mapper = new VariableMapper({
    taskId: {
        parser: z
            .string('Task id should be a string.')
            .trim()
            .nonempty('Task id is required.')
            .pipe(idValidation),
        description: 'The id of the new task.'
    },
    taskName: {
        description: 'Name of the new task.',
        parser: z.string('Invalid task name.')
            .trim()
            .optional()
    },
    taskDescription: {
        description: 'Description of the new task.',
        parser: z.string('Invalid task description.')
            .trim()
            .optional()
    },
    buildForge: {
        parser: z
            .coerce.boolean('Build forge should be a boolean.'),
        description: 'Whether to build the forge after finishing the task creation.'
    }
})

export default createForge()
    .registerVariables(mapper)
    .on('init', async hf => {
        if (!await hf.fs.existsTarget('package.json')) {
            throw new ForgeError(
                'There is no package.json in the target directory.',
                `This probably isn't a forge directory.\ntarget directory: ${hf.paths.targetPath()}`)
        }
    })
    .on('prompt', async hf => {
        await hf.prompts.prompt([
            {
                name: 'taskId',
                type: 'text',
                message: 'Task id:',
            },
            {
                type: 'text',
                name: 'taskName',
                message: 'Task name:',
                initial(_, values) {
                    const name = Utils.NamingConvention.convert(values.taskId, 'Pascal Phrase Case')!
                    return name
                }
            },
            {
                type: 'text',
                name: 'taskDescription',
                message: 'Task description:',
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

        const values = await hf.variables.getValues()

        if (values.taskName || values.taskDescription) {
            const buffer = await hf.fs.readFileTarget("package.json")
            const json = buffer!.toString()
            const obj = JSON.parse(json)

            obj['forge'] ??= {}
            obj['forge'][values.taskId] ??= {}

            if (values.taskName) {
                obj['forge'][values.taskId]['name'] = values.taskName
            }

            if (values.taskDescription) {
                obj['forge'][values.taskId]['description'] = values.taskDescription
            }

            const match = json.match(/\n( +)/)
            const indentation = match?.[1]?.length ?? 2
            const newJson = JSON.stringify(obj, null, indentation)
            await hf.memFs.writeFile('package.json', newJson, { ifFileExists: 'replace' })
        }
    })
    .on('commit', async hf => {
        if (await hf.variables.get('buildForge')) {
            await hf.program.runCommand('npm run build')
        }

        await hf.config.save()
    })