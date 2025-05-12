#!/bin/bash
set -e

# This script fixes the Podfile by completely replacing it with a known working version
# It's a minimal approach that focuses only on getting the build to work

echo "🔧 Creating simplified Podfile..."

# Navigate to the ios directory
cd "$(dirname "$0")/ios"

# Backup the original Podfile
cp Podfile Podfile.backup

# Create a new minimal Podfile
cat > Podfile << 'EOF'
require File.join(File.dirname(`node --print "require.resolve('expo/package.json')"`), "scripts/autolinking")
require File.join(File.dirname(`node --print "require.resolve('react-native/package.json')"`), "scripts/react_native_pods")
require File.join(File.dirname(`node --print "require.resolve('@react-native-community/cli-platform-ios/package.json')"`), "native_modules")

# Completely disable all new architecture features
ENV['RCT_NEW_ARCH_ENABLED'] = '0'
ENV['USE_HERMES'] = '0'
ENV['USE_FRAMEWORKS'] = 'static'
ENV['USE_FABRIC'] = '0'
ENV['FABRIC_ENABLED'] = '0'

platform :ios, '16.0'
prepare_react_native_project!

# The workaround target definition
target 'SpiritualConditionTracker' do
  use_expo_modules!
  
  config = use_native_modules!
  flags = get_default_flags()
  
  # Override the dependency on ReactAppDependencyProvider by using custom flags
  use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => false,
    :fabric_enabled => false
  )

  post_install do |installer|
    # Set proper iOS deployment target for all pods
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '16.0'
        
        # Ensure all builds have new architecture disabled
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)']
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'RCT_NEW_ARCH_ENABLED=0'
        
        # Skip building for specific problematic targets
        if ['React-Fabric', 'React-RCTFabric', 'ReactAppDependencyProvider'].include?(target.name)
          config.build_settings['DEAD_CODE_STRIPPING'] = 'YES'
          config.build_settings['EXCLUDED_ARCHS'] = 'arm64 x86_64'
        end
      end
    end
    
    # Mac Catalyst is unsupported
    react_native_post_install(installer)
  end
end
EOF

echo "✅ Created simplified Podfile - ready to run pod install"