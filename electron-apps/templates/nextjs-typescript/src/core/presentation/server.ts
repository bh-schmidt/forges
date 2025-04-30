import { DependencyHandler } from "@infrastructure/handlers/dependency-handler/DependencyHandler";
import { AppLogger } from "@infrastructure/logs/Logger";
import express from "express";
import { queryParser } from "express-query-parser";
import { container } from "tsyringe";

const logger = container.resolve(AppLogger)

const initialPort = 49152;
export let httpPort = initialPort
const app = express()

app.use(queryParser({
    parseBoolean: true,
    parseNull: true,
    parseNumber: true,
    parseUndefined: true
}))

app.patch('/dependencies/:state', (req, res) => {
    const state = req.params.state == 'true'
    DependencyHandler.events.emit('install', state)
    res.send()
})

export async function startHttpServer(port?: number) {
    port ??= initialPort

    if (port > initialPort + 10) {
        throw new Error(`Couldn't start listen 10 ports. Stop trying.`)
    }

    return new Promise<void>(res => {
        logger.info('Starting server', { port })

        const server = app.listen(port, async () => {
            const address = server.address()
            if (!address) {
                logger.info(`Couldn't listen to port, trying next.`, { port })
                await startHttpServer(port + 1)
                res()
                return
            }

            httpPort = port
            res()
        })
    })
}