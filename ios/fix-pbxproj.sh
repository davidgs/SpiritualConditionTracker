#!/bin/bash

# This script fixes common syntax issues in Xcode project.pbxproj files
# Run this script when encountering errors like "Nanaimo::Reader::ParseError" or "Dictionary missing ';'"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_FILE="$SCRIPT_DIR/AARecoveryTracker.xcodeproj/project.pbxproj"

# Check if the project file exists
if [ ! -f "$PROJECT_FILE" ]; then
    echo "Error: project.pbxproj file not found at $PROJECT_FILE"
    exit 1
fi

echo "Creating backup of project.pbxproj..."
cp "$PROJECT_FILE" "$PROJECT_FILE.backup"

echo "Fixing syntax issues in project.pbxproj..."

# Fix 1: Ensure all dictionary entries end with semicolons
# This addresses the "Dictionary missing ';' after key-value pair" error
perl -i -pe 's/([^;\s])\s*\n\s*([a-zA-Z0-9_]+\s*=)/$1;\n\t$2/g' "$PROJECT_FILE"

# Fix 2: Fix shellScript entries that have unescaped dollar signs
# This addresses issues with shell script syntax in the project file
perl -i -pe 's/(shellScript\s*=\s*)"(.*?)([^\\])\$(.*)/$1"$2$3\\\$$4/g' "$PROJECT_FILE"

# Fix 3: Check for other common syntax errors
perl -i -pe 's/([^;])\s*\}\s*;/$1;\n\t};/g' "$PROJECT_FILE"

# Fix 4: Ensure all strings are properly terminated
perl -i -pe 's/([^\\])"([^"]*)$/\1"\2"/g if /^\s*[A-Za-z0-9_]+\s*=\s*"/' "$PROJECT_FILE"

# Fix 5: Clean up unnecessary escape characters
perl -i -pe 's/\\"/"/g' "$PROJECT_FILE"

# Fix 6: Re-add proper escaping for quotes in strings
perl -i -pe 's/([^\\])(".*?[^\\])(".*?[^\\])"/${1}${2}\\"${3}/g' "$PROJECT_FILE"

echo "Fixes applied to project.pbxproj"
echo ""
echo "If the project still doesn't open correctly in Xcode, you can restore the backup:"
echo "cp \"$PROJECT_FILE.backup\" \"$PROJECT_FILE\""
echo ""
echo "Try opening the project now with:"
echo "open $SCRIPT_DIR/AARecoveryTracker.xcodeproj"