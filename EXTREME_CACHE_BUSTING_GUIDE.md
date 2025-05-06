# Extreme Cache Busting Guide for Spiritual Condition Tracker

This guide provides methods to address extremely persistent caching issues that prevent app updates from appearing despite proper deployment.

## Server-Side Cache Busting

1. **Use the force-server-restart.sh script**

   After pulling the latest changes from git, run:
   ```bash
   # Make the script executable
   chmod +x force-server-restart.sh
   
   # Run the script
   ./force-server-restart.sh
   ```

   This script:
   - Kills all Node and Expo processes
   - Removes ALL cache directories (node_modules/.cache, .expo, metro-cache)
   - Clears npm/yarn caches
   - Starts the server with new cache-busting environment variables

2. **Verify App.js Version**

   The script will display the current App.js version before starting.
   Verify that it shows: `1.0.2 - May 6, 2025 - 13:30 FORCE-UPDATE` (or newer)

## Client-Side Cache Busting

1. **Add cache-buster.js to your HTML**

   Add this script tag to your index.html file, immediately after the opening `<body>` tag:
   ```html
   <script src="/cache-buster.js"></script>
   ```

   If your app is served from a subdirectory, adjust the path:
   ```html
   <script src="/your-app-path/cache-buster.js"></script>
   ```

   This script:
   - Checks for version changes
   - Clears localStorage, sessionStorage, indexedDB, and Cache API caches
   - Unregisters service workers
   - Forces page reload when version changes
   - Adds a manual "Force Refresh" button in development

2. **Browser Incognito Mode**

   Test your app in incognito/private browsing mode, which starts with a fresh cache.

## Web Server Configuration

1. **Nginx Cache Control**

   Add these directives to your Nginx configuration:
   ```nginx
   location / {
     add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
     add_header Pragma "no-cache";
     add_header Expires "0";
     
     # Disable etag
     etag off;
     
     # Add a version timestamp to all responses
     add_header X-App-Version "1.0.2-FORCE-REFRESH";
     
     # Rest of your config...
   }
   ```

2. **Apache Cache Control**

   Add these directives to your Apache configuration or .htaccess:
   ```apache
   <IfModule mod_headers.c>
     Header set Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
     Header set Pragma "no-cache"
     Header set Expires "0"
     
     # Add version timestamp
     Header set X-App-Version "1.0.2-FORCE-REFRESH"
   </IfModule>
   
   # Disable ETags
   FileETag None
   ```

## Webpack/Bundler Configuration

1. **Add Hashes to File Names**

   In app.json or your webpack config, ensure output files include content hashes:
   ```json
   {
     "web": {
       "output": {
         "filename": "[name].[contenthash].js",
         "chunkFilename": "[name].[contenthash].chunk.js"
       }
     }
   }
   ```

## Debugging Tools

1. **Network Request Inspector**

   In Chrome DevTools > Network tab:
   - Look for 304 Not Modified responses
   - Check cache-related headers
   - Use the "Disable Cache" option

2. **Application Tab in DevTools**

   In Chrome DevTools > Application tab:
   - Check Service Workers and unregister them
   - Clear Storage (all options)
   - Look at Cache Storage

## Other Steps to Try

1. **CDN Purge**

   If you're using a CDN like Cloudflare, manually purge the cache for your domain.

2. **DNS Cache**

   Clear your local DNS cache:
   ```bash
   # macOS
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
   
   # Windows
   ipconfig /flushdns
   ```

3. **Try Different Browsers**

   Test with multiple browsers to isolate browser-specific caching issues.

4. **iOS Simulator**

   For iOS simulator:
   - Completely close the simulator
   - Delete the app from the simulator
   - Restart the simulator
   - Reinstall the app

5. **Use Different URL**

   Try accessing your app with a different URL or by adding a query parameter:
   ```
   https://your-domain.com/app?v=1.0.2-refresh
   ```

## Last Resort: The Nuclear Option

If all else fails, you can try this approach:

1. Create a new web-build directory with a different name each time
2. Update your server to serve files from this new directory
3. Change all URLs to include the new path

Example:
```bash
# Build to a timestamped directory
TIMESTAMP=$(date +%s)
mkdir -p web-build-$TIMESTAMP
npx expo export -p web --output-dir web-build-$TIMESTAMP

# Update server to serve from this directory
# (implementation depends on your server)