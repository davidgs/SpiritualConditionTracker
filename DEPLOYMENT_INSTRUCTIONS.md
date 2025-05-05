# Spiritual Condition Tracker - Deployment Instructions

These instructions will help you successfully deploy the Spiritual Condition Tracker application on your server.

## Server Deployment Steps

### 1. Server Prerequisites
- Node.js v16+ installed on your server
- npm or yarn package manager
- Port 3243 available (or another port of your choice)

### 2. Project Setup
1. Upload the entire project to your server
2. Install dependencies:
   ```
   npm install
   ```

### 3. Use the Fixed Production Server
The `production-server-fixed.js` file has been specially created to address deployment issues:
- Fixes the broken logo path
- Resolves the DNS lookup failure for localhost:3243app
- Improves proxy handling for external deployment environments

To start the server:
```
node production-server-fixed.js
```

For custom port configuration:
```
PORT=8080 node production-server-fixed.js
```

### 4. Using PM2 (Recommended)
For better reliability in production, use PM2:

1. Install PM2 globally:
   ```
   npm install -g pm2
   ```

2. Start the server with PM2:
   ```
   pm2 start production-server-fixed.js --name "spiritual-tracker"
   ```

3. Set up PM2 to restart on server boot:
   ```
   pm2 startup
   pm2 save
   ```

## Troubleshooting Common Issues

### Logo Not Displaying
If the logo still doesn't appear:
- Make sure the logo.jpg file exists in your root directory
- The fixed server specifically looks for logo.jpg in the root directory
- Verify file permissions allow the web server to read the file

### App Not Loading
If the main app doesn't load:
- Make sure port 5001 is available internally for Expo
- Check the server logs for any detailed error messages
- Verify your server allows localhost connections for proxying

### Other Connection Issues
- If behind a firewall, ensure port 3243 (or your chosen port) is open
- For DNS errors, make sure your server can resolve local hostnames
- The fixed server uses absolute URL paths to prevent malformed requests

## Additional Security Measures

For a more secure deployment:
1. Run behind Nginx or Apache as a reverse proxy
2. Set up SSL/TLS for HTTPS access
3. Consider using environment variables for sensitive configuration

## Getting Help
If you continue to experience deployment issues, please refer to the logs in:
- The server console output
- Browser developer tools (network and console tabs)

These logs will provide valuable information for diagnosing any remaining problems.