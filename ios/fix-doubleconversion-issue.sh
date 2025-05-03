#!/bin/bash

# Create a directory for the custom build
mkdir -p ios/Pods/DoubleConversion

# Download the DoubleConversion source code
curl -L https://github.com/google/double-conversion/archive/refs/tags/v3.1.5.tar.gz | tar -xz -C ios/Pods/DoubleConversion --strip-components=1

# Create a CMakeLists.txt for building DoubleConversion
cat > ios/Pods/DoubleConversion/CMakeLists.txt << 'EOF'
cmake_minimum_required(VERSION 3.0)
project(double-conversion)

set(headers
    double-conversion/bignum.h
    double-conversion/cached-powers.h
    double-conversion/diy-fp.h
    double-conversion/double-conversion.h
    double-conversion/fast-dtoa.h
    double-conversion/fixed-dtoa.h
    double-conversion/ieee.h
    double-conversion/strtod.h
    double-conversion/utils.h
)

set(sources
    double-conversion/bignum.cc
    double-conversion/bignum-dtoa.cc
    double-conversion/cached-powers.cc
    double-conversion/diy-fp.cc
    double-conversion/double-conversion.cc
    double-conversion/fast-dtoa.cc
    double-conversion/fixed-dtoa.cc
    double-conversion/strtod.cc
)

add_library(double-conversion STATIC ${headers} ${sources})
target_include_directories(double-conversion PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})
EOF

# Create a custom Podfile that doesn't use DoubleConversion podspec
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
  
  # Manually include glog and Folly
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

# Clean the pods directory
cd ios
rm -rf Pods
rm -rf Podfile.lock
rm -rf build
rm -rf DerivedData
rm -rf *.xcworkspace

# Run pod install
pod install

echo "Done! Please open the workspace in Xcode:"
echo "open AARecoveryTracker.xcworkspace"
