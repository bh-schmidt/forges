import { AppLogger } from "@infrastructure/logger/Logger";
import express from "express";
import { queryParser } from "express-query-parser";
import { container } from "tsyringe";
import depencencies from "./routes/dependencies";

const initialPort = 49152;
export let httpPort = initialPort
export const app = express()

export async function startHttpServer(port?: number) {
    const logger = container.resolve(AppLogger)
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

app.use(queryParser({
    parseBoolean: true,
    parseNull: true,
    parseNumber: true,
    parseUndefined: true
}))

app.use("/dependencies", depencencies)