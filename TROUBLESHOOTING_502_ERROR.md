# Troubleshooting 502 Bad Gateway Error with Nginx and Expo

A 502 Bad Gateway error means nginx is able to communicate with the Expo server, but the communication is being interrupted or the response is malformed. Here's how to fix it:

## Common Causes of 502 Errors

1. **Firewall or Security Rules**: The server firewall might be blocking communication on port 3243
2. **Network Connectivity**: The connection between nginx and the Expo server is interrupted
3. **Response Size/Timeout**: The bundle is too large and times out before completing
4. **Reverse Proxy Configuration**: Missing essential proxy headers
5. **Response Format Issues**: Improper encoding or content type handling

## Step-by-Step Solutions

### 1. Verify the Expo Server is Running and Accessible Locally

Test direct access to the Expo server without going through nginx:

```bash
# Check if the Expo server is running
netstat -tuln | grep 3243

# Test direct access
curl -I "http://localhost:3243/index.bundle?platform=web&dev=true"
```

If this fails, make sure your Expo server is running properly first.

### 2. Check for Firewall Rules

```bash
# See if iptables is blocking local connections
sudo iptables -L | grep 3243

# Temporarily disable firewall for testing
sudo ufw disable
```

### 3. Modify the Nginx Configuration for Better Debug Info

Create an improved configuration with enhanced proxy settings:

```nginx
# Improved bundle handling with full debug info
location ~ ^/index\.bundle {
    # Enable detailed debugging
    error_log /var/log/nginx/bundle-error.log debug;
    
    # Proxy to Expo server with all parameters
    proxy_pass http://localhost:3243$request_uri;
    
    # Essential headers for proper proxying
    proxy_set_header Host $http_host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Increased timeouts for large bundles
    proxy_connect_timeout 600;
    proxy_send_timeout 600;
    proxy_read_timeout 600;
    send_timeout 600;
    
    # Disable buffering for immediate streaming
    proxy_buffering off;
    
    # Handle large response headers
    proxy_buffer_size 128k;
    proxy_buffers 4 256k;
    proxy_busy_buffers_size 256k;
    
    # Fix content type issues
    proxy_hide_header Content-Type;
    add_header Content-Type application/javascript;
    
    # Disable compression for troubleshooting
    proxy_set_header Accept-Encoding "";
}
```

### 4. Try Alternative Port Configuration

If your hosting environment restricts local connections, you might need to change your Expo server setup:

```javascript
// In production-server.js, ensure binding to 0.0.0.0 instead of localhost
const options = {
  dev: true,
  minify: false,
  https: false, // Try with both true and false
  host: '0.0.0.0', // Important: Bind to all interfaces, not just localhost
};
```

### 5. Test with a Minimal Bundle Request

Try a simpler bundle request to see if the complexity is causing issues:

```bash
curl -I "http://localhost:3243/index.bundle?platform=web"
```

### 6. Test Connectivity Between Nginx and Expo

Verify the network connectivity between nginx and the Expo server:

```bash
# Install tools for network diagnostics if needed
sudo apt install -y tcpdump

# Monitor traffic between nginx and Expo
sudo tcpdump -i lo port 3243

# In another terminal, make a request through nginx
curl -I "https://spiritual-condition.com/index.bundle?platform=web"
```

### 7. Consider a Direct Access Route

If your server environment has unusual restrictions, consider setting up direct access for troubleshooting:

```nginx
# Temporarily open direct access to the Expo server (security risk - only for testing)
server {
    listen 8082;
    server_name spiritual-condition.com;
    
    location / {
        proxy_pass http://localhost:3243;
    }
}
```

Then test with: `curl -I "http://spiritual-condition.com:8082/index.bundle?platform=web"`

## Security Notes

- Some of these troubleshooting steps involve temporarily disabling security measures
- Always revert any temporary testing changes after diagnosing the issue
- Avoid exposing your Expo development server directly to the internet without proper security