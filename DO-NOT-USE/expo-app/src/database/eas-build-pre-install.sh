#!/bin/bash

# This script runs before the EAS build process to ensure all dependencies are properly set up

# Exit on error
set -e

echo "Starting EAS build pre-install setup..."

# Install critical dependencies
echo "Installing critical dependencies..."
npm install --no-save @expo/metro-config @react-native-async-storage/async-storage react-native-paper react-native-paper-dates

# Check if dependencies are installed
echo "Verifying dependencies..."
npm list @expo/metro-config --depth=0 || echo "WARNING: @expo/metro-config not found"
npm list @react-native-async-storage/async-storage --depth=0 || echo "WARNING: @react-native-async-storage/async-storage not found"
npm list react-native-paper-dates --depth=0 || echo "WARNING: react-native-paper-dates not found"

# Copy node_modules to expo-app if needed
if [ -d "expo-app" ]; then
  echo "Ensuring dependencies are available in expo-app directory..."
  
  # Create node_modules if it doesn't exist
  mkdir -p expo-app/node_modules
  
  # Copy key dependencies
  if [ -d "node_modules/@expo" ]; then
    echo "Copying @expo modules..."
    mkdir -p expo-app/node_modules/@expo
    cp -R node_modules/@expo/* expo-app/node_modules/@expo/ 2>/dev/null || :
  fi
  
  if [ -d "node_modules/@react-native-async-storage" ]; then
    echo "Copying @react-native-async-storage modules..."
    mkdir -p expo-app/node_modules/@react-native-async-storage
    cp -R node_modules/@react-native-async-storage/* expo-app/node_modules/@react-native-async-storage/ 2>/dev/null || :
  fi
  
  if [ -d "node_modules/react-native-paper-dates" ]; then
    echo "Copying react-native-paper-dates..."
    cp -R node_modules/react-native-paper-dates expo-app/node_modules/ 2>/dev/null || :
  fi
  
  if [ -d "node_modules/react-native-paper" ]; then
    echo "Copying react-native-paper..."
    cp -R node_modules/react-native-paper expo-app/node_modules/ 2>/dev/null || :
  fi
fi

# Create symlinks for key dependencies
echo "Creating symlinks for dependencies..."
ln -sf ../../node_modules/@expo/metro-config expo-app/node_modules/@expo/metro-config 2>/dev/null || :
ln -sf ../../node_modules/@react-native-async-storage/async-storage expo-app/node_modules/@react-native-async-storage/async-storage 2>/dev/null || :

# Ensure Podfile has correct dependencies
if [ -f "expo-app/ios/Podfile" ]; then
  echo "Checking Podfile..."
  # Add post_install hook if not present
  if ! grep -q "post_install" expo-app/ios/Podfile; then
    echo "Adding post_install hook to Podfile..."
    cat << 'EOF' >> expo-app/ios/Podfile

post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      # Set C++20 for all C++ files
      config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++20'
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '13.0'
      config.build_settings['EXCLUDED_ARCHS[sdk=iphonesimulator*]'] = ''
    end
  end
end
EOF
  fi
fi

echo "EAS build pre-install setup completed successfully!"