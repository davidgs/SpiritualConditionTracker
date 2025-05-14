# Spiritual Condition Tracker - Deployment Guide

This directory contains all the necessary files and configuration for deploying the Spiritual Condition Tracker application to various production environments.

## Deployment Options

The application can be deployed using different methods:

1. **PM2 Deployment** - For direct server deployment with Node.js process management
2. **Docker Deployment** - For containerized deployment with better isolation
3. **NGINX Configuration** - For reverse proxy setup with proper caching and SSL

## Quick Start Guide

### Option 1: PM2 Deployment

This method is best for simple deployments on a Linux server with Node.js installed.

1. Make sure you have Node.js 18+ and PM2 installed
2. Run the deployment script:
   ```bash
   ./deploy/deploy.sh
   ```

### Option 2: Docker Deployment

This method uses Docker containers for better isolation and consistency.

1. Make sure you have Docker and Docker Compose installed
2. Run the Docker deployment script:
   ```bash
   ./deploy/docker-deploy.sh
   ```

### Option 3: Manual Deployment

For complete control over the deployment process:

1. Install dependencies: `npm install --production`
2. Start the application: `node deployment-server.js`

## Configuration Files

- `Dockerfile` - Docker container configuration
- `docker-compose.yml` - Multi-container Docker setup
- `nginx.conf` - NGINX reverse proxy configuration
- `pm2.config.js` - PM2 process manager configuration
- `deploy.sh` - PM2 deployment script
- `docker-deploy.sh` - Docker deployment script
- `SETUP_GUIDE.md` - Detailed installation instructions

## Server Requirements

- Node.js 18 or higher
- 1GB RAM minimum (2GB recommended)
- 10GB disk space
- Linux-based OS (Ubuntu 20.04+ recommended)

## Environment Variables

The application uses the following environment variables:

- `NODE_ENV` - Production or development mode (default: production)
- `PORT` - Main server port (default: 3000)
- `EXPO_PORT` - Internal Expo bundler port (default: 5001)
- `CI` - CI mode for non-interactive Expo (default: 1)

## Additional Resources

For more detailed instructions on deploying and troubleshooting, see the `SETUP_GUIDE.md` file.