import { createForge, VariableMapper } from 'hyper-forge'

const mapper = new VariableMapper({
})

export default createForge()
    .registerVariables(mapper)
    .on('write', async hf => {
        await hf.memFs.copy('**/*')
    })