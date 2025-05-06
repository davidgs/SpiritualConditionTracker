#!/bin/bash
# Script to update the index.html file with our enhanced static interface

# Path to the index.html file
HTML_PATH="/var/www/vhosts/spiritual-condition.com/httpdocs/index.html"

# Create backup
BACKUP_FILE="${HTML_PATH}.backup-$(date +%Y%m%d%H%M%S)"
cp "$HTML_PATH" "$BACKUP_FILE"
echo "Backup created at $BACKUP_FILE"

# Download the updated index.html file
echo "Updating index.html with enhanced static interface..."
curl -s https://replit.com/@davidgs/SpiritualConditionTracker/index.html -o "$HTML_PATH"

# Check file permissions
echo "Setting proper permissions..."
chmod 644 "$HTML_PATH"

echo "Done! The landing page has been updated with an embedded app interface."
echo "Visit https://spiritual-condition.com/ and click 'Launch App' to test."