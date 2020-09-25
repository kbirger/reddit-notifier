#!bin/bash
/* istanbul ignore file */
import * as daemon from './daemon';
import { PushbulletNotifier } from './pushbullet-notifier';
import { AlertTracker } from './alert-tracker';
import { Monitor } from './monitor';
import * as c from './constants';
import { ensureConfigExists } from './config-reader';
import { parseArguments } from './args-parser';
import { NoopNotifier } from './noop-notifier';
import { mkdir } from 'shelljs';
import * as logging from './logger';
import { Matcher } from './matcher';
import { watch } from './config-proxy';

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

const { currentConfig, stopWatching } = watch(args.configFile, logger);

mkdir('-p', args.dataDir);

const notifier = args.test ?
  new NoopNotifier(logger) :
  new PushbulletNotifier(currentConfig.pushbullet);

const matcher = new Matcher(logger);
const tracker = new AlertTracker(args.dataDir);
const monitor = new Monitor(currentConfig.monitor, notifier, tracker, matcher, logger);

logger.info('Starting...');
notifier.pushMessage(c.ApplicationName, 'Starting');
monitor.start();
daemon.start(() => monitor.verifyRunning(), logger);

process.on('exit', () => notifier.pushMessage(c.ApplicationName, 'Exiting'));


process.on('SIGTERM', function () {
  logger.info('Received STOP. Closing');
  notifier.pushMessage(c.ApplicationName, 'Received STOP. Closing');
  stopWatching();
  daemon.stop();
});