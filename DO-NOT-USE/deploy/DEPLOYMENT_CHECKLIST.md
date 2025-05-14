# Spiritual Condition Tracker - Deployment Checklist

Use this checklist to ensure a smooth deployment of your Spiritual Condition Tracker application.

## Pre-Deployment Checklist

- [ ] Run all tests to ensure application stability
- [ ] Update environment variables if needed
- [ ] Make sure you have the latest code pulled from your repository
- [ ] Verify that all dependencies are correctly listed in package.json
- [ ] Check that deployment-server.js is configured correctly

## Deployment Steps

### Option 1: PM2 Deployment

- [ ] Install Node.js (v18+) and npm
- [ ] Install PM2 globally: `npm install -g pm2`
- [ ] Run the deployment script: `./deploy/deploy.sh`
- [ ] Verify the application is running: `pm2 status`
- [ ] Check logs for any errors: `pm2 logs spiritual-condition-tracker`
- [ ] Set up PM2 to start on system boot: `pm2 startup && pm2 save`

### Option 2: Docker Deployment

- [ ] Install Docker and Docker Compose
- [ ] Run the Docker deployment script: `./deploy/docker-deploy.sh`
- [ ] Verify containers are running: `docker ps`
- [ ] Check logs for any issues: `docker logs spiritual-condition-tracker`
- [ ] Ensure data persistence with Docker volumes

### Option 3: Cloud Deployment

Refer to `CLOUD_DEPLOYMENT.md` for platform-specific checklists.

## Post-Deployment Verification

- [ ] Access the landing page at: `http://yourdomain.com/`
- [ ] Access the application at: `http://yourdomain.com/app/`
- [ ] Test all main functionality
- [ ] Verify WebSocket connections are working
- [ ] Check that static assets are loading properly
- [ ] Test on multiple devices and browsers
- [ ] Monitor server resource usage

## Common Issues and Solutions

### Application Not Starting

- Check logs: `pm2 logs` or `docker logs spiritual-condition-tracker`
- Verify port availability: `sudo netstat -tulpn | grep 3000`
- Check Node.js version: `node --version` (should be 18+)

### NGINX Configuration Issues

- Test NGINX config: `sudo nginx -t`
- Check NGINX logs: `sudo tail -f /var/log/nginx/error.log`
- Verify permissions on NGINX config files

### WebSocket Connection Problems

- Make sure your proxy is properly configured to handle WebSocket connections
- Check for correct WebSocket upgrade headers in NGINX config
- Ensure firewall allows WebSocket connections

### Database Connection Issues

- Verify SQLite files are correctly placed and accessible
- Check file permissions on the database directory

## Security Considerations

- [ ] Set up SSL/HTTPS using Let's Encrypt or similar
- [ ] Configure security headers in NGINX
- [ ] Set up firewall rules to allow only necessary ports
- [ ] Implement regular backups of user data
- [ ] Keep Node.js and npm packages updated regularly