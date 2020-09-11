#!bin/bash
import * as daemon from './daemon';
import { PushbulletNotifier } from './pushbullet-notifier';
import { AlertTracker } from './alert-tracker';
import { Monitor } from './monitor';
import * as c from './constants';
import { readConfig, ensureConfigExists } from './config-reader';
import { parseArguments } from './args-parser';
import { NoopNotifier } from './noop-notifier';
import { mkdir } from 'shelljs';
import * as logging from './logger';
import { Matcher } from './matcher';

const args = parseArguments(process.argv);
logging.init(args.dataDir);


const logger = logging.getLogger();
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

const matcher = new Matcher(logger);
const tracker = new AlertTracker(args.dataDir);
const monitor = new Monitor(config.monitor, notifier, tracker, matcher, logger);

logger.info('Starting...');
notifier.pushMessage(c.ApplicationName, 'Starting');
monitor.start();
daemon.start(() => monitor.verifyRunning(), logger);

process.on('exit', () => notifier.pushMessage(c.ApplicationName, 'Exiting'));


process.on('SIGTERM', function () {
  logger.info('Received STOP. Closing');
  notifier.pushMessage(c.ApplicationName, 'Received STOP. Closing');
  daemon.stop();
});