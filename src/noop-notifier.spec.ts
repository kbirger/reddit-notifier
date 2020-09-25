import { It, Mock, Times } from 'typemoq';
import { Logger } from 'winston';
import { NoopNotifier } from './noop-notifier';

describe('NoopNotifier', () => {
  it('shall log to the logger', async () => {
    // Arrange
    const mockLogger = Mock.ofType<Logger>();
    const notifier = new NoopNotifier(mockLogger.object);

    // Act
    await notifier.pushMessage('foo', 'bar');

    // Assert
    mockLogger
      .verify(m => m.info(It.isAnyString(), It.isAnyString(), It.isAnyString()), Times.once());

  });
});