import { Config } from './interfaces';
import * as fs from 'fs';
import { get } from 'lodash';
import { Logger } from 'winston';
import { readConfig } from './config-reader';


export function watch(configPath: string, logger: Logger): {
  stopWatching: () => void,
  currentConfig: Config
} {
  const initialConfig = readConfig(configPath);
  const configProxy = new ConfigProxy(configPath, initialConfig.config, initialConfig.hash, logger);

  return { currentConfig: configProxy.proxy, stopWatching: configProxy.stopWatching };
}

class ConfigProxy {
  private currentConfig: Config;
  private currentHash: string;
  public readonly stopWatching: () => void;


  constructor(configPath: string, initialConfig: Config, initialHash: string, private readonly logger: Logger) {
    const watcher = fs.watch(configPath, {
      persistent: true,
      encoding: 'utf8',
      recursive: false
    });

    this.currentConfig = initialConfig;
    this.currentHash = initialHash;
    this.stopWatching = () => watcher.close();
    watcher
      .on('change', () => {
        this.logger.info('Config file updated');
        const data = readConfig(configPath);
        if (data.hash !== this.currentHash) {
          this.currentConfig = data.config;
          this.currentHash = data.hash;
        } else {
          this.logger.info('No changes detected');
        }
      })
      .on('error', (error) => {
        this.logger.error('Error monitoring config changes', error);
      });
  }

  private getProxy(basePath: (string | number | symbol)[]) {
    return new Proxy(this, {
      get: (target, prop) => {
        const value = get(target, basePath)[prop];

        if (typeof value === 'object') {
          return this.getProxy(basePath.concat(prop));
        } else {
          return value;
        }
      },
      set: () => {
        throw new Error('Cannot change values on configuration');
      },
      ownKeys: (target) => {
        return Object.keys(get(target, basePath));
      },
      getOwnPropertyDescriptor: (target, prop) => {
        const value = get(target, basePath);
        return Object.getOwnPropertyDescriptor(value, prop);
      }
    });
  }

  /* istanbul ignore next */
  get rawConfig(): Config {
    return { ...this.currentConfig };
  }
  get proxy(): Config {
    return this.getProxy(['currentConfig']);
  }
}
