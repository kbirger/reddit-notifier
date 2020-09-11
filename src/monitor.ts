import RedditStream from 'reddit-stream';
import { IPushbulletNotifier, IAlertTracker, MonitorConfiguration, PostJson } from './interfaces';
import { Matcher } from './matcher';
import { Logger } from 'winston';

export class Monitor {
  private stream: typeof import('reddit-stream');

  constructor(
    private readonly config: MonitorConfiguration,
    private readonly notifier: IPushbulletNotifier,
    private readonly tracker: IAlertTracker,
    private readonly matcher: Matcher,
    private readonly logger: Logger) { }

  start(): void {
    this.stream = new RedditStream('posts', this.config.subreddit);
    this.stream.start();
    this.stream.on('error', (err) => this.logger.error(err));

    this.stream.on('new', (posts: { data: PostJson }[]) => {
      this.logger.info('got %s posts', posts.length);
      posts
        .map(post2Json)
        .filter(p => this.isValid(p))
        .forEach((p) => {
          this.logger.info('Matched post: %s, %s, %s, %s', p.title, p.url, p.link_flair_text, p.author);
          if (this.tracker.isMoreRecentThanLastAlert(p.created_utc)) {
            this.tracker.setLastAlerted(p.created_utc);
            this.notify(p).catch((err) => this.logger.error('Failed to notify!\n%s', err));
          } else {
            this.logger.info('But it is too old. Last alert time: %s; Post time: %s', this.tracker.getLastAlerted(), p.created_utc);
          }
        });
      // }
    });

  }

  verifyRunning(): void {
    if (!this.stream.is_running) {
      this.logger.info('stream not running. restarting.');
      this.stream.start();
    }
  }

  private notify(post: PostJson) {
    return this.notifyBase(
      'New Matching Post',
      `'${post.title}' at ${post.url} by ${post.author}`);
  }
  private notifyBase(noteTitle: string, noteBody: string): Promise<unknown> {
    this.logger.info(`[${noteTitle}]: ${noteBody}`);
    return this.notifier.pushMessage(noteTitle, noteBody);

  }

  private isValid(post: PostJson) {
    return this.matcher.matchPost(post, this.config.matches);
  }
}


function post2Json(post: { data: PostJson }): PostJson {
  return post.data;
}

