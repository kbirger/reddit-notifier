import * as daemon from './daemon';
import { PushbulletNotifier } from './pushbullet-notifier';
import { AlertTracker } from './alert-tracker';
import { Monitor } from './monitor';
import * as c from './constants';
import { readConfig, ensureConfigExists } from './config-reader';
import { parseArguments } from './args-parser';
import { NoopNotifier } from './noop-notifier';
import { mkdir } from 'shelljs';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import { consoleFormat } from './log-format';
const args = parseArguments(process.argv);



const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.splat(),
  ),
  transports: [
    new winston.transports.DailyRotateFile({
      filename: path.join(args.dataDir, 'reddit-notifier-%DATE%.log'),
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

logger.info('Config path: %s', args.configFile);
logger.info('Data path: %s', args.dataDir);
logger.info('Test Mode: %s', args.test);

const created = ensureConfigExists(args.configFile);
if (created) {
  logger.error(`Configuration file was not present at path '${args.configFile}'. A default was created. Please provide values and re-run the application`);
  process.exit(1);
}

const config = readConfig(args.configFile);

mkdir('-p', args.dataDir);

const notifier = args.test ?
  new NoopNotifier(logger) :
  new PushbulletNotifier(config.pushbullet);

const tracker = new AlertTracker(args.dataDir);
const monitor = new Monitor(config.monitor, notifier, tracker, logger);

logger.info('Starting...');
notifier.pushMessage(c.ApplicationName, 'Starting');
monitor.start();
daemon.start(() => monitor.verifyRunning(), logger);

process.on('exit', () => notifier.pushMessage(c.ApplicationName, 'Exiting'));


process.on('SIGTERM', function () {
  logger.info('Received STOP. Closing');
  notifier.pushMessage(c.ApplicationName, 'Received STOP. Closing')
  daemon.stop();
});