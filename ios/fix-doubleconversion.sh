#!/bin/bash

echo "===== DoubleConversion Fix Script ====="
echo "This script will download and install DoubleConversion directly"

# Clean the existing pods
echo "Cleaning existing Pods..."
rm -rf Pods
rm -rf Podfile.lock
rm -rf *.xcworkspace

# Create a directory for DoubleConversion if it doesn't exist
mkdir -p DoubleConversion/double-conversion

# Clone the DoubleConversion repository
echo "Cloning DoubleConversion repository..."
git clone --depth 1 https://github.com/google/double-conversion.git temp-doubleconversion

# Find and list the contents to see the actual directory structure
echo "Checking repository structure..."
find temp-doubleconversion -type f -name "*.h" | head -n 5

# Copy the required files based on actual structure
echo "Copying DoubleConversion source files..."
mkdir -p DoubleConversion/double-conversion
cp temp-doubleconversion/double-conversion/*.h DoubleConversion/double-conversion/ 2>/dev/null || echo "No .h files found in expected location"
cp temp-doubleconversion/double-conversion/*.cc DoubleConversion/double-conversion/ 2>/dev/null || echo "No .cc files found in expected location"
cp temp-doubleconversion/src/*.h DoubleConversion/double-conversion/ 2>/dev/null || echo "No .h files found in src"
cp temp-doubleconversion/src/*.cc DoubleConversion/double-conversion/ 2>/dev/null || echo "No .cc files found in src"

# Clean up
echo "Cleaning up temporary files..."
rm -rf temp-doubleconversion

# Update Podfile to use local DoubleConversion
echo "Creating updated Podfile..."
cat > Podfile << 'EOF'
# iOS platform version
platform :ios, '15.1'

# No deterministic UUIDs
install! 'cocoapods', :deterministic_uuids => false

target 'AARecoveryTracker' do
  # Basic pods
  pod 'React', :path => '../node_modules/react-native/'
  pod 'React-Core', :path => '../node_modules/react-native/'
  
  # Manually add DoubleConversion
  pod 'DoubleConversion', :podspec => './DoubleConversion.podspec'
  
  # FBReactNativeSpec depends on DoubleConversion
  pod 'FBReactNativeSpec', :path => '../node_modules/react-native/React/FBReactNativeSpec'
  
  # RCTRequired is needed for FBReactNativeSpec
  pod 'RCTRequired', :path => '../node_modules/react-native/Libraries/RCTRequired'
  
  # Add SQLite storage
  pod 'react-native-sqlite-storage', :path => '../node_modules/react-native-sqlite-storage'
  pod 'sqlite3', '~> 3.39.2'
  
  post_install do |installer|
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.1'
        
        # For M1 Macs
        config.build_settings["EXCLUDED_ARCHS[sdk=iphonesimulator*]"] = "arm64"
      end
    end
  end
end
EOF

# Update DoubleConversion.podspec to use the local files
echo "Updating DoubleConversion.podspec..."
cat > DoubleConversion.podspec << 'EOF'
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
  
  # Use the local files we just copied
  spec.source_files = 'DoubleConversion/double-conversion/*.{h,cc}'
  
  spec.compiler_flags = '-Wno-unreachable-code'
  spec.platforms = { :ios => "15.1" }
  
  # Add these to avoid build errors
  spec.pod_target_xcconfig = {
    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++14',
    'HEADER_SEARCH_PATHS' => '$(PODS_TARGET_SRCROOT)'
  }
end
EOF

echo "Running pod install..."
pod install

echo "Done! Now try building the project."