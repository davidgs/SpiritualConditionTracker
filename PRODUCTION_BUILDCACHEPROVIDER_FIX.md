# Production Server Fix for buildCacheProvider Error

This guide explains how to fix the "Cannot find module './buildCacheProvider'" error that occurs in production environments when running the Spiritual Condition Tracker app.

## Step 1: SSH into your server

Connect to your server via SSH:

```bash
ssh username@your-server-address
```

## Step 2: Navigate to your app directory

```bash
cd /var/www/vhosts/spiritual-condition.com/httpdocs/SpiritualConditionTracker
```

## Step 3: Create the fix script

Create a new file called `fix-buildcache-provider.js` in your app's root directory:

```bash
vi fix-buildcache-provider.js
```

Add the following content (press 'i' to enter insert mode, then paste):

```javascript
/**
 * Fix for the './buildCacheProvider' module error in @expo/config
 * This script creates the missing module file that's causing the error
 */

const fs = require('fs');
const path = require('path');

function fixBuildCacheProviderError() {
  console.log('Checking for buildCacheProvider error...');
  
  // Path to the @expo/config directory where the missing file should be
  const configDir = path.join(__dirname, 'node_modules', '@expo', 'config', 'build');
  
  // Path to the missing file
  const missingFilePath = path.join(configDir, 'buildCacheProvider.js');
  
  // Check if the directory exists
  if (!fs.existsSync(configDir)) {
    console.log('Could not find @expo/config/build directory, skipping fix');
    return;
  }
  
  // Check if the file already exists
  if (fs.existsSync(missingFilePath)) {
    console.log('buildCacheProvider.js already exists, no fix needed');
    return;
  }
  
  // Create a simple implementation of the missing module
  const fileContent = `
/**
 * This is a placeholder implementation for the missing buildCacheProvider module
 * Created by fix-buildcache-provider.js to resolve module import errors
 */

// Simple cache provider implementation that does nothing
function createCacheProvider() {
  return {
    get: async () => null,
    put: async () => {},
    clear: async () => {},
  };
}

module.exports = {
  createCacheProvider,
};
`;
  
  try {
    // Write the file
    fs.writeFileSync(missingFilePath, fileContent);
    console.log(\`Created missing module file: \${missingFilePath}\`);
    console.log('Fix for buildCacheProvider error completed successfully');
  } catch (error) {
    console.error(\`Error creating buildCacheProvider file: \${error.message}\`);
  }
}

// Run the fix immediately
fixBuildCacheProviderError();
```

Save and exit by pressing ESC, then typing `:wq` and pressing Enter.

## Step 4: Run the fix script

```bash
node fix-buildcache-provider.js
```

You should see output confirming the fix was applied.

## Step 5: Update production-server.js (or whichever server script you use)

Edit your main server startup script to run this fix before starting Expo:

```bash
vi run-expo-only.js   # or the startup script you use
```

Find where the server initialization occurs, and add this line before it:

```javascript
// Apply the buildCacheProvider fix
require('./fix-buildcache-provider.js');
```

## Step 6: Restart your server

```bash
# If using PM2
pm2 restart spiritual-condition

# If using systemd
sudo systemctl restart spiritual-condition.service

# If running directly
node run-expo-only.js
```

## Verification

After applying the fix and restarting your server, check your server logs to verify the error is no longer occurring:

```bash
# If using PM2
pm2 logs spiritual-condition

# If using systemd
journalctl -u spiritual-condition.service -f

# If running directly
tail -f error.log  # or wherever your logs are stored
```

You should no longer see the "Cannot find module './buildCacheProvider'" error message.

## Font Loading Issues in Production

If you're also experiencing issues with font loading in production (Failed to decode downloaded font errors), this fix doesn't address those specifically. Font loading issues are usually related to:

1. CORS (Cross-Origin Resource Sharing) issues
2. Incorrect path mapping in your web server configuration
3. Missing font files in the deployed build

You may need to add proper font loading to your nginx/apache configuration or make additional changes to the web asset bundling process. Please refer to `direct-web-fonts.js` in your project for more guidance on font handling.