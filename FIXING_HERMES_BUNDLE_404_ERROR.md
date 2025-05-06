# Fixing Hermes Bundle 404/500 Error in Spiritual Condition Tracker

This guide explains how to fix the common 404/500 errors when requesting the `/index.bundle` file in the Spiritual Condition Tracker app. These errors often happen when using Expo behind nginx or other proxies.

## The Problem

The Expo development server sometimes can't properly serve the `/index.bundle` file directly, resulting in 500 errors or 404 Not Found responses. This prevents the app from loading correctly.

## The Solution: Dedicated Bundle Server

We've created a simple dedicated server that ONLY serves the `/index.bundle` file. This server:

1. Runs on port 3243
2. Serves a static compatibility bundle
3. Handles both `/index.bundle` and `/app/index.bundle` paths
4. Works alongside your existing Expo server

## Installation and Setup

### Step 1: Install the Bundle Server

Copy these files to your server:
- `bundle-server.js` - The minimal server that only serves the bundle file
- `run-bundle-server.sh` - Script to start and test the server

Make the script executable:

```bash
chmod +x run-bundle-server.sh
```

### Step 2: Start the Bundle Server

```bash
./run-bundle-server.sh
```

You should see output confirming the server is running correctly.

### Step 3: Configure Nginx

Update your nginx configuration to route bundle requests to this dedicated server:

```nginx
# Handle bundle requests directly
location = /index.bundle {
    # Forward to the local bundle server
    proxy_pass http://localhost:3243/index.bundle;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    
    # CORS headers
    add_header Access-Control-Allow-Origin * always;
}

# Also handle app/index.bundle the same way
location = /app/index.bundle {
    proxy_pass http://localhost:3243/app/index.bundle;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    
    # CORS headers
    add_header Access-Control-Allow-Origin * always;
}
```

### Step 4: Reload Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Step 5: Test the Setup

Verify the bundle is now served correctly:

```bash
curl -I https://spiritual-condition.com/index.bundle
```

You should see a `200 OK` response with `Content-Type: application/javascript`.

## Automatic Startup After Reboot

To ensure the bundle server starts automatically after system reboots, create a systemd service:

1. Create a systemd service file:

```bash
sudo nano /etc/systemd/system/bundle-server.service
```

2. Add the following content:

```
[Unit]
Description=Spiritual Condition Tracker Bundle Server
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/your/app
ExecStart=/path/to/your/app/run-bundle-server.sh
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

3. Enable and start the service:

```bash
sudo systemctl enable bundle-server
sudo systemctl start bundle-server
```

## Troubleshooting

### Bundle still returns 404

1. Check if the bundle server is running:
   ```bash
   ps aux | grep bundle-server
   ```

2. Test the local bundle endpoint:
   ```bash
   curl -I http://localhost:3243/index.bundle
   ```

3. Check the bundle server logs:
   ```bash
   tail -f bundle-server.log
   ```

### App loads but shows errors

If the app loads but displays errors in the console about missing modules, you might need to customize the static bundle content in `bundle-server.js`.