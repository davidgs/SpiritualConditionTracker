#!/bin/bash

# This script specifically fixes the "Invalid character ";" in unquoted string" error
# by removing the extra semicolon after the classes declaration

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_FILE="$SCRIPT_DIR/AARecoveryTracker.xcodeproj/project.pbxproj"

# Check if the project file exists
if [ ! -f "$PROJECT_FILE" ]; then
    echo "Error: project.pbxproj file not found at $PROJECT_FILE"
    exit 1
fi

echo "Creating backup of project.pbxproj..."
cp "$PROJECT_FILE" "$PROJECT_FILE.backup-$(date +%Y%m%d%H%M%S)"

echo "Fixing extra semicolon in project.pbxproj..."

# First, check if the file contains the specific error
if grep -q "classes = {" "$PROJECT_FILE"; then
    echo "Found 'classes = {' line, looking for syntax error..."
    
    # Use sed to remove the extra semicolon after "classes = {};"
    sed -i.bak 's/classes = {\n[[:space:]]*;/classes = {/g' "$PROJECT_FILE"
    
    # For macOS compatibility, try a different sed approach if needed
    if grep -q "classes = {" "$PROJECT_FILE" && grep -q "^[[:space:]]*;" "$PROJECT_FILE"; then
        echo "Using alternative approach for macOS..."
        # Create a temp file
        TMP_FILE=$(mktemp)
        
        # Process the file line by line
        fixed=0
        while IFS= read -r line; do
            if [[ "$line" == *"classes = {"* ]]; then
                echo "$line" >> "$TMP_FILE"
                read -r next_line
                
                # Skip the line if it's just a semicolon
                if [[ "$next_line" =~ ^[[:space:]]*\;$ ]]; then
                    fixed=1
                    echo "Removed extra semicolon!"
                else
                    echo "$next_line" >> "$TMP_FILE"
                fi
            else
                echo "$line" >> "$TMP_FILE"
            fi
        done < "$PROJECT_FILE"
        
        if [ $fixed -eq 1 ]; then
            mv "$TMP_FILE" "$PROJECT_FILE"
        else
            echo "No extra semicolon found using method 2."
            rm "$TMP_FILE"
        fi
    fi
else
    echo "Did not find 'classes = {' line. This fix may not apply."
fi

# Now check a different location that often causes this error
if grep -q "objectVersion = " "$PROJECT_FILE"; then
    echo "Checking for problems around objectVersion..."
    
    # Remove any stray semicolons around objectVersion
    sed -i.bak2 's/};[[:space:]]*objectVersion/};\n\tobjectVersion/g' "$PROJECT_FILE"
fi

echo "Fixes applied to project.pbxproj"
echo ""
echo "You can now try pod deintegrate again."