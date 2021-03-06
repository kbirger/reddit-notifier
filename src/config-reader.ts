import * as fs from 'fs';
import { Config } from './interfaces';
import { mkdir } from 'shelljs';
import * as path from 'path';
import * as crypto from 'crypto';
import Ajv from 'ajv';

interface FileData {
  data: Config;
  hash: string;
}

function readFile(configPath: string): { data: string, hash: string } {
  const data = fs.readFileSync(configPath, 'utf8');
  const hash = getHash(data);

  return { data, hash };
}

function parseJson(configPath: string): FileData {
  const data = readFile(configPath);

  return {
    data: JSON.parse(data.data) as Config,
    hash: data.hash
  };

}

function parseJs(configPath: string): FileData {
  delete require.cache[configPath];
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const data = require(configPath) as Config;

  return {
    data: data,
    hash: readFile(configPath).hash
  };
}

export function readConfig(configPath: string): { config: Config, hash: string } {
  ensureConfigExists(configPath);

  let data: Config;
  let hash: string;
  switch (path.extname(configPath)) {
    case '.json': {
      const jsonData = parseJson(configPath);
      data = jsonData.data;
      hash = jsonData.hash;
      break;
    }
    case '.js': {
      const jsData = parseJs(configPath);
      data = jsData.data;
      hash = jsData.hash;
      break;
    }
    default: {
      throw new Error('Config must be either a .js or .json file');
    }
  }

  validateConfig(data);

  return {
    config:
    {
      pushbullet: data.pushbullet,
      monitor: data.monitor
    },
    hash: hash
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



//const ajv
export function validateConfig(config: Config): { status: boolean, errors?: any[] } {
  const data = fs.readFileSync(path.join(__dirname, 'schemas/interfaces.json'), 'utf8');
  const schema = JSON.parse(data);

  const schemaId = 'http://reddit-validator.local/schemas/interfaces.json';
  const ajv = new Ajv({ schemas: [{ ...schema, $id: schemaId }] });
  // const validate = ajv.getSchema(`${schemaId}#/definitions/Config`);

  // famous last words: as long as nobody puts $async in our schema, this must be a boolean
  const result = ajv.validate(`${schemaId}#/definitions/Config`, config) as boolean;
  return {
    status: result,
    errors: ajv.errors || undefined
  };
}

function getDefaultConfig() {
  const config = {
    'pushbullet': {
      'apiKey': 'VALUE_HERE',
      'deviceId': 'VALUE_HERE',
      'encryptionKeyBase64': 'VALUE_HERE'
    },
    'monitor': {
      'subreddit': 'SUBREDDIT_HERE',
      'matches': {
        'title': {
          'any': [
            {
              'matches': '.*'
            }
          ],
        },
      }
    }
  };

  return JSON.stringify(config, null, 2);
}

export function getHash(data: string): string {
  const hash = crypto.createHash('sha256');
  return hash.update(data).digest('base64');
}