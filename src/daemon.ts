import { Logger } from 'winston';

let timer;
let cycle_stop = false;
var INTERVAL = 1000;

function cycle(onTick: () => void, logger: Logger) {
  timer = setTimeout(function () {
    if (!cycle_stop) {
      onTick()
      cycle(onTick, logger);
    } else {
      logger.info('exiting with 1')
      process.exit(1);
    }
  }, INTERVAL);
};


export function stop() {
  cycle_stop = true;
  clearTimeout(timer);
}


export function start(onTick: () => void, logger: Logger) {
  cycle(onTick, logger);
}