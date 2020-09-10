import { MESSAGE } from 'triple-beam';
import winston from 'winston';

export const consoleFormat = winston.format(info => {
  const restData = Object.assign({}, info, {
    level: undefined,
    message: undefined,
    splat: undefined,
    timestamp: undefined
  });

  let stringifiedRest = '';
  for (const [key, value] of Object.entries<unknown>(restData)) {
    if (value === undefined) {
      continue;
    }

    const formattedValue = value;
    stringifiedRest += `${key}: ${formattedValue}\n`;
  }

  const padding = info.padding && info.padding[info.level] || '';
  if (stringifiedRest !== '') {
    info[MESSAGE] = `${info.level}:${padding} ${info.message}\n${stringifiedRest}`;
  } else {
    info[MESSAGE] = `${info.level}:${padding} ${info.message}`;
  }

  return info;
});