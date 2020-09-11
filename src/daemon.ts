import { Logger } from 'winston';

let timer;
const INTERVAL = 1000;

function cycle(onTick: () => void, logger: Logger) {
  timer = setTimeout(function () {
    onTick();
    cycle(onTick, logger);
  }, INTERVAL);
}


export function stop(): void {
  clearTimeout(timer);
}


export function start(onTick: () => void, logger: Logger): void {
  cycle(onTick, logger);
}