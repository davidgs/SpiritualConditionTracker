#!/bin/bash

# This script forces the creation of the Xcode workspace file
# even if pod install fails

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
WORKSPACE_FILE="$SCRIPT_DIR/AARecoveryTracker.xcworkspace"
WORKSPACE_CONTENTS_DIR="$WORKSPACE_FILE/contents.xcworkspacedata"

echo "Creating minimal Xcode workspace..."

# Create the workspace directory if it doesn't exist
mkdir -p "$WORKSPACE_FILE"

# Create a minimal workspace contents file
cat > "$WORKSPACE_CONTENTS_DIR" << 'EOL'
<?xml version="1.0" encoding="UTF-8"?>
<Workspace
   version = "1.0">
   <FileRef
      location = "group:AARecoveryTracker.xcodeproj">
   </FileRef>
   <FileRef
      location = "group:Pods/Pods.xcodeproj">
   </FileRef>
</Workspace>
EOL

echo "Created minimal workspace at $WORKSPACE_FILE"
echo "You can now open it with: open $WORKSPACE_FILE"