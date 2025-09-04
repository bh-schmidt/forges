import { createForge, Utils, VariableMapper } from 'hyper-forge'
import z from 'zod'

const idValidation = z
    .string()
    .regex(/^[a-zA-Z0-9._-]+$/g, 'Invalid value, allowed characters: (a-z) (A-Z) (0-9) (_) (-) (.)')

const mapper = new VariableMapper({
    name: {
        description: 'Name of the IPC.',
        parser: z.string('Name is invalid.')
            .trim()
            .nonempty('Name is required.')
            .pipe(idValidation)
            .transform(arg => Utils.NamingConvention.convert(arg, 'kebab-case')),
    },
    camelCaseName: {
        source: 'name',
        parser: z.string()
            .transform(arg => Utils.NamingConvention.convert(arg, 'camelCase'))
    },
    pascalCaseName: {
        source: 'name',
        parser: z.string()
            .transform(arg => Utils.NamingConvention.convert(arg, 'PascalCase'))
    },
    context: {
        description: 'Context of the IPC.',
        parser: z.string('Context is invalid.')
            .trim()
            .default('')
            .pipe(idValidation)
            .transform(arg => Utils.NamingConvention.convert(arg, 'kebab-case'))
    },
    channel: {
        description: 'Channel in which the IPC will listen.',
        parser: z.string('Channel is invalid.')
            .trim()
            .nonempty('Channel is required.')
            .pipe(idValidation)
            .transform(arg => {
                const split = arg.split('.')
                    .map(e => Utils.NamingConvention.convert(e, 'kebab-case'))

                return split.join('.')
            })
    },
})

export default createForge()
    .registerVariables(mapper)
    .on('prompt', async hf => {
        await hf.prompts.prompt([
            {
                name: 'name',
                type: 'text',
                message: 'IPC Name:'
            },
            {
                name: 'context',
                type: 'text',
                message: 'IPC Context'
            },
            {
                name: 'channel',
                type: 'text',
                message: "IPC Channel:",
                initial(_, values) {
                    const name = values.name ?? ''
                    const context = values.context ?? ''

                    return mapper.parse('channel', `${context}.${name}`)
                }
            }
        ])
    })
    .on('prepare', async hf => {
        hf.paths.setTargetDir('app/core/presentation/ipcs')
    })
    .on('write', async hf => {
        await hf.memFs.inject('**/*')
    })