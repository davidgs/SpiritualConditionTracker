#!/bin/bash

# This script creates a clean iOS project configuration for building with Xcode

echo "Creating a clean iOS project configuration for native builds..."

# Store the current directory
CURRENT_DIR=$(pwd)

# Step 1: Backup the current ios directory
echo "Backing up the current ios directory..."
if [ -d "ios" ]; then
  # Create backup directory if it doesn't exist
  mkdir -p ios-backup
  
  # Move the ios directory to backup
  mv ios ios-backup/ios-$(date +%Y%m%d%H%M%S)
  
  echo "Current ios directory backed up to ios-backup/ios-$(date +%Y%m%d%H%M%S)"
fi

# Step 2: Create a fresh ios directory
echo "Creating a fresh ios directory..."
mkdir -p ios
mkdir -p ios/AARecoveryTracker
mkdir -p ios/AARecoveryTracker/Images.xcassets
mkdir -p ios/AARecoveryTracker.xcodeproj

# Step 3: Create a clean Podfile
echo "Creating a clean Podfile..."
cat > ios/Podfile << 'EOL'
require_relative '../node_modules/react-native/scripts/react_native_pods'

# Define iOS platform version
platform :ios, '15.1'
prepare_react_native_project!

# Install pods with deterministic UUIDs
install! 'cocoapods', :deterministic_uuids => false

target 'AARecoveryTracker' do
  # Use direct references for reliability
  config = { :reactNativePath => "../node_modules/react-native" }
  
  # React Native core
  use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => true,
    :app_path => "#{Pod::Config.instance.installation_root}/.."
  )
  
  # Add SQLite for local storage
  pod 'react-native-sqlite-storage', :path => '../node_modules/react-native-sqlite-storage'
  
  # Add other required native modules
  pod 'react-native-geolocation', :path => '../node_modules/react-native-geolocation'
  pod 'react-native-calendar-events', :path => '../node_modules/react-native-calendar-events'
  pod 'react-native-notifications', :path => '../node_modules/react-native-notifications'
  pod 'react-native-device-info', :path => '../node_modules/react-native-device-info'
  
  # Minimal post-install configuration
  post_install do |installer|
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.1'
        
        # Handle Swift version if needed
        if config.build_settings['SWIFT_VERSION']
          config.build_settings['SWIFT_VERSION'] = '5.0'
        end
      end
    end
  end
end
EOL

# Step 4: Create placeholder files that will be replaced by CocoaPods
echo "Creating placeholder files for Xcode project..."

# Create project.pbxproj
cat > ios/AARecoveryTracker.xcodeproj/project.pbxproj << 'EOL'
// !$*UTF8*$!
{
	archiveVersion = 1;
	classes = {
	};
	objectVersion = 54;
	objects = {
		83CBB9F71A601CBA00E9B192 /* Project object */ = {
			isa = PBXProject;
			attributes = {
				LastUpgradeCheck = 1210;
				TargetAttributes = {
				};
			};
			buildConfigurationList = 83CBB9FA1A601CBA00E9B192 /* Build configuration list for PBXProject "AARecoveryTracker" */;
			compatibilityVersion = "Xcode 12.0";
			developmentRegion = en;
			hasScannedForEncodings = 0;
			knownRegions = (
				en,
				Base,
			);
			mainGroup = 83CBB9F61A601CBA00E9B192;
			productRefGroup = 83CBBA001A601CBA00E9B192 /* Products */;
			projectDirPath = "";
			projectRoot = "";
			targets = (
			);
		};
/* End PBXProject section */
	};
	rootObject = 83CBB9F71A601CBA00E9B192 /* Project object */;
}
EOL

# Create AppDelegate.swift
cat > ios/AARecoveryTracker/AppDelegate.swift << 'EOL'
import UIKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, RCTBridgeDelegate {
  var window: UIWindow?

  func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    // This is a placeholder AppDelegate that will be replaced by pod install
    return true
  }
}
EOL

# Create Info.plist
cat > ios/AARecoveryTracker/Info.plist << 'EOL'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleDevelopmentRegion</key>
	<string>en</string>
	<key>CFBundleDisplayName</key>
	<string>AARecoveryTracker</string>
	<key>CFBundleExecutable</key>
	<string>$(EXECUTABLE_NAME)</string>
	<key>CFBundleIdentifier</key>
	<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
	<key>CFBundleInfoDictionaryVersion</key>
	<string>6.0</string>
	<key>CFBundleName</key>
	<string>$(PRODUCT_NAME)</string>
	<key>CFBundlePackageType</key>
	<string>APPL</string>
	<key>CFBundleShortVersionString</key>
	<string>1.0</string>
	<key>CFBundleSignature</key>
	<string>????</string>
	<key>CFBundleVersion</key>
	<string>1</string>
	<key>LSRequiresIPhoneOS</key>
	<true/>
	<key>NSAppTransportSecurity</key>
	<dict>
		<key>NSExceptionDomains</key>
		<dict>
			<key>localhost</key>
			<dict>
				<key>NSExceptionAllowsInsecureHTTPLoads</key>
				<true/>
			</dict>
		</dict>
	</dict>
	<key>NSLocationWhenInUseUsageDescription</key>
	<string>The AA Recovery Tracker needs your location to find nearby AA meetings and connect with nearby AA members.</string>
	<key>UILaunchStoryboardName</key>
	<string>SplashScreen</string>
	<key>UIRequiredDeviceCapabilities</key>
	<array>
		<string>armv7</string>
	</array>
	<key>UISupportedInterfaceOrientations</key>
	<array>
		<string>UIInterfaceOrientationPortrait</string>
	</array>
	<key>UIViewControllerBasedStatusBarAppearance</key>
	<false/>
</dict>
</plist>
EOL

# Create a simple splash screen
cat > ios/AARecoveryTracker/SplashScreen.storyboard << 'EOL'
<?xml version="1.0" encoding="UTF-8"?>
<document type="com.apple.InterfaceBuilder3.CocoaTouch.Storyboard.XIB" version="3.0" toolsVersion="16096" targetRuntime="iOS.CocoaTouch" propertyAccessControl="none" useAutolayout="YES" launchScreen="YES" useTraitCollections="YES" useSafeAreas="YES" colorMatched="YES" initialViewController="EXPO-VIEWCONTROLLER-1">
    <device id="retina5_5" orientation="portrait" appearance="light"/>
    <dependencies>
        <deployment identifier="iOS"/>
        <plugIn identifier="com.apple.InterfaceBuilder.IBCocoaTouchPlugin" version="16087"/>
        <capability name="Safe area layout guides" minToolsVersion="9.0"/>
        <capability name="documents saved in the Xcode 8 format" minToolsVersion="8.0"/>
    </dependencies>
    <scenes>
        <scene sceneID="EXPO-SCENE-1">
            <objects>
                <viewController storyboardIdentifier="SplashScreenViewController" id="EXPO-VIEWCONTROLLER-1" sceneMemberID="viewController">
                    <view key="view" userInteractionEnabled="NO" contentMode="scaleToFill" insetsLayoutMarginsFromSafeArea="NO" id="EXPO-ContainerView" userLabel="ContainerView">
                        <rect key="frame" x="0.0" y="0.0" width="414" height="736"/>
                        <autoresizingMask key="autoresizingMask" flexibleMaxX="YES" flexibleMaxY="YES"/>
                        <subviews>
                            <imageView userInteractionEnabled="NO" contentMode="scaleAspectFill" horizontalHuggingPriority="251" verticalHuggingPriority="251" insetsLayoutMarginsFromSafeArea="NO" image="SplashScreenBackground" translatesAutoresizingMaskIntoConstraints="NO" id="EXPO-SplashScreenBackground" userLabel="SplashScreenBackground">
                                <rect key="frame" x="0.0" y="0.0" width="414" height="736"/>
                            </imageView>
                        </subviews>
                        <color key="backgroundColor" systemColor="systemBackgroundColor" cocoaTouchSystemColor="whiteColor"/>
                        <constraints>
                            <constraint firstItem="EXPO-SplashScreenBackground" firstAttribute="top" secondItem="EXPO-ContainerView" secondAttribute="top" id="1gX-mQ-vu6"/>
                            <constraint firstItem="EXPO-SplashScreenBackground" firstAttribute="leading" secondItem="EXPO-ContainerView" secondAttribute="leading" id="6tX-OG-Sck"/>
                            <constraint firstItem="EXPO-SplashScreenBackground" firstAttribute="trailing" secondItem="EXPO-ContainerView" secondAttribute="trailing" id="ABX-8g-7v4"/>
                            <constraint firstItem="EXPO-SplashScreenBackground" firstAttribute="bottom" secondItem="EXPO-ContainerView" secondAttribute="bottom" id="jkI-2V-eW5"/>
                        </constraints>
                        <viewLayoutGuide key="safeArea" id="Rmq-lb-GrQ"/>
                    </view>
                </viewController>
                <placeholder placeholderIdentifier="IBFirstResponder" id="EXPO-PLACEHOLDER-1" userLabel="First Responder" sceneMemberID="firstResponder"/>
            </objects>
            <point key="canvasLocation" x="140.625" y="129.4921875"/>
        </scene>
    </scenes>
    <resources>
        <image name="SplashScreenBackground" width="1" height="1"/>
    </resources>
</document>
EOL

# Create Bridging header
cat > ios/AARecoveryTracker/AARecoveryTracker-Bridging-Header.h << 'EOL'
#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>
#import <React/RCTEventEmitter.h>
EOL

# Create entitlements file
cat > ios/AARecoveryTracker/AARecoveryTracker.entitlements << 'EOL'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>aps-environment</key>
	<string>development</string>
</dict>
</plist>
EOL

# Step 5: Install required npm packages
echo "Installing required npm packages..."
npm install --save react-native-sqlite-storage react-native-geolocation react-native-calendar-events react-native-notifications react-native-device-info

# Step 6: Run pod install
echo "Running pod install to set up the Xcode project..."
cd ios
pod install
cd "$CURRENT_DIR"

echo "Clean iOS project setup complete!"
echo ""
echo "You can now open the Xcode workspace with:"
echo "open ios/AARecoveryTracker.xcworkspace"
echo ""
echo "Note: If you encounter any issues during pod install, try:"
echo "cd ios && pod install --repo-update"