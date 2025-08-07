import { createForge, VariableMapper } from 'hyper-forge'
import z from 'zod'

const idValidation = z
    .string()
    .regex(/^[a-zA-Z0-9_-]+$/g, 'Invalid id, allowed characters: (a-z) (A-Z) (0-9) (_) (-).')

const pathValidation = z.string()
    .refine(value => !/[<>:"|?*\x00-\x1F]/.test(value), "Invalid directory.")

const templates = [
    {
        title: 'Default',
        value: 'default'
    },
    {
        title: 'Electron',
        value: 'electron',
    }
]

const mapper = new VariableMapper({
    projectName: {
        parser: z.string('Invalid project name.')
            .trim()
            .nonempty('Project name is required.')
            .pipe(idValidation)
    },
    targetDirectory: {
        parser: z.string('Invalid target directory.')
            .trim()
            .nonempty('Target directory is required.')
            .pipe(pathValidation)
    },
    template: {
        parser: z.literal(templates.map(e => e.value), 'Invalid template.')
    },
    localPort: {
        parser: z.coerce
            .number('Invalid port.')
            .min(1, 'Invalid port.')
    }
})

export default createForge()
    .registerVariables(mapper)
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
        await hf.prompts.prompt([
            {
                name: 'projectName',
                type: 'text',
                message: 'Type the project name:',
                validate(value) {
                    return mapper.validate('projectName', value)
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
                    return mapper.validate('targetDirectory', value)
                }
            },
            {
                name: 'template',
                type: 'select',
                message: 'Select the template:',
                initial: 0,
                choices: templates,
                validate(value) {
                    return mapper.validate('template', value)
                }
            },
            {
                name: 'localPort',
                type: 'number',
                message: 'Inform the port for running local:',
                initial: 3000,
                validate(value) {
                    return mapper.validate('localPort', value)
                }
            }
        ])
    })
    .on('prepare', async hf => {
        const dir = await hf.variables.get('targetDirectory')!
        hf.paths.setTargetDir(dir)
    })
    .on('write', async hf => {
        const electronFiles = [
            'src/common/classes/ResultObject.ts',
            'src/common/components/path-picker/**/*',
            'src/common/ipcs/**/*',
        ]

        await hf.memFs.inject('**/*', undefined, {
            ignore: electronFiles
        })

        if (await hf.variables.get('template') == 'electron') {
            await hf.memFs.inject(electronFiles)
        }

        await hf.memFs.ensureDirectory('src/common/interfaces')
        await hf.memFs.ensureDirectory('src/common/types')
        await hf.memFs.ensureDirectory('src/common/enums')
        await hf.memFs.ensureDirectory('src/stores')
        await hf.memFs.ensureDirectory('src/states')
    })
    .on('commit', async hf => {
        await hf.program.runCommand('npm install')

        await hf.program.runCommand('npm install', {
            args: [
                'react',
                'react-dom',
                'next',
                'dayjs',
                'zustand',
                'set-interval-async'
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