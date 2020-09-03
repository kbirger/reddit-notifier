import PushBullet from 'pushbullet';
import { IPushbulletNotifier, PushBulletConfiguration } from './interfaces';
import * as c from './constants';

export class PushbulletNotifier implements IPushbulletNotifier {
  private readonly pusher: typeof import('pushbullet');
  private readonly encryptionKey: string | null = null;

  private encryptionEnabled: boolean = false;
  constructor(private readonly config: PushBulletConfiguration) {
    this.pusher = new PushBullet(config.apiKey);
    if (config.encryptionKeyBase64) {
      this.encryptionKey = Buffer.from(config.encryptionKeyBase64, 'base64').toString('utf8');
    }
  }

  pushMessage(noteBody: string): Promise<any>;
  pushMessage(noteTitle: string, noteBody: string): Promise<any>;

  pushMessage(noteTitle: string, noteBody?: string): Promise<any> {
    if (noteBody === undefined) {
      noteBody = noteTitle;
      noteTitle = c.ApplicationName;
    }

    if (this.encryptionKey && !this.encryptionEnabled) {
      return new Promise((resolve, reject) => {
        this.pusher.me((error, user) => {
          if (error) {
            reject(error);
          } else {
            this.pusher.enableEncryption(this.encryptionKey, user.iden);
            this.encryptionEnabled = true;
            this.pushMessage(noteTitle, noteBody as string)
              .then((result) => resolve(result))
              .catch((err) => reject(err));
          }
        })
      })
    }

    if (Array.isArray(this.config.deviceId)) {
      return this.pushMulti(noteTitle, noteBody, this.config.deviceId);
    }
    return this.pushSingle(noteTitle, noteBody, this.config.deviceId);
  }

  pushMulti(noteTitle: string, noteBody: string, deviceId: string[]) {
    const promises = deviceId.map(i => this.pushSingle(noteTitle, noteBody, deviceId));
    return Promise.allSettled(promises);
  }
  pushSingle(noteTitle: string, noteBody: string, deviceId: string | {}) {
    return new Promise((resolve, reject) => {
      return this.pusher.note(
        deviceId,
        noteTitle,
        noteBody,
        (error, response) => {
          if (error) {
            reject(error);
          } else {
            resolve(response);
          }
        });
    });
  }


}