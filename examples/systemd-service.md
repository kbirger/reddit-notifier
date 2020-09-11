# Usage with systemd
Below is a sample systemd configuration

```
[Unit]
Description=reddit notifier
After=network.target

[Service]
User=USER
Group=USER
WorkingDirectory=/home/USER/.npm/lib/node_modules/reddit-notifier
ExecStart=/usr/bin/node /home/USER/.npm/lib/node_modules/reddit-notifier/dist/index.js
Type=simple
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Note: it is a best practice to not run services as a highly privileged account. As such, it is recommended to create a service account for this application which has access only to the files it needs.

This example assumes that the application will run as USER, who has an **npm prefix** set to ~/.npm. It also assumes that we want the defaults for `--data-dir` and `--config` which are ~/.reddit-notifier/data and ~/.reddit-notifier/config.json respectively. You can change them on the `ExecStart` line