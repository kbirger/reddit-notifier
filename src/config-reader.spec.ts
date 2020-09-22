import * as fs from 'fs';
import * as shell from 'shelljs';
import { ensureConfigExists, readConfig } from './config-reader';

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



  beforeEach(() => {
    jest.spyOn(fs, 'readFileSync').mockImplementation((path: string) => {
      if (path.endsWith('.json')) {
        return jsonConfig;
      } else if (path.endsWith('.js')) {
        return 'foo';
      } else {
        throw new Error('unexpected');
      }
    });
  });
  describe('readConfig', () => {
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

});