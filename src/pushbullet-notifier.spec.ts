import { PushbulletNotifier } from './pushbullet-notifier';
import Pushbullet from 'pushbullet';
import { resolve } from 'path';

jest.mock('pushbullet');

describe('PushbulletNotifier', () => {

  it('should push message without title', async () => {
    // Arrange
    const responseValue = 'success';
    jest.spyOn(Pushbullet.prototype, 'note')
      .mockImplementation((_deviceId, _noteTitle, _noteBody, callback: (...args) =>
        Promise<unknown>) => callback(null, responseValue));
    const notifier = new PushbulletNotifier({
      encryptionKeyBase64: null,
      apiKey: 'key',
      deviceId: '1'
    });

    // Act
    const result = await notifier.pushMessage('bar');

    // Assert
    expect(result).toEqual(responseValue);
    expect(Pushbullet).toHaveBeenCalledWith('key');
    expect(Pushbullet.prototype.note)
      .toHaveBeenCalledWith('1', 'reddit-notifier', 'bar', expect.any(Function));
  });

  it('should push single message', async () => {
    // Arrange
    const responseValue = 'success';
    jest.spyOn(Pushbullet.prototype, 'note')
      .mockImplementation((_deviceId, _noteTitle, _noteBody, callback: (...args) =>
        Promise<unknown>) => callback(null, responseValue));
    const notifier = new PushbulletNotifier({
      encryptionKeyBase64: null,
      apiKey: 'key',
      deviceId: '1'
    });

    // Act
    const result = await notifier.pushMessage('foo', 'bar');

    // Assert
    expect(result).toEqual(responseValue);
    expect(Pushbullet).toHaveBeenCalledWith('key');
    expect(Pushbullet.prototype.note)
      .toHaveBeenCalledWith('1', 'foo', 'bar', expect.any(Function));
  });

  it('should push message with encryption', async () => {
    // Arrange
    const responseValue = 'success';
    const user = { iden: 'person' };

    jest.spyOn(Pushbullet.prototype, 'note')
      .mockImplementation((_deviceId, _noteTitle, _noteBody, callback: (...args) =>
        Promise<unknown>) => callback(null, responseValue));

    jest.spyOn(Pushbullet.prototype, 'me')
      .mockImplementation((callback: (error, user) => void) => callback(null, user));

    const notifier = new PushbulletNotifier({
      encryptionKeyBase64: 'Zm9vCg==',
      apiKey: 'key',
      deviceId: '1'
    });

    // Act
    const result = await notifier.pushMessage('foo', 'bar');

    // Assert
    expect(result).toEqual(responseValue);
    expect(Pushbullet).toHaveBeenCalledWith('key');
    expect(Pushbullet.prototype.note)
      .toHaveBeenCalledWith('1', 'foo', 'bar', expect.any(Function));
  });

  it('should push message to multiple targets', async () => {
    // Arrange
    const responseValue = 'success';
    jest.spyOn(Pushbullet.prototype, 'note')
      .mockImplementation((_deviceId, _noteTitle, _noteBody, callback: (...args) =>
        Promise<unknown>) => callback(null, responseValue));
    const notifier = new PushbulletNotifier({
      encryptionKeyBase64: null,
      apiKey: 'key',
      deviceId: ['1', '2', '3']
    });

    // Act
    const result = await notifier.pushMessage('foo', 'bar');

    // Assert
    expect(result).toEqual([1, 2, 3].map(() => ({ 'status': 'fulfilled', 'value': 'success' })));
    expect(Pushbullet).toHaveBeenCalledWith('key');
    expect(Pushbullet.prototype.note).toHaveBeenCalledTimes(3);
    expect(Pushbullet.prototype.note)
      .toHaveBeenCalledWith('1', 'foo', 'bar', expect.any(Function));
    expect(Pushbullet.prototype.note)
      .toHaveBeenCalledWith('2', 'foo', 'bar', expect.any(Function));
    expect(Pushbullet.prototype.note)
      .toHaveBeenCalledWith('3', 'foo', 'bar', expect.any(Function));
  });

  it('should reject when pushbullet cannot get profile info', async () => {
    // Arrange
    const responseValue = 'success';

    jest.spyOn(Pushbullet.prototype, 'note')
      .mockImplementation((_deviceId, _noteTitle, _noteBody, callback: (...args) =>
        Promise<unknown>) => callback(null, responseValue));

    jest.spyOn(Pushbullet.prototype, 'me')
      .mockImplementation((callback: (error, user) => void) => callback('profile-fail', null));

    const notifier = new PushbulletNotifier({
      encryptionKeyBase64: 'Zm9vCg==',
      apiKey: 'key',
      deviceId: '1'
    });

    // Assert
    expect(notifier.pushMessage('foo', 'bar')).rejects.toEqual('profile-fail');
  });

  it('should reject when push fails after setting encryption', async () => {
    // Arrange
    const errorValue = 'push-fail';

    jest.spyOn(Pushbullet.prototype, 'note')
      .mockImplementation((_deviceId, _noteTitle, _noteBody, callback: (...args) =>
        Promise<unknown>) => callback(errorValue, null));

    jest.spyOn(Pushbullet.prototype, 'me')
      .mockImplementation((callback: (error, user) => void) => callback(null, { iden: 1 }));

    const notifier = new PushbulletNotifier({
      encryptionKeyBase64: 'Zm9vCg==',
      apiKey: 'key',
      deviceId: '1'
    });

    // Assert
    expect(notifier.pushMessage('foo', 'bar')).rejects.toEqual(errorValue);
  });
});