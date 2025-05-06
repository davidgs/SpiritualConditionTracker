# Troubleshooting Nginx 500 Error for Expo Bundle

This guide helps diagnose and fix the 500 error you're encountering when trying to access:

```
https://spiritual-condition.com/index.bundle?platform=web&dev=true&transform.engine=hermes
```

## Diagnosing the Issue

A 500 Internal Server Error indicates something is wrong with your server configuration or the Expo server itself. Here are specific steps to diagnose:

### 1. Check if Expo server is running properly

First, verify the Expo server is running and responsive:

```bash
curl -I http://localhost:3243/index.bundle?platform=web&dev=true
```

If this returns a 200 response, your Expo server is working correctly.

### 2. Check Nginx error logs

Check the Nginx error logs for more details about the 500 error:

```bash
tail -f /var/log/nginx/error.log
```

Look for specific error messages related to proxy connection issues.

### 3. Test direct access without query parameters

Try accessing the bundle without query parameters to see if that resolves the issue:

```bash
curl -I http://localhost:3243/index.bundle
```

## Common Causes and Solutions

### 1. Connection Issues to Expo Server

If nginx can't connect to the Expo server (port 3243), you'll get a 500 error.

**Solution**: Make sure the Expo server is running and listening on the correct port:

```bash
netstat -tuln | grep 3243
```

### 2. Permissions Issues

Nginx might not have permission to connect to the Expo server.

**Solution**: Check user permissions and SELinux settings:

```bash
# If SELinux is enabled
sudo setsebool -P httpd_can_network_connect 1
```

### 3. Request Timeout

The Expo server might be taking too long to respond.

**Solution**: Increase timeouts in Nginx configuration:

```nginx
proxy_read_timeout 300s;
proxy_connect_timeout 300s;
proxy_send_timeout 300s;
```

### 4. Incomplete Proxy Setup

Your proxy setup might be missing important headers or configuration.

**Solution**: Use the provided `nginx-direct-expo.conf` which includes all necessary proxy settings.

### 5. MIME Type Handling

The Expo server might be sending the wrong MIME type for bundles.

**Solution**: Force the correct MIME type in nginx:

```nginx
proxy_hide_header Content-Type;
add_header Content-Type application/javascript always;
```

## Advanced Debugging

If the above solutions don't work, try these more advanced debugging steps:

### Check network connectivity between nginx and Expo server

```bash
sudo tcpdump -i lo port 3243
```

### Simplify your configuration temporarily

Create a minimal configuration that just proxies bundle requests to test:

```nginx
server {
    listen 80;
    server_name spiritual-condition.com;
    
    location ~ ^/index\.bundle {
        proxy_pass http://localhost:3243$request_uri;
    }
}
```

### Test with curl directly on the server

SSH into your server and test locally to bypass any network issues:

```bash
curl -I http://localhost:3243/index.bundle?platform=web&dev=true
```

## Application-Specific Fix

Based on your specific setup, we recommend using the `nginx-direct-expo.conf` configuration provided, which specifically addresses the Hermes bundle issue by:

1. Setting proper MIME types
2. Preserving all query parameters
3. Increasing timeout values
4. Adding detailed debug logging

If you continue to experience issues, check the debug log at `/var/log/nginx/expo-debug.log` for more specific error messages.