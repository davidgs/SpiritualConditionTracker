# Configuring Expo for the Apache /app Path

## Understanding the Setup

Your Apache server is configured as follows:
- Root path (`/`) serves static files from the public directory
- `/app` path is proxied to `http://localhost:3243/`

The issue we're experiencing is that Expo is generating bundle URLs at the root path (e.g., `/index.bundle`), but Apache expects these to be at `/app/index.bundle` to proxy them correctly.

## Solution: Configure Expo with Correct Public Path

We've created a new server script `production-server-app-path.js` that properly configures Expo to use `/app/` as its public path.

## Implementing the Fix

1. SSH into your server
2. Navigate to your application directory:
   ```bash
   cd /var/www/vhosts/spiritual-condition.com/httpdocs/SpiritualConditionTracker
   ```

3. If the systemd service is running, stop it:
   ```bash
   sudo systemctl stop spiritual-condition
   ```

4. Test the new server script manually:
   ```bash
   node production-server-app-path.js
   ```

5. Verify it's working by checking:
   - Initial page loads at `https://spiritual-condition.com/app/`
   - Bundle files load successfully from `https://spiritual-condition.com/app/index.bundle`

6. Once confirmed, update your systemd service to use the new script:
   ```bash
   sudo systemctl edit spiritual-condition
   ```
   Change the ExecStart line to:
   ```
   ExecStart=/usr/bin/node /var/www/vhosts/spiritual-condition.com/httpdocs/SpiritualConditionTracker/production-server-app-path.js
   ```

7. Start the service:
   ```bash
   sudo systemctl restart spiritual-condition
   ```

8. Enable it to start at boot:
   ```bash
   sudo systemctl enable spiritual-condition
   ```

## Key Changes in the New Server Script

The critical change is setting the `EXPO_WEBPACK_PUBLIC_PATH` environment variable to `/app/`:

```javascript
const env = {
  ...process.env,
  ...
  EXPO_WEBPACK_PUBLIC_PATH: '/app/',  // This is the key setting!
  ...
};
```

This ensures Expo generates all asset URLs (including the bundle) with `/app/` as the base path.

## Verifying It Works

1. Open `https://spiritual-condition.com/app/` in your browser
2. Open the developer tools (F12) and check the Network tab
3. Look for requests to `app/index.bundle` and verify they return HTTP 200

If you see any 404 errors for bundle files, check that the URLs include `/app/` and that your Apache proxy configuration is correctly forwarding `/app/` to port 3243.