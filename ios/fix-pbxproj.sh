#!/bin/bash

# This script specifically fixes shellScript syntax issues in Xcode project.pbxproj files
# It addresses the "Nanaimo::Reader::ParseError - Dictionary missing ';' after key-value pair for shellScript" error

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_FILE="$SCRIPT_DIR/AARecoveryTracker.xcodeproj/project.pbxproj"

# Check if the project file exists
if [ ! -f "$PROJECT_FILE" ]; then
    echo "Error: project.pbxproj file not found at $PROJECT_FILE"
    exit 1
fi

echo "Creating backup of project.pbxproj..."
cp "$PROJECT_FILE" "$PROJECT_FILE.backup"

echo "Fixing shellScript syntax issues in project.pbxproj..."

# Create a temporary file for processing
TMP_FILE=$(mktemp)

# Process line by line to handle shellScript entries specifically
cat "$PROJECT_FILE" | while IFS= read -r line; do
    # Check if line contains shellScript definition
    if [[ $line == *"shellScript ="* ]]; then
        # Check if line ends with a semicolon
        if [[ $line != *";"* ]]; then
            # Add semicolon at the end
            line="${line};"
        fi
        
        # Escape dollar signs in shellScript
        line=$(echo "$line" | sed 's/\$/\\$/g')
    fi
    
    # Write the processed line to temp file
    echo "$line" >> "$TMP_FILE"
done

# Move the temp file back to the original
mv "$TMP_FILE" "$PROJECT_FILE"

# Fix any closing brackets without semicolons
perl -i -pe 's/([^;])\s*\}\s*;/$1;\n\t};/g' "$PROJECT_FILE"

echo "Fixes applied to project.pbxproj"
echo ""
echo "If the project still doesn't open correctly in Xcode, you can restore the backup:"
echo "cp \"$PROJECT_FILE.backup\" \"$PROJECT_FILE\""
echo ""
echo "Try opening the project now with:"
echo "open $SCRIPT_DIR/AARecoveryTracker.xcodeproj"