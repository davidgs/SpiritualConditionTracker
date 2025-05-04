#!/bin/bash

# Script to login to EAS (Expo Application Services)
# This script guides users through the EAS login process

# Set error handling
set -e

echo "===== EAS Login Script ====="
echo "This script will help you log in to EAS for building the Spiritual Condition Tracker app."

# Check if eas-cli is installed
if ! command -v npx eas &> /dev/null; then
    echo "Installing EAS CLI..."
    npm install -g eas-cli
fi

# Check if already logged in
if npx eas whoami &> /dev/null; then
    user=$(npx eas whoami)
    echo "You are already logged in as: $user"
    
    # Ask if user wants to switch accounts
    read -p "Do you want to log out and switch accounts? (y/n): " switch
    if [ "$switch" = "y" ] || [ "$switch" = "Y" ]; then
        npx eas logout
    else
        echo "Keeping current login. You're all set!"
        exit 0
    fi
fi

# Login process
echo "Starting EAS login process..."
echo "You will need an Expo account. If you don't have one, you can create it during the login process."
echo "Opening browser for authentication..."

npx eas login

# Verify login was successful
if npx eas whoami &> /dev/null; then
    user=$(npx eas whoami)
    echo "Successfully logged in as: $user"
    echo "You're now ready to build the app with EAS!"
else
    echo "Login process did not complete successfully."
    echo "Please try again or visit https://expo.dev to create an account."
    exit 1
fi

echo "===== Login script complete ====="