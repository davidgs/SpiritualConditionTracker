#!/bin/bash

# This script helps fix pod install errors by providing multiple installation methods

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PODFILE="$SCRIPT_DIR/Podfile"
WORKSPACE_FILE="$SCRIPT_DIR/AARecoveryTracker.xcworkspace"

# Function to check if pod command exists
check_pod_command() {
    if ! command -v pod &> /dev/null; then
        echo "CocoaPods is not installed or not in PATH."
        echo "Install CocoaPods with: sudo gem install cocoapods"
        exit 1
    fi
}

# Clean pod-related files
clean_pods() {
    echo "Cleaning pod installation..."
    rm -rf "$SCRIPT_DIR/Pods"
    rm -f "$SCRIPT_DIR/Podfile.lock"
    rm -rf "$WORKSPACE_FILE"
}

# Try multiple pod installation methods
try_pod_install() {
    cd "$SCRIPT_DIR"
    
    echo "Trying standard pod install..."
    pod install
    
    if [ $? -ne 0 ]; then
        echo "Standard pod install failed, trying with repo update..."
        pod install --repo-update
    fi
    
    if [ $? -ne 0 ]; then
        echo "Pod install with repo update failed, trying with --no-integrate..."
        pod install --no-integrate
    fi
    
    if [ $? -ne 0 ]; then
        echo "All regular pod install attempts failed. Trying minimal Podfile..."
        cp Podfile Podfile.backup
        cp Podfile.minimal Podfile
        pod install
        
        if [ $? -ne 0 ]; then
            echo "Minimal Podfile install also failed."
            echo "Restoring original Podfile..."
            cp Podfile.backup Podfile
            echo "Forcing workspace creation anyway..."
            ./force-workspace-creation.sh
            return 1
        else
            echo "Pod installation with minimal Podfile successful!"
            return 0
        fi
    else
        echo "Pod installation successful!"
        return 0
    fi
}

main() {
    check_pod_command
    
    # Clean pods if requested
    if [ "$1" == "--clean" ]; then
        clean_pods
    fi
    
    # Try pod install
    try_pod_install
    
    echo ""
    echo "Fix completed! Try to open the workspace in Xcode:"
    echo "open $WORKSPACE_FILE"
}

# Run the main function
main "$@"