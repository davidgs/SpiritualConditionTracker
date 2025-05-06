#!/bin/bash
# Script to run the static bundle server

# Stop any existing server on port 3243
echo "Stopping any existing processes on port 3243..."
fuser -k 3243/tcp 2>/dev/null

# Wait a moment for processes to terminate
sleep 2

# Create directory for static files if it doesn't exist
mkdir -p static

# Create a simple bundle file
echo "Creating static bundle file..."
cat > static/index.bundle << 'EOF'
// Static bundle for Spiritual Condition Tracker
console.log('Successfully loaded static bundle');
console.log('This is a fallback bundle - the app will have limited functionality');
// Initialize essential modules
require('react');
require('react-native');
require('expo');
EOF

# Start the static bundle server
echo "Starting static bundle server..."
node static-bundle-server.js > static-bundle-server.log 2>&1 &

# Wait for the server to start
sleep 2

# Test local access
echo "Testing local access to bundle:"
curl -I http://localhost:3243/index.bundle

# Print instructions
echo ""
echo "Now test through nginx with:"
echo "curl -I https://spiritual-condition.com/index.bundle"
echo ""
echo "Server logs are being written to static-bundle-server.log"
echo "You can monitor them with: tail -f static-bundle-server.log"