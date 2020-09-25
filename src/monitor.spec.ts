import { Monitor } from './monitor';
import { IMock, It, Mock, Times } from 'typemoq';
import { IAlertTracker, IPushbulletNotifier, PostJson } from './interfaces';
import { Matcher } from './matcher';
import { Logger } from 'winston';
import RedditStream from 'reddit-stream';

jest.mock('reddit-stream');

describe('Monitor', () => {
  let mockNotifier: IMock<IPushbulletNotifier>;
  let mockAlertTracker: IMock<IAlertTracker>;
  let mockMatcher: IMock<Matcher>;
  let mockLogger: IMock<Logger>;
  let callbackNew: (posts: { data: PostJson }[]) => void;
  let callbackError: (err: any) => void;
  let monitor: Monitor;
  let redditStreamSpy: jest.SpyInstance;

  beforeEach(() => {
    mockNotifier = Mock.ofType<IPushbulletNotifier>();
    mockAlertTracker = Mock.ofType<IAlertTracker>();
    mockMatcher = Mock.ofType<Matcher>();
    mockLogger = Mock.ofType<Logger>();

    mockNotifier
      .setup(m => m.pushMessage(It.isAnyString(), It.isAnyString()))
      .returns(() => Promise.resolve());

    redditStreamSpy = jest.spyOn(RedditStream.prototype, 'on').mockImplementation((event: string, callback: (...args) => void) => {
      switch (event) {
        case 'new': {
          callbackNew = callback;
          return this;
          break;
        }
        case 'error': {
          callbackError = callback;
          return this;
          break;
        }
      }
    });

    monitor = new Monitor(
      { matches: { title: { any: [{ equals: 'foo' }] } }, subreddit: 'sub' },
      mockNotifier.object,
      mockAlertTracker.object,
      mockMatcher.object,
      mockLogger.object);
  });
  describe('start', () => {
    it('should subscribe to events', () => {
      // Arrange
      // Act
      monitor.start();

      // Assert
      expect(redditStreamSpy).toHaveBeenCalledTimes(2);
      expect(callbackNew).toBeDefined();
      expect(callbackError).toBeDefined();
    });

    it('should filter posts', () => {
      // Arrange
      mockMatcher
        .setup(m => m.matchPost(It.isAny(), It.isAnyObject(Object)))
        .returns((post: PostJson) => post.title === 'foo' || post.title === 'baz');

      mockAlertTracker
        .setup(m => m.isMoreRecentThanLastAlert(It.isAny()))
        .returns((ticks: number) => ticks === 123);

      // Act
      monitor.start();
      callbackNew([
        {
          data: {
            title: 'foo',
            created_utc: 123
          } as any
        },
        {
          data: {
            title: 'bar',
            created_utc: 999
          }
        },
        {
          data: {
            title: 'baz',
            created_utc: 456
          }
        }
      ]);

      // Assert
      mockNotifier
        .verify(m => m.pushMessage('New Matching Post', "'foo' at undefined by undefined"), Times.once());
      mockAlertTracker
        .verify(m => m.setLastAlerted(123), Times.once());
    });

    it('should log stream errors', () => {
      // Arrange
      // Act
      monitor.start();
      callbackError('fail');

      // Assert
      mockLogger.verify(m => m.error('fail'), Times.once());
    });

    it('should log notification errors', async () => {
      // Arrange
      mockNotifier.reset();
      mockNotifier
        .setup(m => m.pushMessage(It.isAnyString(), It.isAnyString()))
        .returns(() => Promise.reject('fail'));
      mockMatcher
        .setup(m => m.matchPost(It.isAny(), It.isAnyObject(Object)))
        .returns((post: PostJson) => post.title === 'foo' || post.title === 'baz');

      mockAlertTracker
        .setup(m => m.isMoreRecentThanLastAlert(It.isAny()))
        .returns(() => true);
      // Act
      monitor.start();
      callbackNew([
        {
          data: {
            title: 'foo'
          } as any
        }
      ]);

      // Assert
      await new Promise(setImmediate);
      mockLogger.verify(m => m.error('Failed to notify!\n%s', 'fail'), Times.once());
    });
  });

  describe('verifyRunning', () => {
    it('should do nothing when running', () => {

      // Arrange
      RedditStream.prototype.is_running = true;

      // Act
      monitor.start();

      monitor.verifyRunning();
    });

    it('should do nothing when running', () => {

      // Arrange
      RedditStream.prototype.is_running = false;

      // Act
      monitor.start();
      monitor.verifyRunning();

      // Assert
      expect(RedditStream.prototype.start).toHaveBeenCalledTimes(2);
      mockLogger.verify(m => m.info('stream not running. restarting.'), Times.once());
    });
  });
});