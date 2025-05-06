#!/bin/bash
# Run script for the production hybrid server

# Stop any existing servers
echo "Stopping any existing servers..."
fuser -k 3243/tcp 2>/dev/null
fuser -k 19000/tcp 2>/dev/null

# Wait for processes to terminate
echo "Waiting for processes to terminate..."
sleep 3

# Create needed directories
mkdir -p static

# Remove any old log files
echo "Cleaning up old log files..."
rm -f production-server.log

# Start the production server
echo "Starting production hybrid server..."
node production-hybrid-server.js > server-output.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
echo "Waiting for server to start..."
sleep 5

# Check if server is running
if ps -p $SERVER_PID > /dev/null; then
  echo "Server started successfully with PID $SERVER_PID"
  echo "Log file: production-server.log"
  echo "You can monitor logs with: tail -f production-server.log"
  echo ""
  echo "Testing server:"
  curl -I http://localhost:3243/index.bundle
  echo ""
  echo "Testing nginx proxy:"
  echo "curl -I https://spiritual-condition.com/index.bundle"
else
  echo "Server failed to start. Check server-output.log for details."
  cat server-output.log
  exit 1
fi