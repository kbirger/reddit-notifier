import * as fs from 'fs';
import { Config } from './interfaces';
import { mkdir } from 'shelljs';
import * as path from 'path';

export function readConfig(configPath: string): Config {
  ensureConfigExists(configPath);

  const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  return {
    pushbullet: data.pushbullet,
    monitor: data.monitor
  };
}

/**
 * Creates a configuration at the target path if none exists. Returns true if config was created
 * @param configPath 
 */
export function ensureConfigExists(configPath: string): boolean {
  if (!fs.existsSync(configPath)) {
    mkdir('-p', path.dirname(configPath));
    fs.writeFileSync(configPath, getDefaultConfig());

    return true;
  }

  return false;
}


function getDefaultConfig() {
  const config = {

    pushbulletApiKey: 'ENTER VALUE',
    pushbulletDeviceId: 'ENTER VALUE'
  };

  return JSON.stringify(config, null, 2);
}