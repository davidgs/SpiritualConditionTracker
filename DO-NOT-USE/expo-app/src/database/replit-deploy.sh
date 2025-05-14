#!/bin/bash
# Simple deployment script for Spiritual Condition Tracker

# Path to your source code on Replit
SOURCE_DIR=$(pwd)

# Path to your production server
SERVER_USER="your_username"
SERVER_HOST="your_server_hostname"
DEPLOY_DIR="/path/to/deployment/directory"

# Files to exclude from deployment
EXCLUDE_FILES=(
  ".git"
  "node_modules"
  ".replit"
  "replit.nix"
  "uv.lock"
)

# Create exclude pattern for rsync
EXCLUDE_PATTERN=""
for item in "${EXCLUDE_FILES[@]}"; do
  EXCLUDE_PATTERN="$EXCLUDE_PATTERN --exclude=$item"
done

# Display information
echo "======================================"
echo "Deploying Spiritual Condition Tracker"
echo "======================================"
echo "Source: $SOURCE_DIR"
echo "Destination: $SERVER_USER@$SERVER_HOST:$DEPLOY_DIR"
echo

# Create package list for deployment
echo "Creating package list..."
npm list --prod --json > deployment-packages.json

# Ensure logo is in both locations
echo "Ensuring logo is in both root and public directories..."
cp -f logo.jpg public/logo.jpg 2>/dev/null || true

# Ensure scripts are executable
echo "Making scripts executable..."
chmod +x *.sh 2>/dev/null || true

# Create deployment
echo "Creating deployment archive..."
mkdir -p deploy-tmp
rsync -av $EXCLUDE_PATTERN --delete $SOURCE_DIR/ deploy-tmp/

echo
echo "Ready for deployment!"
echo "To deploy to your server, run:"
echo "rsync -avz --delete $EXCLUDE_PATTERN deploy-tmp/ $SERVER_USER@$SERVER_HOST:$DEPLOY_DIR"
echo
echo "After deployment, on your server:"
echo "1. cd $DEPLOY_DIR"
echo "2. npm install --production" 
echo "3. pm2 start server-for-your-deployment.js --name spiritual-condition"
echo

# Cleanup
rm -rf deploy-tmp

echo "Done!"