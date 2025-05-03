#!/bin/bash

echo "Fixing DoubleConversion issue for iOS build..."

# Create a directories for the needed headers
mkdir -p ios/DoubleConversion
mkdir -p ios/DoubleConversion/double-conversion

# Download the DoubleConversion source directly from GitHub
echo "Downloading DoubleConversion source..."
curl -s -L https://github.com/google/double-conversion/archive/v3.1.5.tar.gz | tar -xz -C /tmp
cp -r /tmp/double-conversion-3.1.5/double-conversion/* ios/DoubleConversion/double-conversion/

# Create the podspec file locally
echo "Creating local podspec file for DoubleConversion..."
cat > ios/DoubleConversion.podspec << 'EOF'
Pod::Spec.new do |spec|
  spec.name = 'DoubleConversion'
  spec.version = '1.1.6'
  spec.license = { :type => 'MIT' }
  spec.homepage = 'https://github.com/google/double-conversion'
  spec.summary = 'Efficient binary-decimal and decimal-binary conversion routines for IEEE doubles'
  spec.authors = 'Google'
  spec.source = { :git => 'https://github.com/google/double-conversion.git',
                  :tag => "v#{spec.version}" }
  spec.module_name = 'DoubleConversion'
  spec.header_dir = 'double-conversion'
  spec.source_files = 'ios/DoubleConversion/double-conversion/*.{h,cc}'
  spec.compiler_flags = '-Wno-unreachable-code'
  # Pinning to the same version as React.podspec.
  spec.platforms = { :ios => "12.4" }
end
EOF

# Update the Podfile to use our local copy
echo "Updating Podfile to use local DoubleConversion..."
cat > ios/Podfile << 'EOF'
require_relative '../node_modules/react-native/scripts/react_native_pods'

# Define iOS platform version
platform :ios, '15.1'

# Disable Codegen discovery to prevent failures
ENV['RCT_NEW_ARCH_ENABLED'] = '0'
ENV['NO_FLIPPER'] = '1'

prepare_react_native_project!

# Install pods with deterministic UUIDs
install! 'cocoapods', :deterministic_uuids => false

target 'AARecoveryTracker' do
  # React Native core
  use_react_native!(
    :path => "../node_modules/react-native",
    :hermes_enabled => true,
    :app_path => "#{Pod::Config.instance.installation_root}/.."
  )
  
  # Use our local DoubleConversion podspec instead of the one from React Native
  pod 'DoubleConversion', :podspec => './DoubleConversion.podspec'
  
  # Explicitly include other third-party specs
  pod 'glog', :podspec => '../node_modules/react-native/third-party-podspecs/glog.podspec'
  pod 'RCT-Folly', :podspec => '../node_modules/react-native/third-party-podspecs/RCT-Folly.podspec'
  
  # SQLite for local storage
  pod 'react-native-sqlite-storage', :path => '../node_modules/react-native-sqlite-storage'
  pod 'sqlite3', '~> 3.39.2'
  
  # Other required native modules
  pod 'RNVectorIcons', :path => '../node_modules/react-native-vector-icons'
  
  # Navigation dependencies
  pod 'RNScreens', :path => '../node_modules/react-native-screens'
  pod 'RNGestureHandler', :path => '../node_modules/react-native-gesture-handler'
  pod 'RNReanimated', :path => '../node_modules/react-native-reanimated'
  pod 'react-native-safe-area-context', :path => '../node_modules/react-native-safe-area-context'
  
  post_install do |installer|
    # Configure project
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.1'
        
        # Add SQLite header search paths if needed
        if target.name == 'react-native-sqlite-storage'
          config.build_settings['HEADER_SEARCH_PATHS'] ||= '$(inherited) '
          config.build_settings['HEADER_SEARCH_PATHS'] += '"${PODS_ROOT}/sqlite3/sqlite3-all"'
          config.build_settings['SWIFT_INCLUDE_PATHS'] = '$(inherited) $(PODS_ROOT)/sqlite3'
        end
        
        # Fix DoubleConversion header search paths specifically 
        if target.name.start_with?('React')
          config.build_settings['HEADER_SEARCH_PATHS'] ||= '$(inherited) '
          config.build_settings['HEADER_SEARCH_PATHS'] += '"$(PODS_ROOT)/DoubleConversion" '
        end
        
        # Handle Swift version
        if config.build_settings['SWIFT_VERSION']
          config.build_settings['SWIFT_VERSION'] = '5.0'
        end
        
        # Support for M1 Macs
        config.build_settings["EXCLUDED_ARCHS[sdk=iphonesimulator*]"] = "arm64"
      end
    end
    
    # Apply React Native specific fixes
    react_native_post_install(
      installer,
      '../node_modules/react-native',
      :mac_catalyst_enabled => false
    )
    
    # Apply minimum iOS deployment target
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        if config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'].to_f < 12.0
          config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '12.0'
        end
      end
    end
  end
end
EOF

echo "Cleaning previous build artifacts..."
rm -rf ios/Pods
rm -rf ios/Podfile.lock
rm -rf ios/build
rm -rf ios/*.xcworkspace

echo "Done! Now, on your local machine, run the following commands:"
echo "cd ios"
echo "pod install"
echo "Then open the workspace in Xcode:"
echo "open AARecoveryTracker.xcworkspace"