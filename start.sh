#!/bin/bash
echo $(node --version)
node index.js -c ~/.reddit-notifier/config.json -d ~/.reddit-notifier/data | npx bunyan -o short -L