import { createForge, VariableMapper } from 'hyper-forge'
import z from 'zod'

const idValidation = z
    .string()
    .regex(/^[a-zA-Z0-9_-]+$/g, 'Invalid id, allowed characters: (a-z) (A-Z) (0-9) (_) (-).')

const mapper = new VariableMapper({
    projectName: {
        description: 'The name of the new project.',
        parser: z
            .string('Project name should be a string.')
            .trim()
            .nonempty('Project name is required.')
            .pipe(idValidation),
    },
    targetDirectory: {
        description: 'Target directory where the new project will be created.',
        parser: z.string('Invalid target directory.')
            .trim()
            .nonempty('Target directory is required.')
            .refine(value => !/[<>:"|?*\x00-\x1F]/.test(value), "Invalid directory.")
    },
})

export default createForge()
    .registerVariables(mapper)
    .on('prompt', async hf => {
        await hf.prompts.prompt([
            {
                name: 'projectName',
                type: 'text',
                message: 'Type the project name:',
            },
            {
                name: 'targetDirectory',
                type: 'text',
                message: 'Type the target directory:',
                initial(_, values) {
                    return `./${values.projectName}`
                },
            },
        ])
    })
    .on('prepare', async hf => {
        const targetDir =
            await hf.variables.get('targetDirectory') ??
            await hf.variables.get('projectName')

        hf.paths.setTargetDir(targetDir)
    })
    .on('write', async hf => {
        await hf.memFs.inject('**/*')
    })
    .on('commit', async hf => {
        // Saving the config even if empty is a good practice to help other tasks identify the root of the project.
        await hf.config.save()
    })