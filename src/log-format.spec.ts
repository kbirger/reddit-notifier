import { consoleFormat } from './log-format';

describe('log-format', () => {
  it('should format message without metadata', () => {
    // Arrange
    const format = consoleFormat();

    // Act
    const result = format.transform({ message: 'foo', level: 'warn' });

    // Assert
    expect(result[Symbol.for('message')]).toEqual('warn: foo');
  });

  it('should format message metadata', () => {
    // Arrange
    const format = consoleFormat();

    // Act
    const result = format.transform({ message: 'foo', level: 'warn', error: 'oh no' });

    // Assert
    expect(result[Symbol.for('message')]).toEqual('warn: foo\nerror: oh no\n');
  });

  it('should format with padding', () => {
    // Arrange
    const format = consoleFormat();

    // Act
    const result = format.transform({ message: 'foo', level: 'info', padding: { info: 'x' } });

    // Assert
    expect(result[Symbol.for('message')]).toEqual('info:x foo');
  });
});