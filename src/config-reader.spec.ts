import * as fs from 'fs';
import * as shell from 'shelljs';
import { ensureConfigExists, readConfig, validateConfig } from './config-reader';

jest.mock('fs');
jest.mock('shelljs', () => {
  return {
    mkdir: jest.fn()
  };
});

describe('config-reader', () => {
  const jsonConfig = `{
    "pushbullet": {
      "apiKey": "",
      "deviceId": "",
      "encryptionKeyBase64": ""
    },
    "monitor": {
      "subreddit": "test",
      "matches": {
        "title": {
          "any": [{ "equals": "foo" }]
        }
      }
    }
  }`;



  describe('readConfig', () => {
    beforeEach(() => {
      jest.spyOn(fs, 'readFileSync').mockImplementation((path: any) => {
        if (path.includes('schemas')) {
          return jest.requireActual('fs').readFileSync(path, 'utf8');
        }
        if (path.endsWith('.json')) {
          return jsonConfig;
        } else if (path.endsWith('.js')) {
          return 'foo';
        } else {
          throw new Error('unexpected');
        }
      });
    });

    it('should load json config', () => {
      // Arrange

      // Act
      const config = readConfig('foo.json');

      // Assert
      expect(config.config.monitor.subreddit).toEqual('test');
      expect(config.hash).toEqual('sGnno8NFjScxl6Ct3jC/f99uhlrcwW/PLX0MCo9ByHU=');
    });

    it('should load js config', () => {
      // todo: figure out how to mock this with jest.
      // warning: this test does a real `require` on the js file
      // changing the js file may cause breakages.
      // the hash is still mocked to `sha256('foo')`, but changing
      // the subreddit, or the value of the `matches` field will break

      // Arrange

      // Act
      const config = readConfig('../examples/config.js');

      // Assert
      expect(config.config.monitor.subreddit).toEqual('test');
      expect(config.config.monitor.matches).toBeInstanceOf(Function);
      expect(config.hash).toEqual('LCa0a2j/xo/5m0U8HTBBNBNCLXBkg7+g+YpeiGJm564=');
    });

    it('should throw when trying to read a txt', () => {
      // Assert
      expect(() => readConfig('foo.txt')).toThrowError();
    });
  });

  describe('ensureConfigExists', () => {
    it('should return true when config is missing', () => {
      // Arrange
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);

      // Assert
      expect(ensureConfigExists('blah')).toBeTruthy();
      expect(shell.mkdir).toHaveBeenCalledWith('-p', '.');
    });

    it('should return false when config exists', () => {
      // Arrange
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);

      // Assert
      expect(ensureConfigExists('blah')).toBeFalsy();
    });
  });

  describe('validateConfig', () => {
    beforeEach(() => {
      const realFs = jest.requireActual('fs');
      (fs.readFileSync as unknown as jest.SpyInstance).mockImplementation(realFs.readFileSync);
    });
    it('should return true for a valid config', () => {
      // Arrange
      const config = JSON.parse(jsonConfig);

      // Act
      const result = validateConfig(config);

      // Assert
      expect(result.status).toBeTruthy();
    });

    it('should return false for an invalid config', () => {
      // Arrange
      const config = JSON.parse(jsonConfig);
      config.monitor.matches = ['bad value'];

      // Act
      const result = validateConfig(config);

      // Assert
      expect(result.status).toBeFalsy();
      expect(result.errors).toEqual([{
        'dataPath': '.monitor.matches',
        'keyword': 'type',
        'message': 'should be object',
        'params': { 'type': 'object' },
        'schemaPath': '#/type'
      }]);
    });
  });
});