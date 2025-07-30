import { AppPath } from "@shared/common/AppPath";
import { singleton } from "tsyringe";
import winston from "winston";
import 'winston-daily-rotate-file';

const path = AppPath.getTemp('logs')

const rawFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp, ...meta }) => {
        const metaStr = Object.keys(meta).length ? '\n' + JSON.stringify(meta, undefined, 2) : '';
        return `[${timestamp}] ${level?.toUpperCase()}: ${message} ${metaStr}`
    })
)

const logger = winston.createLogger({
    format: rawFormat,
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                rawFormat,
                winston.format.colorize(),
            )
        }),

        new winston.transports.DailyRotateFile({
            dirname: path,
            filename: '%DATE%-raw.txt',
            datePattern: 'YYYY-MM-DD-HH',
            maxFiles: '30d',
        }),

        new winston.transports.DailyRotateFile({
            dirname: path,
            filename: '%DATE%-json.txt',
            datePattern: 'YYYY-MM-DD-HH',
            maxFiles: '30d',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json()
            )
        })
    ]
})

@singleton()
export class AppLogger {
    info(message: string, ...meta: any[]) {
        return this.handleLog(message, meta, logger.info)
    }

    error(message: string, ...meta: any[]) {
        return this.handleLog(message, meta, logger.error)
    }

    warn(message: string, ...meta: any[]) {
        return this.handleLog(message, meta, logger.warn)
    }

    debug(message: string, ...meta: any[]) {
        return this.handleLog(message, meta, logger.debug)
    }

    verbose(message: string, ...meta: any[]) {
        return this.handleLog(message, meta, logger.verbose)
    }

    private handleLog(message: string, meta: any[], logFunction: (...data: any[]) => void) {
        const newMeta = this.merge(meta)
        logFunction(message, newMeta)
        return this
    }

    private merge(meta: any[]) {
        const newMeta: any = {}
        const values: any = {}
        let valueIndex = -1

        meta ??= []
        for (const m of meta) {
            if (!m) {
                continue
            } else if (m instanceof Error) {
                newMeta['error'] = {
                    ...m,
                    message: m.message,
                    stack: m.stack,
                    name: m.name
                }
                continue
            }
            else if (typeof m == 'object') {
                Object.assign(newMeta, m)
                continue
            } else {
                valueIndex++
                values[valueIndex] = m
            }
        }

        if (valueIndex > 0) {
            newMeta["values"] = values
        }

        return newMeta
    }
}