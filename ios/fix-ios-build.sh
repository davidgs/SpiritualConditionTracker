#!/bin/bash

# Clean the project
echo "Cleaning iOS project..."
rm -rf Pods
rm -rf Podfile.lock
rm -rf build
rm -rf DerivedData
rm -rf *.xcworkspace

# Update the bridging header
echo "Updating bridging header..."
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

# Ensure AppDelegate uses pure React Native
echo "Updating AppDelegate.swift..."
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

# Run pod install
echo "Installing pods..."
pod install

echo "Done! Please open the workspace in Xcode:"
echo "open AARecoveryTracker.xcworkspace"