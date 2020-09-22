import { Logger } from 'winston';
import * as r from './config-reader';
import * as fs from 'fs';
import { Config } from './interfaces';
import { watch } from './config-proxy';
import { cloneDeep } from 'lodash';

jest.mock('./config-reader');
jest.mock('fs');

describe('config-proxy', () => {
  let mockLogger: Logger;
  let onWatcherChange: () => unknown;
  let onWatcherError: (error) => unknown;
  let watchOnSpy: any;
  let config: Config;

  beforeEach(() => {
    config = {
      pushbullet: {
        apiKey: 'a',
        deviceId: 'b',
        encryptionKeyBase64: 'c'
      },
      monitor: {
        subreddit: 'test',
        matches: {
          title: {
            any: [{ matches: '.*' }]
          }
        }
      }
    };
    mockLogger = {
      log: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      warn: jest.fn()
    } as unknown as Logger;

    jest.spyOn(r, 'readConfig')
      .mockImplementation(() => ({ hash: JSON.stringify(config), config: cloneDeep(config) }));

    watchOnSpy = {
      on: jest.fn().mockImplementation((event, handler) => {
        switch (event) {
          case 'change': {
            onWatcherChange = handler;
            break;
          }
          case 'error': {
            onWatcherError = handler;
            break;
          }
        }
        return watchOnSpy;
      }),
      close: jest.fn()
    } as any;
    jest.spyOn(fs, 'watch').mockImplementation(() => watchOnSpy as any);
  });

  it('should return an instance with correct properties', () => {
    // Arrange
    const configPath = 'config.json';

    // Act
    const watchResult = watch(configPath, mockLogger);

    // Assert
    expect(watchResult.currentConfig.monitor.subreddit).toEqual('test');
  });

  it('should update on change', () => {
    // Arrange
    const configPath = 'config.json';
    const watchResult = watch(configPath, mockLogger);

    // Act
    config.monitor.subreddit = 'best';
    onWatcherChange();

    // Assert
    expect(watchResult.currentConfig.monitor.subreddit).toEqual('best');
    expect(mockLogger.info).toHaveBeenCalledWith('Config file updated');
    expect(mockLogger.info).toHaveBeenCalledTimes(1);
  });


  it('should not update on change when nothing changed', () => {
    // Arrange
    const configPath = 'config.json';
    const watchResult = watch(configPath, mockLogger);

    // Act
    onWatcherChange();

    // Assert
    expect(watchResult.currentConfig.monitor.subreddit).toEqual('test');
    expect(mockLogger.info).toHaveBeenCalledWith('Config file updated');
    expect(mockLogger.info).toHaveBeenCalledWith('No changes detected');
    expect(mockLogger.info).toHaveBeenCalledTimes(2);
  });

  it('should log watcher error', () => {
    // Arrange
    const configPath = 'config.json';
    const watchResult = watch(configPath, mockLogger);

    // Act
    onWatcherError('foo');

    // Assert
    expect(watchResult.currentConfig.monitor.subreddit).toEqual('test');
    expect(mockLogger.error).toHaveBeenCalledWith('Error monitoring config changes', 'foo');
    expect(mockLogger.error).toHaveBeenCalledTimes(1);
    expect(mockLogger.info).toHaveBeenCalledTimes(0);
  });

  it('should terminate watcher', () => {
    // Arrange
    const configPath = 'config.json';
    const watchResult = watch(configPath, mockLogger);

    // Act
    watchResult.stopWatching();

    // Assert
    expect(watchOnSpy.close).toHaveBeenCalled();
  });

  it('should error on set', () => {
    // Arrange
    const configPath = 'config.json';
    const watchResult = watch(configPath, mockLogger);

    // Assert
    expect(() => watchResult.currentConfig.monitor.subreddit = 'foo').toThrowError();
  });

  it('should list keys', () => {
    // Arrange
    const configPath = 'config.json';
    const watchResult = watch(configPath, mockLogger);

    // Act
    const keys = Object.keys(watchResult.currentConfig);

    // Assert
    expect(keys).toEqual(['pushbullet', 'monitor']);
  });

  it('should enumerate', () => {
    // Arrange
    const configPath = 'config.json';
    const watchResult = watch(configPath, mockLogger);
    const keys = [];

    // Act
    for (const k in watchResult.currentConfig) {
      keys.push(k);
    }

    // Assert
    expect(keys).toEqual(['pushbullet', 'monitor']);
  });
});