#!/bin/bash
# Setup script for Spiritual Condition Tracker font fixes
# Run this on your server to fix the font loading issues

# Configuration - update these paths as needed
APP_DIR="/var/www/vhosts/spiritual-condition.com/httpdocs/SpiritualConditionTracker"
WEB_ROOT="/var/www/vhosts/spiritual-condition.com/httpdocs"
NGINX_CONFIG_PATH="/etc/nginx/sites-available/spiritual-condition.com.conf"

# Create fonts directory
echo "Creating fonts directory in web root..."
mkdir -p "$WEB_ROOT/fonts"

# Copy fonts from node_modules to web root
echo "Copying icon fonts to web root..."
cp "$APP_DIR/node_modules/react-native-vector-icons/Fonts"/*.ttf "$WEB_ROOT/fonts/"

# Copy fonts.css to web root
echo "Copying fonts.css to web root..."
cp "fonts.css" "$WEB_ROOT/fonts.css"

# Copy Nginx configuration
echo "Installing Nginx configuration..."
cp "nginx-direct-expo.conf" "$NGINX_CONFIG_PATH"

# Set permissions
echo "Setting proper permissions..."
chmod 644 "$WEB_ROOT/fonts"/*
chmod 644 "$WEB_ROOT/fonts.css"

# Test Nginx configuration
echo "Testing Nginx configuration..."
nginx -t

# Restart Nginx if test was successful
if [ $? -eq 0 ]; then
    echo "Nginx configuration is valid. Restarting Nginx..."
    systemctl restart nginx

    echo "Font fix setup completed successfully!"
    echo "Your Nginx server should now correctly serve font files and the app should work properly."
else
    echo "Warning: Nginx configuration test failed. Please check the Nginx error message above and fix it before restarting Nginx."
fi

# Create favicon
echo "Creating favicon.ico..."
if [ -f "$APP_DIR/expo-app/assets/icon.png" ]; then
    cp "$APP_DIR/expo-app/assets/icon.png" "$WEB_ROOT/favicon.ico"
    echo "Favicon created successfully."
else
    echo "Warning: Could not find app icon at $APP_DIR/expo-app/assets/icon.png"
    echo "You may need to create a favicon.ico manually."
fi

# Display instructions
echo ""
echo "=================== SETUP COMPLETE ==================="
echo "The font fix has been applied to your server."
echo ""
echo "Next steps to verify the fix:"
echo "1. Check your browser console for font loading errors"
echo "2. Verify that icons appear correctly in the app"
echo "3. If issues persist, check the Nginx error logs:"
echo "   tail -f /var/log/nginx/spiritual-condition.com-error.log"
echo ""
echo "Additional troubleshooting tips:"
echo "- Check that font files exist and are accessible: ls -la $WEB_ROOT/fonts/"
echo "- Verify the MIME types in Nginx are correct"
echo "- Clear your browser cache completely before testing"
echo "======================================================="