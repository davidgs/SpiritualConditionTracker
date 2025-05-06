# Version Deployment Guide

This guide documents the minimal steps needed to update your app version and ensure it appears correctly on deployment.

## Deployment Issues Summary

The main issue preventing version updates from appearing is the lru-cache module resolution error during the build process. This prevents proper rebuilding on the server.

## Minimal Fix Process

1. Update version in `expo-app/App.js`:
   ```javascript
   const APP_VERSION = "1.0.2 - May 6, 2025"; // Update with each release
   ```

2. Skip problematic export step in `run-expo-only.js`:
   ```javascript
   // Skip the export step which causes lru-cache issues
   console.log('Skipping export step to avoid lru-cache issues...');
   console.log('Continuing with direct Expo start...');
   ```

3. On your server, run these commands after git pull:
   ```bash
   # Kill existing processes
   pkill -f node
   
   # Force clear all caches
   rm -rf node_modules/.cache
   rm -rf expo-app/node_modules/.cache
   rm -rf .expo
   rm -rf expo-app/.expo
   rm -rf ~/Library/Developer/Xcode/DerivedData
   
   # Install critical dependencies
   npm install --no-save lru-cache@6.0.0 semver@7.5.4 minimatch@5.1.6
   
   # Start with cache busting variables
   EXPO_CACHE_BUSTER="$(date +%s)" \
   METRO_CACHE_BUSTER="$(date +%s)" \
   BUILD_ID="force-clean-$(date +%s)" \
   node run-expo-only.js
   ```

## Nginx Configuration

Add this to your Nginx site configuration:

```nginx
# Cache busting headers
add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0" always;
add_header Pragma "no-cache" always;
add_header Expires "0" always;

# Disable etag
etag off;

# Add random timestamp to force cache invalidation
add_header X-Cache-Timestamp $msec always;
```

## Client-Side Refresh

Add this iframe to any HTML page to test if the version is updating properly:

```html
<iframe src="/app/?v=new-version-$(date +%s)" style="width:100%; height:600px; border:1px solid #ccc;"></iframe>
```

## Future Updates

For future version updates:

1. Update the version string in `expo-app/App.js`
2. Include the date in the version string for easy verification
3. Commit and push to your repository
4. On your server:
   ```bash
   git pull
   pkill -f node
   CACHE_BUSTER="$(date +%s)" node run-expo-only.js
   ```

## Browser Testing

Test your app in incognito/private browsing mode, which starts with a fresh cache.

If you still see an old version:
1. Open browser developer tools (F12)
2. Go to Application tab
3. Select "Storage" and clear all site data
4. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)