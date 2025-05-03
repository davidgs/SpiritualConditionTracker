#!/bin/bash

# This script fixes SQLite integration issues in iOS builds

echo "Fixing SQLite integration for iOS build..."

# Step 1: Clean Pods
echo "Step 1: Cleaning Pods..."
cd ios
rm -rf Pods
rm -rf Podfile.lock
rm -rf build
rm -rf DerivedData
rm -rf *.xcworkspace

# Ensure we have a clean Podfile with working post_install hooks
cat > Podfile << 'EOL'
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
  # Use direct references for reliability
  config = { :reactNativePath => "../node_modules/react-native" }
  
  # React Native core - with simplified config
  use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => true,
    :app_path => "#{Pod::Config.instance.installation_root}/.."
  )
  
  # Add SQLite for local storage - use a version that properly configures headers
  pod 'react-native-sqlite-storage', :path => '../node_modules/react-native-sqlite-storage'
  
  # Explicitly link system SQLite
  pod 'sqlite3', '~> 3.39.2'
  
  # Add other required native modules
  pod 'RNVectorIcons', :path => '../node_modules/react-native-vector-icons'
  
  # Navigation dependencies
  pod 'RNScreens', :path => '../node_modules/react-native-screens'
  pod 'RNGestureHandler', :path => '../node_modules/react-native-gesture-handler'
  pod 'RNReanimated', :path => '../node_modules/react-native-reanimated'
  pod 'react-native-safe-area-context', :path => '../node_modules/react-native-safe-area-context'
  
  # Fix header search paths and compiler flags for SQLite
  post_install do |installer|
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
    
    # Additional fixes from React Native post install
    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false
    )
    
    # Apply M1 workaround manually since the helper method doesn't exist
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        if config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'].to_f < 12.0
          config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '12.0'
        end
      end
    end
  end
end
EOL

# Step 2: Update Bridging Header and AppDelegate
echo "Step 2: Making sure Bridging Header is correct..."
cat > AARecoveryTracker/AARecoveryTracker-Bridging-Header.h << 'EOL'
#ifndef AARecoveryTracker_Bridging_Header_h
#define AARecoveryTracker_Bridging_Header_h

// React Native imports
#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

// Use system SQLite import instead of trying to reference SQLite3 directly
#import <sqlite3.h>

#endif /* AARecoveryTracker_Bridging_Header_h */
EOL

# Update AppDelegate to remove Expo references
echo "Step 2b: Replacing AppDelegate.swift with pure React Native version..."
cat > AARecoveryTracker/AppDelegate.swift << 'EOL'
import UIKit
import React

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, RCTBridgeDelegate {
  var window: UIWindow?

  func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    let jsCodeLocation: URL
    
    // Use the main bundle for production release
    jsCodeLocation = RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
    
    let rootView = RCTRootView(
      bundleURL: jsCodeLocation,
      moduleName: "AARecoveryTracker",
      initialProperties: nil,
      launchOptions: launchOptions
    )
    
    rootView.backgroundColor = UIColor(red: 1, green: 1, blue: 1, alpha: 1)
    
    let rootViewController = UIViewController()
    rootViewController.view = rootView
    
    self.window = UIWindow(frame: UIScreen.main.bounds)
    self.window?.rootViewController = rootViewController
    self.window?.makeKeyAndVisible()
    
    return true
  }
  
  // MARK: - RCTBridgeDelegate Method
  func sourceURL(for bridge: RCTBridge!) -> URL! {
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
  }
  
  // MARK: - UISceneSession Lifecycle
  func application(_ application: UIApplication, configurationForConnecting connectingSceneSession: UISceneSession, options: UIScene.ConnectionOptions) -> UISceneConfiguration {
    return UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
  }
  
  func application(_ application: UIApplication, didDiscardSceneSessions sceneSessions: Set<UISceneSession>) {
    // Called when the user discards a scene session
  }
}
EOL

# Step 3: Force SQLite framework linkage in the Xcode project (pbxproj)
echo "Step 3: Updating project.pbxproj..."
# Back up first
cp AARecoveryTracker.xcodeproj/project.pbxproj AARecoveryTracker.xcodeproj/project.pbxproj.backup

# Add libsqlite3.tbd to Frameworks if not present
if ! grep -q "libsqlite3.tbd" AARecoveryTracker.xcodeproj/project.pbxproj; then
  echo "Adding libsqlite3.tbd to frameworks..."
  # This is a complex operation normally requiring PlistBuddy or xcodeproj gem
  # For scripts, we'll need to manually inform the user to add it in Xcode
  echo "NOTE: Please manually add libsqlite3.tbd to your project frameworks in Xcode"
  echo "1. Open AARecoveryTracker.xcworkspace in Xcode"
  echo "2. Select the AARecoveryTracker target"
  echo "3. Go to 'Build Phases' tab"
  echo "4. Expand 'Link Binary With Libraries'"
  echo "5. Click + and search for 'libsqlite3.tbd', then add it"
fi

# Step 4: Install Pods with SQLite and correct search paths
echo "Step 4: Running pod install..."
pod install --verbose

echo "Done! Please open the workspace in Xcode:"
echo "open AARecoveryTracker.xcworkspace"
echo ""
echo "If you still encounter SQLite header issues, please follow the manual note above to add libsqlite3.tbd to your Xcode project."