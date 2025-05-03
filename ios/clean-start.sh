#!/bin/bash

# Clean everything
rm -rf Pods Podfile.lock *.xcworkspace

# Create clean Podfile that doesn't use troublesome dependencies
cat > Podfile << 'EOL'
# Platform
platform :ios, '15.1'

# Standard installation
install! 'cocoapods', :deterministic_uuids => false

target 'AARecoveryTracker' do
  # Bare minimum React Native requirements
  pod 'React', :path => '../node_modules/react-native/'
  pod 'React-Core', :path => '../node_modules/react-native/'
  
  # React Core UI components
  pod 'React-CoreModules', :path => '../node_modules/react-native/React/CoreModules'
  pod 'React-RCTImage', :path => '../node_modules/react-native/Libraries/Image'
  pod 'React-RCTNetwork', :path => '../node_modules/react-native/Libraries/Network'
  pod 'React-RCTText', :path => '../node_modules/react-native/Libraries/Text'
  
  # SQLite
  pod 'react-native-sqlite-storage', :path => '../node_modules/react-native-sqlite-storage'
  pod 'sqlite3'
  
  # Navigation components
  pod 'RNScreens', :path => '../node_modules/react-native-screens'
  pod 'RNGestureHandler', :path => '../node_modules/react-native-gesture-handler'
  pod 'react-native-safe-area-context', :path => '../node_modules/react-native-safe-area-context'
  
  # Add pod that relies on DoubleConversion to force inclusion without referencing it directly
  pod 'React-jsiexecutor', :path => '../node_modules/react-native/ReactCommon/jsiexecutor'
  
  post_install do |installer|
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.1'

        # Fix header search paths for all targets
        config.build_settings['HEADER_SEARCH_PATHS'] ||= '$(inherited) '
        
        # M1 Mac support
        config.build_settings["EXCLUDED_ARCHS[sdk=iphonesimulator*]"] = "arm64"
      end
    end
  end
end
EOL

echo "Created simplified Podfile that avoids problematic dependencies."
echo "On your local machine, run: cd ios && pod install"
