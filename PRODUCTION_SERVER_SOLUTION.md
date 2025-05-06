# Production Server Solution for Spiritual Condition Tracker

This document explains the solution we've implemented to fix the 404 and 500 errors with the bundle requests.

## The Problem

The Expo development server was returning 500 errors when attempting to access the JavaScript bundle file directly:

```
curl -I http://localhost:3243/index.bundle
HTTP/1.1 500 Internal Server Error
```

When nginx tried to proxy these requests, it would return a 502 Bad Gateway error, preventing the app from loading properly.

## The Solution

We created a hybrid server approach that:

1. Serves a static bundle file for the problematic `/index.bundle` requests
2. Proxies all other requests to the Expo development server
3. Binds to all network interfaces (0.0.0.0) for proper access

This approach gives us the best of both worlds:
- Static bundle serving for reliability
- Dynamic Expo server for development features

## How to Use

### Step 1: Run the Production Server

```bash
# Make the script executable
chmod +x run-production-server.sh

# Run the production server
./run-production-server.sh
```

This script:
- Stops any existing servers on ports 3243 and 19000
- Starts the production hybrid server in the background
- Tests that the bundle is being served correctly

### Step 2: Verify through Nginx

After the server is running, verify that nginx can proxy the bundle correctly:

```bash
curl -I https://spiritual-condition.com/index.bundle
```

You should see a 200 OK response with Content-Type: application/javascript

### Step 3: Test the Full App

Open your web browser and navigate to:

```
https://spiritual-condition.com/app/
```

The app should now load correctly without any 404 or 500 errors.

## Understanding the Components

This solution uses several key components:

### `production-hybrid-server.js`

The main production server that:
- Creates a static bundle file
- Starts Expo on port 19000
- Proxies all non-bundle requests to Expo
- Serves bundles directly from static files

### `run-production-server.sh`

A convenience script to:
- Stop existing servers
- Start the production server
- Verify it's working correctly

### Nginx Configuration

Nginx is configured to:
- Proxy all requests to the production server on port 3243
- Handle HTTPS, domain names, and other web server functions

## Troubleshooting

### Bundle 404 Errors

If you see 404 errors for the bundle, check:
- Is the production server running? (`ps aux | grep node`)
- Can you access the bundle locally? (`curl -I http://localhost:3243/index.bundle`)
- Is nginx configured correctly? (Check error logs)

### App Not Loading

If the app doesn't load but the bundle is accessible:
- Check other asset requests in the browser's developer tools
- Look for errors in the console
- Check the production server logs: `tail -f production-server.log`

### Restarting After Server Reboot

To ensure the server starts after a system reboot, consider creating a systemd service:

```
[Unit]
Description=Spiritual Condition Tracker Production Server
After=network.target

[Service]
Type=simple
User=yourusername
WorkingDirectory=/path/to/your/app
ExecStart=/bin/bash /path/to/your/app/run-production-server.sh
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Save this to `/etc/systemd/system/spiritual-condition-tracker.service` and enable it with:

```bash
sudo systemctl enable spiritual-condition-tracker
sudo systemctl start spiritual-condition-tracker
```