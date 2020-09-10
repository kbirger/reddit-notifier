import { IPushbulletNotifier } from './interfaces';
import { Logger } from 'winston';

export class NoopNotifier implements IPushbulletNotifier {
  constructor(private readonly logger: Logger) { }

  pushMessage(noteBody: string): Promise<unknown>;
  pushMessage(noteTitle: string, noteBody: string): Promise<unknown>;

  pushMessage(noteTitle: string, noteBody?: string): Promise<unknown> {
    this.logger.info('[NoopNotifier] Pushing: %s: %s', noteTitle, noteBody);

    return Promise.resolve();
  }

}