module.exports = {
  'pushbullet': {
    'apiKey': 'VALUE',
    'deviceId': 'VALUE',
    'encryptionKeyBase64': 'value'
  },
  'monitor': {
    'subreddit': 'test',
    'matches': function (post) {
      return true;
    }
  }
};