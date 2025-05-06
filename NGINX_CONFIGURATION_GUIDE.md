# Nginx Configuration Guide for Expo App

This guide provides instructions for configuring Nginx as a front-end proxy for your Expo app.

## The Server Stack

Your server setup consists of:
1. Nginx (front-end web server)
2. Apache (middleware server)
3. Expo server (running on port 3243)

This multi-layer approach requires proper configuration at each level to ensure requests are handled correctly.

## Nginx Configuration

Add the following to your Nginx server block:

```nginx
# Nginx configuration for Expo app
# This should be included in your server block for spiritual-condition.com

# Handle direct bundle requests with complex parameters at root level
location ~ ^/index\.bundle {
    # Preserve the original query string
    proxy_pass http://localhost:3243$request_uri;
    
    # Set proper headers
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Force the correct MIME type for JavaScript bundles
    add_header Content-Type application/javascript;
    
    # Increase timeouts for large bundles
    proxy_read_timeout 300s;
    proxy_connect_timeout 300s;
}

# Handle app path (proxy to Expo server)
location /app/ {
    # Remove the /app prefix when proxying to the Expo server
    rewrite ^/app/(.*) /$1 break;
    proxy_pass http://localhost:3243;
    
    # Set proper headers
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Handle WebSocket connections
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}

# Special handling for Hermes bundle requests
location ~ ^/index\.bundle\?.*transform\.engine=hermes.* {
    # This specific pattern needs special handling
    proxy_pass http://localhost:3243$request_uri;
    
    # Force JavaScript MIME type
    add_header Content-Type application/javascript;
    
    # Set headers
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}

# Handle asset requests
location ~ ^/assets/ {
    proxy_pass http://localhost:3243;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

# Enable CORS for all routes
add_header 'Access-Control-Allow-Origin' '*' always;
add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range' always;
```

## Example Full Server Block

```nginx
server {
    listen 80;
    server_name spiritual-condition.com www.spiritual-condition.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name spiritual-condition.com www.spiritual-condition.com;
    
    # SSL configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Document root for static files
    root /var/www/vhosts/spiritual-condition.com/httpdocs;
    
    # Include the Expo configuration
    include /path/to/nginx-expo-config.conf;
    
    # Default location
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Additional server configuration as needed
}
```

## Applying the Configuration

1. Save the Nginx configuration to a file (e.g., `/etc/nginx/conf.d/spiritual-condition.com.conf` or include it in your existing configuration)

2. Test the configuration:
   ```bash
   sudo nginx -t
   ```

3. If successful, reload Nginx:
   ```bash
   sudo systemctl reload nginx
   ```

## Testing the Configuration

Test direct access to the bundle with the Hermes parameters:

```bash
curl -I "https://spiritual-condition.com/index.bundle?platform=web&dev=true&transform.engine=hermes"
```

You should see:
- HTTP/2 200 response code
- `Content-Type: application/javascript` in the headers

## Debugging

If you still encounter issues:

1. Check Nginx error log:
   ```bash
   tail -f /var/log/nginx/error.log
   ```

2. Enable debug logging temporarily:
   ```nginx
   error_log /var/log/nginx/debug.log debug;
   ```

3. Verify direct access to the Apache or Expo servers:
   ```bash
   curl -I http://localhost:3243/index.bundle?platform=web&dev=true&transform.engine=hermes
   ```

4. Check network traffic flow with tcpdump:
   ```bash
   sudo tcpdump -i lo port 3243
   ```

## Security Considerations

- Review CORS settings based on your security requirements
- Consider adding rate limiting for public endpoints
- Implement appropriate caching strategies for static assets

## Alternative Direct Configuration

If you want to bypass Apache completely, you can configure Nginx to proxy directly to the Expo server by modifying the server block to point directly to port 3243 for all Expo-related routes.