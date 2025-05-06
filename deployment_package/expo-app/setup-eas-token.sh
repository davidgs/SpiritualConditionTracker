#!/bin/bash

# Script to help set up EAS token for Spiritual Condition Tracker
# This script guides users through the EAS token generation process

# Set error handling
set -e

echo "===== EAS Token Setup Script ====="
echo "This script will help you set up your EAS token for building the app."

echo ""
echo "Step 1: Generating a Token"
echo "------------------------"
echo "You need to generate an EAS token from the Expo website."
echo "1. Visit https://expo.dev/ and log in to your account"
echo "2. Go to your profile settings (click your avatar)"
echo "3. Navigate to 'Access Tokens'"
echo "4. Create a new token with a name like 'Spiritual Condition Tracker'"
echo ""

read -p "Have you generated a token on the Expo website? (y/n): " token_generated

if [ "$token_generated" != "y" ] && [ "$token_generated" != "Y" ]; then
    echo "Please generate a token first and run this script again."
    echo "See 'generate-eas-token.md' for detailed instructions."
    exit 0
fi

echo ""
echo "Step 2: Adding the Token"
echo "------------------------"
echo "Now you need to add the token to your environment."
echo "IMPORTANT: The token gives full access to your Expo account. Keep it secure!"
echo ""
echo "For security, the token will not be displayed as you paste it."

# Get token from user
read -s -p "Paste your EAS token: " token
echo ""

if [ -z "$token" ]; then
    echo "Error: No token was entered. Please try again."
    exit 1
fi

# Create a temporary file to test the token
echo "Testing your token..."
echo "export EXPO_TOKEN=$token" > .temp_token.sh
chmod +x .temp_token.sh
source .temp_token.sh

# Test the token
if npx eas whoami &> /dev/null; then
    user=$(npx eas whoami)
    echo "✅ Token is valid! You are authenticated as: $user"
    
    # Ask user to set up the token in Replit secrets
    echo ""
    echo "Step 3: Saving the Token"
    echo "------------------------"
    echo "To permanently save this token in your Replit project:"
    echo "1. Click on the 'Secrets' tab in the left sidebar (lock icon)"
    echo "2. Click 'New Secret'"
    echo "3. Key: EXPO_TOKEN"
    echo "4. Value: (paste your token)"
    echo "5. Click 'Save Secret'"
    echo ""
    echo "This will make the token available for all your builds."
else
    echo "❌ Token validation failed."
    echo "Please check that you copied the token correctly and try again."
fi

# Clean up
rm .temp_token.sh

echo ""
echo "===== EAS Token setup completed ====="