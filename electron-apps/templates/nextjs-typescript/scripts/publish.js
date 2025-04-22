import { execa } from "execa";

const options = {
    stderr: process.stderr,
    stdout: process.stdout
}

await execa('npm run clear', options)
await execa('npm run build', options)
await execa('electron-builder', options)
