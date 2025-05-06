#!/bin/bash
# Simple production server runner

# Stop any existing server on port 3243
echo "Stopping any existing server on port 3243..."
fuser -k 3243/tcp 2>/dev/null

# Wait for processes to terminate
sleep 2

# Create needed directories
mkdir -p static

# Remove any old log files
echo "Cleaning up old log files..."
rm -f production-server.log

# Start the simple production server
echo "Starting simple production server..."
node simple-production.js > server-output.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
echo "Waiting for server to start..."
sleep 2

# Check if server is running
if ps -p $SERVER_PID > /dev/null; then
  echo "Server started successfully with PID $SERVER_PID"
  echo "Testing server:"
  curl -I http://localhost:3243/index.bundle
  echo ""
  echo "Testing through nginx:"
  echo "curl -I https://spiritual-condition.com/index.bundle"
  echo ""
  echo "For full app functionality, start Expo separately:"
  echo "cd expo-app && npx expo start --port 19000"
else
  echo "Server failed to start. Check server-output.log for details."
  cat server-output.log
  exit 1
fi