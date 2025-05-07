#!/bin/bash
# Deployment script for Spiritual Condition Tracker fixes
# This script deploys the fixes to your production server

# Configuration - update these values
SERVER_USER="your-username"
SERVER_HOST="spiritual-condition.com"
APP_DIR="/var/www/vhosts/spiritual-condition.com/httpdocs/SpiritualConditionTracker"

# Files to deploy
FILES_TO_DEPLOY=(
  "fix-buildcache-provider.js"
  "deployment-server-with-fix.js"
)

# Deploy the files
echo "Deploying fixes to $SERVER_USER@$SERVER_HOST:$APP_DIR"
for file in "${FILES_TO_DEPLOY[@]}"; do
  echo "Copying $file..."
  scp "$file" "$SERVER_USER@$SERVER_HOST:$APP_DIR/"
done

# Apply the fixes
echo "Applying fixes on server..."
ssh "$SERVER_USER@$SERVER_HOST" "cd $APP_DIR && node fix-buildcache-provider.js"

# Restart the server
echo "Restarting server..."
ssh "$SERVER_USER@$SERVER_HOST" "cd $APP_DIR && pm2 stop spiritual-condition || true"
ssh "$SERVER_USER@$SERVER_HOST" "cd $APP_DIR && pm2 start deployment-server-with-fix.js --name spiritual-condition"

echo "Deployment completed!"
echo "Check the server logs to verify everything is working:"
echo "ssh $SERVER_USER@$SERVER_HOST \"cd $APP_DIR && pm2 logs spiritual-condition\""