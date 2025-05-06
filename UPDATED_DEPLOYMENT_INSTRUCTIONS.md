# Updated Deployment Instructions for Spiritual Condition Tracker

These instructions have been updated to fix the module errors encountered on the production server.

## Quick Start

To run the app on your production server:

1. Copy these files to your server:
   - `fix-subprotocol.js`
   - `run-expo-with-fixes.js`
   - `create-systemd-service.js` (optional, for automatic startup)

2. Run the combined solution:

```bash
node run-expo-with-fixes.js
```

This script:
- Fixes the missing subprotocol.js module and other missing files
- Creates/fixes static content in the public directory
- Fixes paths in index.html for proper resource loading
- Sets up symbolic links for bundle access
- Starts Expo directly on port 3243 (the port your Apache proxy is configured for)

## Troubleshooting

If you encounter additional module errors, examine the error message and add the missing file to `fix-subprotocol.js`.

## Running as a Service

To run as a systemd service, create a file at `/etc/systemd/system/spiritual-condition.service` with the following content (adjust paths as needed):

```
[Unit]
Description=Spiritual Condition Tracker Expo Server
After=network.target

[Service]
Type=simple
User=<your_user>
WorkingDirectory=/var/www/vhosts/spiritual-condition.com/httpdocs/SpiritualConditionTracker
ExecStart=/usr/bin/node run-expo-with-fixes.js
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=spiritual-condition

[Install]
WantedBy=multi-user.target
```

Then enable and start the service:

```bash
sudo systemctl enable spiritual-condition
sudo systemctl start spiritual-condition
```

To check the status of the service:

```bash
sudo systemctl status spiritual-condition
```

## Proxy Configuration

Ensure your Apache proxy configuration forwards requests to port 3243. Example configuration:

```apache
ProxyPass /app http://localhost:3243
ProxyPassReverse /app http://localhost:3243
```

For websocket support, make sure to also add:

```apache
RewriteEngine On
RewriteCond %{HTTP:Upgrade} =websocket [NC]
RewriteRule /app/(.*) ws://localhost:3243/$1 [P,L]
```