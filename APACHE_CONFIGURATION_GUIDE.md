# Advanced Apache Configuration Guide for Expo App

This guide provides detailed instructions for configuring Apache to correctly serve the Spiritual Condition Tracker Expo app.

## Understanding the Issues

When serving an Expo app through Apache proxy, there are several challenges to address:

1. **Path Mapping**: Expo serves from root (`/`), but Apache serves at `/app`
2. **Content Type Issues**: JavaScript bundles must have correct MIME types
3. **Header Preservation**: HTTP headers from Expo must be properly forwarded
4. **Asset Handling**: Various asset types (images, fonts) need correct handling

## Complete Apache Configuration

Add the following configuration to your Apache virtual host:

```apache
# Ensure headers for content types are preserved
<IfModule mod_headers.c>
    Header unset Content-Type
</IfModule>

# Global proxy settings for all requests
ProxyRequests Off
ProxyPreserveHost On
ProxyVia On

# Proxy all app root and subdirectory requests to the Expo server
<Location "/app">
    ProxyPass "http://localhost:3243/"
    ProxyPassReverse "http://localhost:3243/"
    # These directives ensure the content type is preserved
    SetEnv force-response-1.0 1
    SetEnv downgrade-1.0 1
    RequestHeader unset Accept-Encoding
</Location>

# Handle bundle requests - ensure JavaScript MIME type
<Location "/app/index.bundle">
    ProxyPass "http://localhost:3243/index.bundle"
    ProxyPassReverse "http://localhost:3243/index.bundle"
    # Ensure JavaScript MIME type
    SetEnv force-response-1.0 1
    SetEnv downgrade-1.0 1
    RequestHeader unset Accept-Encoding
    # Force the correct content type if needed
    <IfModule mod_headers.c>
        Header set Content-Type "application/javascript" env=!content_type
    </IfModule>
</Location>

# Handle asset requests
<LocationMatch "^/app/assets/(.*)$">
    ProxyPass "http://localhost:3243/assets/$1"
    ProxyPassReverse "http://localhost:3243/assets/$1"
    # Preserve header for assets
    SetEnv force-response-1.0 1
    SetEnv downgrade-1.0 1
    RequestHeader unset Accept-Encoding
</LocationMatch>

# Handle direct bundle requests at root and redirect to app path
<LocationMatch "^/index.bundle(.*)$">
    Redirect 307 /index.bundle$1 /app/index.bundle$1
</LocationMatch>
```

## Explanation of Key Directives

- **Header unset Content-Type**: Removes any default content type headers that might conflict
- **ProxyPreserveHost On**: Forwards the original host header to the Expo server
- **SetEnv force-response-1.0 1**: Forces HTTP/1.0 for better header handling
- **RequestHeader unset Accept-Encoding**: Prevents compression which can interfere with content type
- **Header set Content-Type "application/javascript"**: Ensures bundle is served as JavaScript

## Example Complete Virtual Host Configuration

```apache
<VirtualHost *:80>
    ServerName spiritual-condition.com
    DocumentRoot /var/www/vhosts/spiritual-condition.com/httpdocs

    # Standard configuration
    ErrorLog ${APACHE_LOG_DIR}/spiritual-condition.com-error.log
    CustomLog ${APACHE_LOG_DIR}/spiritual-condition.com-access.log combined

    # Load required modules
    <IfModule !mod_proxy.c>
        LoadModule proxy_module modules/mod_proxy.so
    </IfModule>
    <IfModule !mod_proxy_http.c>
        LoadModule proxy_http_module modules/mod_proxy_http.so
    </IfModule>
    <IfModule !mod_headers.c>
        LoadModule headers_module modules/mod_headers.so
    </IfModule>

    # Include the proxy configuration for Expo
    # Either include the file or paste the configuration here
    Include /path/to/apache-config-for-expo.conf

    # Other configuration as needed
</VirtualHost>
```

## Required Apache Modules

Make sure you have these modules enabled:

```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod headers
sudo a2enmod rewrite
sudo systemctl restart apache2
```

## Troubleshooting MIME Type Issues

If you still encounter MIME type errors:

1. Verify with curl that the content type is correct:
   ```bash
   curl -I https://spiritual-condition.com/app/index.bundle
   ```

2. If the content type is still wrong, you may need to force it with a stronger rule:
   ```apache
   <Location "/app/index.bundle">
       ProxyPass "http://localhost:3243/index.bundle"
       ProxyPassReverse "http://localhost:3243/index.bundle"
       # Force JavaScript MIME type
       ForceType application/javascript
   </Location>
   ```

3. Check Apache error logs for any header-related issues:
   ```bash
   tail -f /var/log/apache2/error.log
   ```

## Additional Configuration Tips

- Make sure SELinux allows httpd to make network connections if you're using RHEL/CentOS
- If needed, adjust firewall rules to allow Apache to connect to the Expo server
- Consider increasing proxy timeout settings for larger bundle files:
  ```apache
  ProxyTimeout 600
  ```

## Testing Your Configuration

Test that both HTML and bundle requests work properly:

```bash
# Should return HTML
curl -I https://spiritual-condition.com/app/

# Should return JavaScript with proper MIME type
curl -I https://spiritual-condition.com/app/index.bundle
```