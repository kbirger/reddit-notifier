# Reddit Notifier

## Summary
This tool can be run as either a service or as a regular process and can notify you via Pushbullet when posts are made to a subreddit based on criteria you specify.

Eventually, more notification mechanisms may come, and contributions are welcome

## Usage

Installing this package globally will provide a global script named `reddit-notifier`. 


```
npm i -g reddit-notifier@latest

reddit-notifier --version
reddit-notifier --help
reddit-notifier --config ~/.reddit-notifier/config.js --data-dir ~/.reddit-notifier/data

```

The data directory is where logs and state will be stored.

## Configuration

Below is a sample configuration

```json
{
  "pushbullet": {
    "apiKey": "",
    "deviceId": "",
    "encryptionKeyBase64": ""
  },
  "monitor": {
    "subreddit": "test",
    "matches": {
      "title": {
        "any": [
          {
            "matches": "^reddit-notifier"
          }
        ]
      }
    }
  }
}
```

- pushbullet.apiKey: the api key to pushbullet. It can be retrieved from your [Pushbullet Settings](https://www.pushbullet.com/#settings/account)
- pushbullet.deviceId: string | string[] | {}. It can be a single device id, an array of them, or {} if you want to notify all of your devices. You can get your device ids in the settings under devices. Simply select your device and pull the hash from the URL
- monitor.subreddit: the name of the subreddit to monitor. currently only one is supported
- monitor.matches: you may specify any key in this section that matches a field of the reddit post json. Common fields are `title` and `author`. See [Pushshift api](https://pushshift.io/api-parameters/) for a list
- monitor.matches.<FIELD>.any: to be notified of a post, at least one item in this array must match
- monitor.matches.<FIELD>.none: to be notified of a post, at no item in this array must match

## Matchers
monitor.matches.<FIELD>.any and monitor.matches.<FIELD>.none follow the same specification. They may have one or more keys from the following set:

- matches: regular expression match on the field (case insensitive)
- equals: direct equality match (case sensitive)
- greaterThan: numeric comparison
- lessThan: numeric comparison

The implication with this design is that you may specify multiple criteria for multiple fields. In order to match, a post must match on ALL of the fields specified under `monitor.matches` (works like a logical AND), but each field may have a number of OR conditions (each item in ANY). Every clause under `monitor.matches.<FIELD>.any[#]` must be matched (see second example)


### Examples

#### Title field must start with 'hello'
```json 
{
  "title": {
    "any": [{
      "matches": "^hello"    
    }]
  }
}

```

#### Created field must be greater than 2, but less than 5
```json 
{
  "created": {
    "any": [{
      "lessThan": 5,
      "greaterthan": 2
    }],
  }
}
```

#### Created field must be greater than 2, but less than 5, and not 3
```json
{
  "created": {
    "any": [{
      "lessThan": 5,
      "greaterthan": 2
    }],
    "none": [{
      "equals": 3
    }]
  }
}
```


### Author must be Bob, and title must start with hello''
```json
{
  "title": {
    "any": [{
      "matches": "^hello"
    }]
  },
  "author": {
    "any": [{
      "equals": "Bob"
    }]
  }
}