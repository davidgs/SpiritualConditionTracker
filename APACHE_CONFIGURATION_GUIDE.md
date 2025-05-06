# Apache Configuration Guide

This guide provides instructions for configuring Apache to correctly serve the Spiritual Condition Tracker app.

## The Problem

The core issue is that the Expo server serves all assets from the root path (e.g., `/index.bundle`), but our Apache proxy serves the app at the `/app` path (e.g., `spiritual-condition.com/app`). This causes bundle loading errors.

## The Solution

The Apache configuration needs to:
1. Proxy requests for `/app` to the Expo server's root
2. Ensure bundle requests at `/app/index.bundle` get mapped to the Expo server's `/index.bundle`
3. Redirect any direct bundle requests at the root path to the `/app` path

## Implementation

Add the following configuration to your Apache virtual host:

```apache
# Proxy all app root and subdirectory requests to the Expo server
<Location "/app">
    ProxyPass "http://localhost:3243/"
    ProxyPassReverse "http://localhost:3243/"
</Location>

# Handle bundle requests
<Location "/app/index.bundle">
    ProxyPass "http://localhost:3243/index.bundle"
    ProxyPassReverse "http://localhost:3243/index.bundle"
</Location>

# Handle direct bundle requests at root and redirect to app path
<LocationMatch "^/index.bundle(.*)$">
    Redirect 307 /index.bundle$1 /app/index.bundle$1
</LocationMatch>
```

## Example Complete Virtual Host Configuration

```apache
<VirtualHost *:80>
    ServerName spiritual-condition.com
    DocumentRoot /var/www/vhosts/spiritual-condition.com/httpdocs

    # Standard configuration
    ErrorLog ${APACHE_LOG_DIR}/spiritual-condition.com-error.log
    CustomLog ${APACHE_LOG_DIR}/spiritual-condition.com-access.log combined

    # Proxy settings for Expo app
    <Location "/app">
        ProxyPass "http://localhost:3243/"
        ProxyPassReverse "http://localhost:3243/"
    </Location>

    <Location "/app/index.bundle">
        ProxyPass "http://localhost:3243/index.bundle"
        ProxyPassReverse "http://localhost:3243/index.bundle"
    </Location>

    <LocationMatch "^/index.bundle(.*)$">
        Redirect 307 /index.bundle$1 /app/index.bundle$1
    </LocationMatch>

    # Other configuration as needed
</VirtualHost>
```

## Make Sure Apache Has Required Modules

You need to have the following Apache modules enabled:

```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod rewrite
sudo systemctl restart apache2
```

## Troubleshooting

If you still experience issues:

1. Check Apache error logs: `tail -f /var/log/apache2/error.log`
2. Check the Expo server logs for any errors
3. Ensure the Expo server is running on port 3243
4. Verify the proxy settings are correct in your Apache configuration