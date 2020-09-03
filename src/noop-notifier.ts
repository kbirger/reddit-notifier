import { IPushbulletNotifier } from './interfaces';
import Logger from 'bunyan';

export class NoopNotifier implements IPushbulletNotifier {
  constructor(private readonly logger: Logger) { }

  pushMessage(noteBody: string): Promise<any>;
  pushMessage(noteTitle: string, noteBody: string): Promise<any>;

  pushMessage(noteTitle: string, noteBody?: string): Promise<any> {
    this.logger.info('[NoopNotifier] Pushing: %s: %s', noteTitle, noteBody);

    return Promise.resolve();
  }

}