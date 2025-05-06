# Version Deployment Guide

We've been making changes to the app in Replit, but those changes need to be deployed to your actual server to be visible in browsers and iOS simulators.

## Deployment Steps

1. **Commit Changes to GitHub**
   - The changes we've made need to be committed to your GitHub repository
   - This includes the updated App.js with the new version string "1.0.2"
   - Also includes the improved run-expo-only.js script

2. **Pull Changes on Your Server**
   ```bash
   cd /path/to/your/app
   git pull
   ```

3. **Restart the Expo Server**
   ```bash
   # Kill any existing Expo processes
   pkill -f "expo start" || true
   pkill -f "node.*expo" || true
   
   # Clear all caches
   rm -rf expo-app/node_modules/.cache
   rm -rf expo-app/.expo
   rm -rf expo-app/web-build
   
   # Start the server with our improved script
   node run-expo-only.js
   ```

## Verifying the Update

After restarting, you should be able to see:
1. The updated version string "1.0.2" in the footer
2. The hamburger menu for mobile navigation

## Common Issues

If the update still doesn't appear:
1. **Browser Cache**: Try clearing your browser cache completely or use incognito mode
2. **Server Proxy Cache**: If you're using Nginx or Apache, they might be caching responses
3. **iOS Simulator**: Try completely closing and restarting the simulator
4. **Web Configuration**: Check if any content delivery networks (CDNs) are caching your app

## Force Clear Browser Cache

Add this script to your index.html to force browsers to clear their cache:

```html
<script>
  // Force reload if version doesn't match
  (function() {
    const currentVersion = "1.0.2-May6";
    const storedVersion = localStorage.getItem('app_version');
    
    if (storedVersion !== currentVersion) {
      console.log('New version detected, clearing cache and reloading');
      localStorage.setItem('app_version', currentVersion);
      
      // Clear all caches if browser supports it
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => {
            caches.delete(cacheName);
          });
        });
      }
      
      // Force reload without cache
      window.location.reload(true);
    }
  })();
</script>
```