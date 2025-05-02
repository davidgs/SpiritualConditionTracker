//
// Use this file to import your target's public headers that you would like to expose to Swift.
//

// React Native Core
#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>
#import <React/RCTRootView.h>

// For Bluetooth
#import <CoreBluetooth/CoreBluetooth.h>

// For Networking and WiFi
#import <Network/Network.h>
#import <NetworkExtension/NetworkExtension.h>
#import <CoreLocation/CoreLocation.h>

// For SQLite
#import <SQLite3/sqlite3.h>

// For Calendar
#import <EventKit/EventKit.h>

// For React Native Reanimated (if using)
#if __has_include(<React/RCTAnimationType.h>)
#import <React/RCTAnimationType.h>
#endif

// For React Native Gesture Handler (if using)
#if __has_include(<RNGestureHandler/RNGestureHandler.h>)
#import <RNGestureHandler/RNGestureHandler.h>
#endif
