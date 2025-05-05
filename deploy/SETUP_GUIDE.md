# Spiritual Condition Tracker - Server Setup Guide

This document provides a step-by-step guide to set up and deploy the Spiritual Condition Tracker application on different types of servers.

## Table of Contents
1. [Basic Linux Server Setup](#basic-linux-server-setup)
2. [Docker Deployment](#docker-deployment)
3. [Reverse Proxy with NGINX](#reverse-proxy-with-nginx)
4. [SSL/HTTPS Configuration](#sslhttps-configuration)
5. [Troubleshooting](#troubleshooting)

## Basic Linux Server Setup

### Prerequisites
- A Linux server (Ubuntu 20.04+ recommended)
- Root or sudo access
- Basic command line knowledge

### Installation Steps

1. **Update your system**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install Node.js and npm**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

3. **Verify installation**:
   ```bash
   node --version  # Should be v18.x or higher
   npm --version   # Should be v7.x or higher
   ```

4. **Clone the repository**:
   ```bash
   git clone https://your-repository-url.git
   cd spiritual-condition-tracker
   ```

5. **Install PM2 globally**:
   ```bash
   sudo npm install -g pm2
   ```

6. **Run the deployment script**:
   ```bash
   chmod +x deploy/deploy.sh
   ./deploy/deploy.sh
   ```

7. **Configure PM2 to start on boot**:
   ```bash
   sudo pm2 startup
   pm2 save
   ```

## Docker Deployment

### Prerequisites
- A server with Docker and Docker Compose installed
- Basic Docker knowledge

### Installation Steps

1. **Install Docker** (if not already installed):
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   ```

2. **Install Docker Compose** (if not already installed):
   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. **Clone the repository**:
   ```bash
   git clone https://your-repository-url.git
   cd spiritual-condition-tracker
   ```

4. **Run the Docker deployment script**:
   ```bash
   chmod +x deploy/docker-deploy.sh
   ./deploy/docker-deploy.sh
   ```

## Reverse Proxy with NGINX

### Prerequisites
- NGINX installed on your server
- Basic NGINX configuration knowledge

### Installation Steps

1. **Install NGINX** (if not already installed):
   ```bash
   sudo apt update
   sudo apt install -y nginx
   ```

2. **Enable NGINX to start on boot**:
   ```bash
   sudo systemctl enable nginx
   ```

3. **Create a new NGINX site configuration**:
   ```bash
   sudo cp deploy/nginx.conf /etc/nginx/sites-available/spiritual-condition-tracker
   ```

4. **Edit the configuration file** to update your domain name:
   ```bash
   sudo nano /etc/nginx/sites-available/spiritual-condition-tracker
   ```
   - Update `server_name yourdomain.com` with your actual domain

5. **Enable the site**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/spiritual-condition-tracker /etc/nginx/sites-enabled/
   sudo nginx -t  # Test the configuration
   sudo systemctl reload nginx
   ```

## SSL/HTTPS Configuration

### Prerequisites
- NGINX installed and configured
- Domain name pointed to your server
- Port 80 and 443 open on your firewall

### Setting up Let's Encrypt SSL

1. **Install Certbot**:
   ```bash
   sudo apt update
   sudo apt install -y certbot python3-certbot-nginx
   ```

2. **Obtain SSL certificate**:
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```
   - Follow the prompts to configure HTTPS

3. **Verify auto-renewal**:
   ```bash
   sudo systemctl status certbot.timer
   ```

## Troubleshooting

### Common Issues and Solutions

1. **App doesn't start**:
   - Check logs: `pm2 logs` or `docker logs spiritual-condition-tracker`
   - Verify port availability: `sudo netstat -tuln | grep 3000`
   - Check Node.js version: `node --version`

2. **NGINX isn't proxying requests**:
   - Check NGINX error logs: `sudo tail -f /var/log/nginx/error.log`
   - Verify NGINX is running: `sudo systemctl status nginx`
   - Test NGINX configuration: `sudo nginx -t`

3. **SSL certificate issues**:
   - Verify domain DNS: `nslookup yourdomain.com`
   - Check Certbot logs: `sudo journalctl -u certbot`
   - Manually renew: `sudo certbot renew --dry-run`