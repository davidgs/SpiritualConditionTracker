#!/bin/bash
# Script to update the nginx configuration for the app

# Define the configuration file path - adjust as needed
CONFIG_FILE="/etc/nginx/sites-available/spiritual-condition.com.conf"
TEMP_FILE="/tmp/nginx-config-temp.conf"

# Create the new configuration segment
cat > "$TEMP_FILE" << 'EOF'
# Serve index.bundle statically
location = /index.bundle {
    alias /var/www/vhosts/spiritual-condition.com/httpdocs/index.bundle;
    default_type application/javascript;
    add_header Access-Control-Allow-Origin *;
    add_header Cache-Control "no-store, no-cache, must-revalidate";
}

# Also handle the /app/index.bundle path
location = /app/index.bundle {
    alias /var/www/vhosts/spiritual-condition.com/httpdocs/index.bundle;
    default_type application/javascript;
    add_header Access-Control-Allow-Origin *;
    add_header Cache-Control "no-store, no-cache, must-revalidate";
}

# Serve the main page statically
location / {
    # Just serve static files from the directory
    root /var/www/vhosts/spiritual-condition.com/httpdocs;
    index index.html;
    try_files $uri $uri/ /index.html;
}
EOF

# Check if the configuration file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo "Error: Configuration file $CONFIG_FILE not found."
    echo "Please adjust the CONFIG_FILE variable to point to your nginx configuration file."
    exit 1
fi

# Backup the original configuration
BACKUP_FILE="${CONFIG_FILE}.backup-$(date +%Y%m%d%H%M%S)"
cp "$CONFIG_FILE" "$BACKUP_FILE"
echo "Backup created at $BACKUP_FILE"

# Update the configuration file
# First, look for any existing location blocks for /index.bundle and /app/index.bundle
EXISTING_CONFIG=$(grep -A 10 "location.*index.bundle" "$CONFIG_FILE")
if [ -n "$EXISTING_CONFIG" ]; then
    echo "Found existing index.bundle configuration. Replacing..."
    # Use sed to replace the location blocks
    sed -i '/location.*index.bundle/,/}/d' "$CONFIG_FILE"
fi

# Look for the main location / block
EXISTING_ROOT_CONFIG=$(grep -A 10 "location.*/$" "$CONFIG_FILE")
if [ -n "$EXISTING_ROOT_CONFIG" ]; then
    echo "Found existing root location configuration. Replacing..."
    # Use sed to replace the location / block
    sed -i '/location.*\/$/,/}/d' "$CONFIG_FILE"
fi

# Append the new configuration at the end, just before the closing bracket
sed -i '$i\\n# Added by update-nginx.sh\n' "$CONFIG_FILE"
cat "$TEMP_FILE" >> "$CONFIG_FILE"

echo "Configuration updated. Testing nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "Configuration test successful. Reloading nginx..."
    systemctl reload nginx
    echo "Nginx reloaded successfully."
else
    echo "Configuration test failed. Restoring backup..."
    cp "$BACKUP_FILE" "$CONFIG_FILE"
    echo "Backup restored. Please check the configuration manually."
fi

# Clean up
rm "$TEMP_FILE"
echo "Done!"