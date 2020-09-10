import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { consoleFormat } from './log-format';
import path from 'path';
import * as c from './constants';

let logger: winston.Logger | null = null;
export function getLogger(): winston.Logger {
  if (logger === null) {
    throw new Error('Logging not initialized. Call init() first');
  }

  return logger;
}

export function init(dataDir: string): void {
  logger = createLogger(dataDir);
}

function createLogger(dataDir: string) {
  return winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.errors({ stack: true }),
      winston.format.splat(),
    ),
    transports: [
      new winston.transports.DailyRotateFile({
        filename: path.join(dataDir, `${c.ApplicationName}-%DATE%.log`),
        datePattern: 'YYYY-MM-DD',
        maxSize: '1m',
        maxFiles: '3d',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        )
      }),
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          consoleFormat()
        )
      })
    ],
  });

}
