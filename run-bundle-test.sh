#!/bin/bash
# Script to run the minimal bundle test server

# Stop any existing server on port 3243
echo "Stopping any existing processes on port 3243..."
fuser -k 3243/tcp 2>/dev/null

# Wait a moment for processes to terminate
sleep 2

# Start the minimal bundle test server
echo "Starting minimal bundle test server..."
node minimal-bundle-test.js > bundle-test.log 2>&1 &

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
echo "Server logs are being written to bundle-test.log"
echo "You can monitor them with: tail -f bundle-test.log"