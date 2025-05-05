# Deployment Instructions for Spiritual Condition Tracker

## Quick Start (3 Steps)

1. Upload all project files to your server
2. Start the server: `node production-server.js` (or use PM2, see below)
3. Configure Apache (see below)

## Apache Reverse Proxy Configuration

Add these lines to your Apache site configuration:

```apache
<VirtualHost *:443>
    ServerName spiritual-condition.com
    ServerAlias www.spiritual-condition.com
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /path/to/your/certificate.crt
    SSLCertificateKeyFile /path/to/your/private.key
    SSLCertificateChainFile /path/to/your/chain.crt
    
    # Enable required modules (IMPORTANT)
    # Run: a2enmod proxy proxy_http proxy_wstunnel rewrite headers
    
    # Basic proxy configuration
    ProxyRequests Off
    ProxyPreserveHost On
    ProxyPass / http://localhost:3243/
    ProxyPassReverse / http://localhost:3243/
    
    # WebSocket proxy (CRITICAL for app to work)
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule /(.*) ws://localhost:3243/$1 [P,L]
    
    # Forward protocol information
    RequestHeader set X-Forwarded-Proto https
    RequestHeader set X-Forwarded-Port 443
    
    # Log settings
    ErrorLog ${APACHE_LOG_DIR}/spiritual-condition-error.log
    CustomLog ${APACHE_LOG_DIR}/spiritual-condition-access.log combined
</VirtualHost>
```

## Starting the Server with PM2 (Recommended)

```bash
# Install PM2 if needed
npm install -g pm2

# Start the server with PM2
pm2 start production-server.js --name spiritual-condition

# Auto-restart on server reboot
pm2 startup
pm2 save

# View logs
pm2 logs spiritual-condition
```

## Testing Your Deployment

Visit these URLs to test different parts of your setup:

1. https://spiritual-condition.com/ - Should show landing page with logo
2. https://spiritual-condition.com/server-test - Confirms Express is working
3. https://spiritual-condition.com/debug-headers - Shows request headers 
4. https://spiritual-condition.com/app - Main application

## Troubleshooting

If you encounter issues:

1. **Logo not showing:**
   - Check that logo.jpg is in both root and public directories
   - The server should copy it automatically, but you can do it manually:
     ```bash
     cp logo.jpg public/logo.jpg
     ```

2. **App not loading:**
   - Check Apache error logs: `tail -f /var/log/apache2/error.log`
   - Check Node.js logs: `pm2 logs spiritual-condition`
   - Make sure WebSocket proxy is configured correctly

3. **WebSocket issues:**
   - Ensure you have the required Apache modules enabled:
     ```bash
     a2enmod proxy proxy_http proxy_wstunnel rewrite headers
     systemctl restart apache2
     ```

4. **"Cannot GET /app" error:**
   - Log in to your server and check that Expo started properly:
     ```bash
     pm2 logs spiritual-condition
     ```
   - Look for "Expo: Waiting on http://localhost:5001" message