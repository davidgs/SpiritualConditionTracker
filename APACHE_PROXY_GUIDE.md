# Apache Proxy Configuration Guide for Spiritual Condition Tracker

## Understanding the Issue

We've encountered a specific issue with the web app deployment:
- The server is successfully running and accessible via `/` path
- The initial HTML is loading properly
- But JavaScript bundles (like `/index.bundle`) are returning 404 Not Found errors
- This is because Apache isn't correctly forwarding all requests to our Expo server

## Solution: Proper Apache Configuration

To fix this issue, the Apache virtual host configuration must be updated to properly proxy ALL requests to our Expo server, not just specific paths.

### 1. Enable Required Apache Modules

Make sure these Apache modules are enabled:

```bash
sudo a2enmod proxy proxy_http proxy_wstunnel rewrite
sudo systemctl restart apache2
```

### 2. Update Virtual Host Configuration

Edit your virtual host configuration file (typically in `/etc/apache2/sites-available/`):

```bash
sudo nano /etc/apache2/sites-available/spiritual-condition.com.conf
```

Replace the existing configuration with a setup similar to our example in `apache-proxy-example.conf`. The most important changes are:

1. Proxy ALL requests to the Expo server:
   ```
   ProxyPass / http://localhost:3243/
   ProxyPassReverse / http://localhost:3243/
   ```

2. Add WebSocket support (required for hot reloading):
   ```
   RewriteEngine On
   RewriteCond %{HTTP:Upgrade} =websocket [NC]
   RewriteRule /(.*) ws://localhost:3243/$1 [P,L]
   ```

3. Increase timeout values to prevent connection issues:
   ```
   ProxyTimeout 3600
   Timeout 3600
   KeepAliveTimeout 3600
   ```

### 3. Validate Configuration & Restart Apache

Check for syntax errors:

```bash
sudo apachectl configtest
```

If the configuration test passes, restart Apache:

```bash
sudo systemctl restart apache2
```

## Verifying The Fix

After making these changes:

1. Clear your browser cache or open the site in an incognito window
2. Open browser developer tools (F12) and go to the Network tab
3. Reload the page and look for requests to `/index.bundle`
4. These requests should now return HTTP 200 instead of 404

## Additional Troubleshooting

If you're still experiencing issues:

1. Check Apache error logs:
   ```bash
   sudo tail -f /var/log/apache2/error.log
   ```

2. Ensure the Expo server is running:
   ```bash
   cd /var/www/vhosts/spiritual-condition.com/httpdocs/SpiritualConditionTracker
   node production-server.js
   ```

3. Verify that port 3243 is being used by the Expo server:
   ```bash
   sudo netstat -tulpn | grep 3243
   ```

4. Test direct access to the Expo server from the server itself:
   ```bash
   curl http://localhost:3243/
   ```

## Running as a Service

For production, run the application as a systemd service to ensure it automatically starts at boot and restarts on failure. See our `DEPLOYMENT_INSTRUCTIONS.md` for details on setting up the service.