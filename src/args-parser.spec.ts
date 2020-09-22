import { parseArguments } from './args-parser';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

// jest.mock('fs');
jest.mock('process');
describe('args-parser', () => {
  it('should return defaults', () => {
    // Arrange
    const args = [];

    // Act
    const parsed = parseArguments(args);

    // Assert
    expect(parsed.test).toBeFalsy();
    expect(parsed.configFile).toEqual(path.join(os.homedir(), '.reddit-notifier', 'config.json'));
    expect(parsed.dataDir).toEqual(path.join(os.homedir(), '.reddit-notifier', 'data'));
  });

  it('should resolve all arguments', () => {
    // Arrange
    const args = [
      'bin',
      'script',
      '-d',
      'foo',
      '-c',
      'bar',
      '-t'
    ];

    // Act
    const parsed = parseArguments(args);

    // Assert
    expect(parsed.dataDir).toEqual('foo');
    expect(parsed.configFile).toEqual('bar');
    expect(parsed.test).toBeTruthy();
  });
});