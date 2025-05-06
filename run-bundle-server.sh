#!/bin/bash

# This script runs the minimal bundle server for Spiritual Condition Tracker
# It ensures the server starts correctly and stays running

# Configuration
PORT=3243
LOG_FILE="bundle-server.log"

# Clean up any existing processes on the same port
echo "Checking for existing processes on port $PORT..."
pkill -f "node bundle-server.js" || true

# Start the server in the background
echo "Starting bundle server on port $PORT..."
nohup node bundle-server.js > "$LOG_FILE" 2>&1 &

# Store the PID
PID=$!
echo "Server started with PID: $PID"

# Wait a moment for the server to start
sleep 2

# Check if it's running
if ps -p $PID > /dev/null; then
  echo "Server is running correctly."
  
  # Test the bundle endpoint
  echo "Testing the bundle endpoint..."
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/index.bundle)
  
  if [ "$RESPONSE" == "200" ]; then
    echo "✅ Bundle endpoint is working correctly (HTTP 200)"
    echo "✅ Bundle server setup complete!"
    echo ""
    echo "The server is running in the background."
    echo "View logs with: tail -f $LOG_FILE"
    echo "Stop server with: pkill -f 'node bundle-server.js'"
  else
    echo "⚠️ Bundle endpoint returned HTTP $RESPONSE"
    echo "Check the server logs: $LOG_FILE"
  fi
else
  echo "❌ Server failed to start!"
  echo "Check the log file for errors: $LOG_FILE"
  cat "$LOG_FILE"
fi