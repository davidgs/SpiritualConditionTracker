#!/bin/bash
set -e

echo "🔧 Starting fresh iOS build process..."

# Ensure we're in the expo-app directory
cd "$(dirname "$0")"

# Update package.json and package-lock.json
echo "📦 Running npm install to update package-lock.json..."
npm install

# Clean the iOS directory completely
echo "🧹 Removing existing iOS directory..."
rm -rf ios

# Generate a fresh native code
echo "🔄 Generating fresh native code with expo prebuild..."
npx expo prebuild --platform ios --clean

# Update app.json to disable new architecture
echo "⚙️ Updating app.json to disable new architecture..."
node -e "
const fs = require('fs');
const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
if (!appJson.expo) appJson.expo = {};
appJson.expo.jsEngine = 'jsc';
appJson.expo.newArchEnabled = false;
fs.writeFileSync('app.json', JSON.stringify(appJson, null, 2));
"

echo "✅ Fresh iOS code generated successfully!"
echo "🚀 Ready to run an EAS build with: npx eas build --platform ios --profile preview"