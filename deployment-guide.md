# Spiritual Condition Tracker - Deployment Guide

This guide provides instructions for deploying your Spiritual Condition Tracker app on a production server.

## Prerequisites

- Node.js (v16+) installed on your server
- npm or yarn package manager
- Port 3243 (or your chosen port) available on your server
  - For the Replit environment, default port is 5000

## Quick Start

1. Upload the entire project to your server
2. Install dependencies:
   ```
   npm install
   ```
3. Start the production server:
   ```
   node production-server.js
   ```
4. Access your app at:
   ```
   http://your-server-address:3243/
   ```

## Using a Process Manager (Recommended)

For better reliability in production, use PM2:

1. Install PM2 globally:
   ```
   npm install -g pm2
   ```

2. Start the server with PM2:
   ```
   pm2 start production-server.js --name "spiritual-tracker"
   ```

3. Set up PM2 to restart on server boot:
   ```
   pm2 startup
   pm2 save
   ```

## Environment Variables

The server supports the following environment variables:

- `PORT`: The port to run the server on (default: 5000 in Replit, use 3243 on your own server)
- `HOST`: The host to bind to (default: 0.0.0.0)

Example:
```
PORT=8080 HOST=127.0.0.1 node production-server.js
```

## Troubleshooting

### Logo Not Displaying

If the logo doesn't appear:
- Check that the file `logo.jpg` exists in the public folder
- Verify file permissions allow the web server to read the file
- The production server automatically fixes most path issues

### App Not Loading

If the main app doesn't load:
- Check the server logs for any errors
- Ensure port 5001 is available internally for Expo
- Verify that the `/app` route is correctly proxied

### Proxy Errors

If you see proxy-related errors:
- Make sure your server can connect to localhost internal addresses
- Check that there are no firewall rules blocking local connections
- The DNS lookup failure is fixed in the production server by improving the proxy configuration

## Production Hardening

For a more secure deployment:

1. Run behind Nginx or Apache as a reverse proxy
2. Set up SSL/TLS for HTTPS access
3. Consider Docker containerization for isolation
4. Implement proper logging and monitoring

## Support

If you encounter any issues with deployment, please contact the development team for assistance.