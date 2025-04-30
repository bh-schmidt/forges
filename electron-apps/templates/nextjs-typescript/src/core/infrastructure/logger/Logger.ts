import { TempPath } from "@shared/common/TempPath";
import { container, injectable } from "tsyringe";
import winston, { Logger } from "winston";
import 'winston-daily-rotate-file';

const path = TempPath.get('logs')

const rawFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
        return `[${timestamp}] ${level?.toUpperCase()}: ${message} ${metaStr}`
    })
)

const logger = winston.createLogger({
    format: rawFormat,
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                rawFormat,
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

@injectable()
export class AppLogger extends Logger { }

container.register(AppLogger, { useValue: logger })