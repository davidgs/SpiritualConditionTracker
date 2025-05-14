# Deployment Checklist for Spiritual Condition Tracker

## Key Files to Copy to Your Server

1. Main Application Files:
   - `expo-app/App.js` - **CRITICAL** - Contains the main application logic and navigation
   - `expo-app/app.json` - Contains app configuration
   - All files in `expo-app/src/` directory - Contains all screens, contexts, and utilities

2. Server Files:
   - `run-expo-only.js` - Main server startup script
   - `server-update-force-rebuild.sh` - Force rebuild script (use this after updates)

3. Configuration Files:
   - Any nginx/apache configuration files that were customized

## Deployment Steps

1. **Backup your current files**
   ```
   cp -r expo-app expo-app.backup
   ```

2. **Copy the new files to your server**
   - Make sure to preserve the directory structure
   - Ensure you copy ALL files in the src directory
   - Verify file permissions (chmod +x for scripts)

3. **Force a complete rebuild**
   ```
   bash server-update-force-rebuild.sh
   ```

4. **Verify the version string**
   - Check that the version string at the bottom of the app matches the expected version
   - Current version: "1.0.0 - May 6, 2025 - 01:35"

## Troubleshooting

If you're still seeing old code:

1. Confirm that the browser isn't caching the old version
   - Try pressing Ctrl+F5 to force refresh
   - Try opening in a private/incognito window

2. Verify the actual file contents on your server
   ```
   grep "APP_VERSION" expo-app/App.js
   ```

3. Force kill any running instances and restart
   ```
   pkill -f "expo start"
   pkill -f "node.*expo"
   ```

4. Clear your node_modules and reinstall
   ```
   cd expo-app
   rm -rf node_modules
   npm install
   ```

5. Check server logs for errors
   ```
   tail -f nohup.out
   ```