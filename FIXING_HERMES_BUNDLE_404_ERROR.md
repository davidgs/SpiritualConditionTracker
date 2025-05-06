# Fixing 404 Error for Hermes Bundle Requests

This document specifically addresses the error:

```
GET https://spiritual-condition.com/index.bundle?platform=web&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.routerRoot=app&unstable_transformProfile=hermes-stable 404 (Not Found)
```

## The Problem

The Expo application is trying to load the JavaScript bundle directly from the root path (`/index.bundle`) with complex query parameters including Hermes engine configuration. Apache is currently not properly handling this request pattern.

## Solution: Direct Proxy for Root Bundle Requests

Instead of redirecting root bundle requests to `/app/index.bundle`, we need to directly proxy these requests to the Expo server to preserve all query parameters.

### Add This to Your Apache Configuration:

```apache
# Handle bundle requests at root path with complex query parameters
<LocationMatch "^/index\.bundle">
    RewriteEngine On
    RewriteCond %{QUERY_STRING} (.*)
    # Proxy directly to Expo server while preserving all query parameters
    RewriteRule ^/index\.bundle$ http://localhost:3243/index.bundle?%1 [P,L]
    ProxyPassReverse "http://localhost:3243/index.bundle"
    # Force JavaScript MIME type for all bundle responses
    ForceType application/javascript
</LocationMatch>

# Specific handling for Hermes engine bundles
<Location "/index.bundle">
    RewriteEngine On
    # Handle Hermes engine requests
    RewriteCond %{QUERY_STRING} transform\.engine=hermes
    RewriteRule ^/index\.bundle$ http://localhost:3243/index.bundle?%{QUERY_STRING} [P,L]
    # Force JavaScript MIME type
    ForceType application/javascript
</Location>
```

### Required Apache Modules:

Make sure these modules are enabled:

```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod rewrite
sudo a2enmod headers
```

### Verify the Configuration is Working:

After applying these changes and restarting Apache, verify with:

```bash
curl -I "https://spiritual-condition.com/index.bundle?platform=web&dev=true&transform.engine=hermes"
```

You should see a `200 OK` response with `Content-Type: application/javascript`.

## Alternative Approach using ProxyPassMatch

If the RewriteRule approach doesn't work, you can try this alternative:

```apache
# Handle Hermes bundle requests
ProxyPassMatch "^/index\.bundle(\?.*transform\.engine=hermes.*)$" "http://localhost:3243/index.bundle$1"
ProxyPassReverse "/index.bundle" "http://localhost:3243/index.bundle"

# Set content type for all bundle responses
<LocationMatch "^/index\.bundle">
    ForceType application/javascript
</LocationMatch>
```

## Debugging Tips

If you're still seeing 404 errors:

1. Check Apache error logs for any rewrite or proxy issues:
   ```bash
   tail -f /var/log/apache2/error.log
   ```

2. Temporarily enable more verbose Apache logging by adding to your VirtualHost:
   ```apache
   RewriteLogLevel 3
   RewriteLog ${APACHE_LOG_DIR}/rewrite.log
   ```

3. Test if the Expo server directly responds to the URL:
   ```bash
   curl -I "http://localhost:3243/index.bundle?platform=web&transform.engine=hermes"
   ```

4. Ensure mod_rewrite is enabled and functioning:
   ```bash
   apache2ctl -M | grep rewrite
   ```

These changes should fix the 404 error by properly routing bundle requests with complex query parameters directly to the Expo server.