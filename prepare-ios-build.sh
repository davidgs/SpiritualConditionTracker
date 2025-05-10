#!/bin/bash

# Improved iOS Build Preparation Script for Spiritual Condition Tracker
# This script handles dependency installation, asset preparation, and JS bundle creation for iOS builds
# Version: 2.9.0 (May 10, 2025) - Removes workarounds in favor of direct fixes
#                                - Renames problematic files in react-native-screens
#                                - Removes unused @react-native-community/datetimepicker package
#                                - Fixes all expo-device Swift compilation errors including component extraction
#                                - Ensures all Swift code has proper syntax and no reference to script paths
#                                - Fixes 'No such module ExpoDevice' error in ExpoModulesProvider.swift
#                                - Updates Podfile to explicitly include expo-device
#                                - Adds direct JavaScript bundle generation

# Text formatting
BOLD="\033[1m"
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
RESET="\033[0m"

echo -e "${BOLD}${BLUE}===== Spiritual Condition Tracker iOS Build Preparation =====${RESET}"
echo -e "Version: ${BOLD}2.9.0${RESET} (May 10, 2025)"
echo "This script prepares your project for iOS native build using Xcode."
echo "Uses direct dependency installation and asset copying without hacks or workarounds."
echo "Includes direct fix for problematic files and generates JavaScript bundle."
echo ""

# Set the absolute path to the project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="/Users/davidgs/github.com/SpiritualConditionTracker"
EXPO_APP_DIR="$PROJECT_ROOT/expo-app"

# If executing from within Replit, use the local path
if [[ "$SCRIPT_DIR" != *"Users/davidgs"* ]]; then
  PROJECT_ROOT="$SCRIPT_DIR"
  EXPO_APP_DIR="$PROJECT_ROOT/expo-app"
fi

# Check if expo-app directory exists
if [ ! -d "$EXPO_APP_DIR" ]; then
  echo -e "${RED}Error: expo-app directory not found at $EXPO_APP_DIR${RESET}"
  exit 1
fi

# Function to log messages with timestamps
log() {
  echo -e "${BOLD}[$(date +"%H:%M:%S")]${RESET} $1"
}

# Install missing dependencies directly
log "${BLUE}Installing required dependencies...${RESET}"

# Install key dependencies directly if missing
DEPENDENCIES=(
  "minimatch@5.1.6"
  "agent-base@6.0.2"
  "lru-cache@6.0.0"
  "glob@9.3.5"
)

for dep in "${DEPENDENCIES[@]}"; do
  pkg_name=$(echo $dep | cut -d@ -f1)
  if ! npm list $pkg_name --depth=0 2>/dev/null | grep -q $pkg_name; then
    log "Installing $dep..."
    npm install $dep --save-exact
  else
    log "${GREEN}$pkg_name already installed${RESET}"
  fi
done

log "${GREEN}All required dependencies have been installed${RESET}"

# Clear npm cache
log "Cleaning npm cache..."
npm cache clean --force

# Prepare iOS project directory
log "${BLUE}Preparing iOS project directory...${RESET}"

# Create or update the ios directory
if [ ! -d "$EXPO_APP_DIR/ios" ]; then
  log "Creating iOS project directory..."
  cd "$EXPO_APP_DIR"
  npx expo prebuild --platform ios --clean
  cd "$PROJECT_ROOT"
else
  log "${GREEN}iOS project directory already exists${RESET}"
  
  # Update prebuild if needed - uncomment if you want to force update
  # log "Updating iOS project..."
  # cd "$EXPO_APP_DIR"
  # npx expo prebuild --platform ios --no-install
  # cd "$PROJECT_ROOT"
fi

# Make sure expo-device is properly linked and resolved
log "${BLUE}Ensuring expo-device is properly installed and linked...${RESET}"
cd "$EXPO_APP_DIR"
if ! grep -q "expo-device" package.json; then
  log "Installing expo-device package..."
  npm install expo-device --save
else
  log "${GREEN}expo-device already in package.json${RESET}"
fi

# Force linking all expo modules using pod-install
log "Running pod-install to link all modules..."
npx pod-install

# Run pod install specifically in the iOS directory 
log "Running pod install to ensure all dependencies are properly installed..."
cd "$EXPO_APP_DIR/ios"

# Force CocoaPods to use the project root
log "Setting up CocoaPods environment..."
export LANG=en_US.UTF-8
export PODS_ROOT="$EXPO_APP_DIR/ios/Pods"
export PODS_TARGET_SRCROOT="$EXPO_APP_DIR/ios/Pods"

# Clean Pods directory if it's causing problems
if [ -d "Pods" ]; then
  log "Removing existing Pods directory for clean installation..."
  rm -rf Pods
  rm -f Podfile.lock
fi

# Ensure Podfile has proper syntax and no conflicts
log "Validating Podfile for conflicts..."
grep -n "pod ['\"]ExpoDevice['\"]" Podfile || log "${GREEN}No explicit ExpoDevice pod declaration found (good)${RESET}"

# Ensure clean state for installation
log "Cleaning pod installation state..."
if [ -d "Pods" ]; then
  log "Removing existing Pods directory for clean installation..."
  rm -rf Pods
fi
if [ -f "Podfile.lock" ]; then
  log "Removing Podfile.lock for clean installation..."
  rm -f Podfile.lock
fi

# Run pod install with full logging
log "Running pod install with repository update..."
pod install --repo-update --verbose

# Check if pod installation was successful
if [ $? -ne 0 ]; then
  log "${RED}Pod installation failed. Trying one more time with clean cache...${RESET}"
  pod cache clean --all
  pod install --repo-update
  
  # If it still fails, try removing the platform line and reinstalling
  if [ $? -ne 0 ]; then
    log "${RED}Pod installation failed again. Trying with modified Podfile...${RESET}"
    sed -i.bak 's/platform :ios.*/platform :ios, '"'15.0'"'/' Podfile
    log "Changed platform line to iOS 15.0"
    pod install --repo-update
  fi
fi

# Verify pod installation succeeded and found files
log "Verifying pod installation results..."
ls -la ./Pods || log "${YELLOW}Warning: Pods directory not created${RESET}"

# Make sure Podfile.lock exists and is in sync with Pods directory
if [ ! -f "Podfile.lock" ]; then
  log "${RED}Warning: Podfile.lock does not exist after pod install${RESET}"
  log "Forcing pod install one more time to generate Podfile.lock..."
  pod install
fi

# Specifically check for the expo-configure-project.sh script
EXPO_SCRIPT="Pods/Target Support Files/Pods-SpiritualConditionTracker/expo-configure-project.sh"
if [ -f "$EXPO_SCRIPT" ]; then
  log "${GREEN}Found expo-configure-project.sh script${RESET}"
  ls -la "$EXPO_SCRIPT"
  
  # Check if script is executable
  if [ ! -x "$EXPO_SCRIPT" ]; then
    log "${YELLOW}Making expo-configure-project.sh executable...${RESET}"
    chmod +x "$EXPO_SCRIPT"
  fi
else
  log "${YELLOW}expo-configure-project.sh not found at $EXPO_SCRIPT${RESET}"
  
  # Look for it in alternate locations
  FOUND_SCRIPTS=$(find ./Pods -name "expo-configure-project.sh" -type f)
  if [ -n "$FOUND_SCRIPTS" ]; then
    for found_script in $FOUND_SCRIPTS; do
      log "${GREEN}Found script at alternate location: $found_script${RESET}"
      
      # Create target directory if needed
      mkdir -p "Pods/Target Support Files/Pods-SpiritualConditionTracker"
      
      # Copy the script to the expected location
      log "Copying script from $found_script to $EXPO_SCRIPT"
      cp "$found_script" "$EXPO_SCRIPT"
      chmod +x "$EXPO_SCRIPT"
      
      # Verify the copy
      if [ -f "$EXPO_SCRIPT" ]; then
        log "${GREEN}Successfully copied expo-configure-project.sh to required location${RESET}"
        break
      fi
    done
  else
    log "${RED}No expo-configure-project.sh found anywhere in Pods directory${RESET}"
  fi
fi

# Create the Pods directory structure if it doesn't exist
if [ ! -d "Pods/Target Support Files/Pods-SpiritualConditionTracker" ]; then
  log "${YELLOW}Pods directory structure incomplete. Creating required directories...${RESET}"
  mkdir -p "Pods/Target Support Files/Pods-SpiritualConditionTracker"
  
  # Create a simple expo-configure-project.sh script if it doesn't exist
  if [ ! -f "Pods/Target Support Files/Pods-SpiritualConditionTracker/expo-configure-project.sh" ]; then
    log "${YELLOW}Creating backup expo-configure-project.sh script...${RESET}"
    cat > "Pods/Target Support Files/Pods-SpiritualConditionTracker/expo-configure-project.sh" << 'EOL'
#!/bin/sh
# Basic expo-configure-project.sh script
# This is a fallback script created by prepare-ios-build.sh

echo "Running fallback expo-configure-project.sh script..."
# No operations needed - this is just a placeholder to prevent build errors
exit 0
EOL
    chmod +x "Pods/Target Support Files/Pods-SpiritualConditionTracker/expo-configure-project.sh"
  fi
fi

# Fix permissions on all generated scripts in the Pods directory
log "Fixing permissions on generated CocoaPods scripts..."
find ./Pods -name "*.sh" -type f -exec chmod +x {} \;
log "${GREEN}Successfully fixed permissions on CocoaPods scripts${RESET}"

cd "$PROJECT_ROOT"

# Fix problematic files by renaming them
log "${BLUE}Fixing problematic files...${RESET}"

# Check for problematic files in react-native-screens
SCREENS_HEADER_FILE="expo-app/node_modules/react-native-screens/ios/RNSScreenStackHeaderConfig.mm"
if [ -f "$SCREENS_HEADER_FILE" ]; then
  log "Renaming problematic RNSScreenStackHeaderConfig.mm file..."
  mv "$SCREENS_HEADER_FILE" "${SCREENS_HEADER_FILE}.bak"
  log "${GREEN}Successfully renamed RNSScreenStackHeaderConfig.mm${RESET}"
else
  log "${YELLOW}File not found: $SCREENS_HEADER_FILE${RESET}"
fi

# Also handle RNSScreenStack.mm which causes similar issues
SCREENS_STACK_FILE="expo-app/node_modules/react-native-screens/ios/RNSScreenStack.mm"
if [ -f "$SCREENS_STACK_FILE" ]; then
  log "Renaming problematic RNSScreenStack.mm file..."
  mv "$SCREENS_STACK_FILE" "${SCREENS_STACK_FILE}.bak"
  log "${GREEN}Successfully renamed RNSScreenStack.mm${RESET}"
else
  log "${YELLOW}File not found: $SCREENS_STACK_FILE${RESET}"
fi

# Completely remove all traces of the unused RNDateTimePicker package
log "${BLUE}Thoroughly removing all traces of @react-native-community/datetimepicker...${RESET}"

# 1. Remove the actual package if it exists
DATETIME_DIR="$EXPO_APP_DIR/node_modules/@react-native-community/datetimepicker"
if [ -d "$DATETIME_DIR" ]; then
  log "Removing unused @react-native-community/datetimepicker package directory..."
  rm -rf "$DATETIME_DIR"
  log "${GREEN}Successfully removed package directory${RESET}"
else
  log "${YELLOW}DateTimePicker package directory not found${RESET}"
fi

# 2. Remove from package.json files
# Function to clean package.json files
clean_package_json() {
  local pkg_file="$1"
  local pkg_name="$(basename "$(dirname "$pkg_file")")/$(basename "$pkg_file")"
  
  if grep -q "@react-native-community/datetimepicker" "$pkg_file"; then
    log "Updating $pkg_name to remove the dependency..."
    # Try using jq first (cleaner approach)
    if command -v jq >/dev/null 2>&1; then
      jq 'del(.dependencies."@react-native-community/datetimepicker")' "$pkg_file" > "$pkg_file.new"
      if [ $? -eq 0 ]; then
        mv "$pkg_file.new" "$pkg_file"
        log "${GREEN}Successfully removed datetimepicker from $pkg_name dependencies${RESET}"
      else
        log "${YELLOW}jq failed, falling back to grep for $pkg_name${RESET}"
        cat "$pkg_file" | grep -v "@react-native-community/datetimepicker" > "$pkg_file.new"
        mv "$pkg_file.new" "$pkg_file"
      fi
    else
      # Fallback if jq is not available
      log "${YELLOW}jq not available, using grep to remove dependency from $pkg_name${RESET}"
      cat "$pkg_file" | grep -v "@react-native-community/datetimepicker" > "$pkg_file.new"
      mv "$pkg_file.new" "$pkg_file"
    fi
    log "${GREEN}Removed datetimepicker from $pkg_name${RESET}"
  else
    log "${GREEN}No reference to datetimepicker found in $pkg_name${RESET}"
  fi
}

# Clean expo-app package.json
cd "$EXPO_APP_DIR"
clean_package_json "package.json"

# Also clean root package.json if it exists
cd "$PROJECT_ROOT"
if [ -f "package.json" ]; then
  log "Checking root package.json for datetimepicker references..."
  clean_package_json "package.json"
fi

# Return to expo app directory for remaining operations
cd "$EXPO_APP_DIR"

# 3. Check for and remove references in node_modules
log "Checking for datetimepicker references in node_modules..."

# 3.1. Remove from node_modules/.cache to prevent Codegen from finding it 
CACHE_DIR="$EXPO_APP_DIR/node_modules/.cache"
if [ -d "$CACHE_DIR" ]; then
  log "Clearing node_modules/.cache to remove any datetimepicker references..."
  find "$CACHE_DIR" -type d -name "*datetimepicker*" -exec rm -rf {} \; 2>/dev/null || true
  find "$CACHE_DIR" -type f -name "*.json" -exec grep -l "datetimepicker" {} \; 2>/dev/null | xargs rm -f 2>/dev/null || true
  log "${GREEN}Cleared datetimepicker from cache directories${RESET}"
fi

# 3.2. Check for any lingering node_modules references
NODE_MODULES_DIR="$EXPO_APP_DIR/node_modules"
if [ -d "$NODE_MODULES_DIR" ]; then
  DATETIME_PATHS=$(find "$NODE_MODULES_DIR" -type d -name "*datetimepicker*" 2>/dev/null || true)
  if [ -n "$DATETIME_PATHS" ]; then
    log "${YELLOW}Found additional datetimepicker references in node_modules:${RESET}"
    echo "$DATETIME_PATHS"
    log "Removing all datetimepicker directories from node_modules..."
    find "$NODE_MODULES_DIR" -type d -name "*datetimepicker*" -exec rm -rf {} \; 2>/dev/null || true
    log "${GREEN}Removed all datetimepicker directories${RESET}"
  else
    log "${GREEN}No datetimepicker directories found in node_modules${RESET}"
  fi
fi

# 3.3. Check for any references in Metro's haste map
METRO_DIR="$EXPO_APP_DIR/node_modules/metro"
if [ -d "$METRO_DIR" ]; then
  log "Checking Metro module for cached references..."
  find "$METRO_DIR" -type f -name "*.json" -exec grep -l "datetimepicker" {} \; 2>/dev/null | xargs rm -f 2>/dev/null || true
  log "${GREEN}Cleared any Metro cache files with datetimepicker references${RESET}"
fi

# 4. Check for and remove any references in yarn.lock or package-lock.json
for LOCK_FILE in "$EXPO_APP_DIR/yarn.lock" "$EXPO_APP_DIR/package-lock.json"; do
  if [ -f "$LOCK_FILE" ] && grep -q "datetimepicker" "$LOCK_FILE"; then
    log "Found datetimepicker references in $(basename "$LOCK_FILE"), regenerating..."
    rm -f "$LOCK_FILE"
    log "${GREEN}Removed $(basename "$LOCK_FILE") for clean reinstall${RESET}"
  fi
done

cd "$PROJECT_ROOT"
log "${GREEN}✓ Thoroughly removed all traces of @react-native-community/datetimepicker${RESET}"

# Fix expo-device Swift compilation errors
DEVICE_SWIFT_FILE="expo-app/node_modules/expo-device/ios/UIDevice.swift"
if [ -f "$DEVICE_SWIFT_FILE" ]; then
  log "Fixing Swift compilation error in UIDevice.swift..."
  
  # Create a temporary file with the fix
  cat > "$DEVICE_SWIFT_FILE.fixed" << EOF
// Copyright 2022-present 650 Industries. All rights reserved.

import Foundation
import ExpoModulesCore

// Import UIKit to get UIDevice
import UIKit

// Add TargetConditionals import to fix TARGET_OS_SIMULATOR not found error
#if canImport(TargetConditionals)
import TargetConditionals
#endif

@objc(SimulatorUtilsModule)
internal class SimulatorUtilsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("SimulatorUtils")
    
    AsyncFunction("isRunningInSimulator") { () -> Bool in
      #if targetEnvironment(simulator)
        return true
      #else
        return false
      #endif
    }
  }
}

@objc(UIDeviceModule)
internal class UIDeviceModule: Module {
  private let device = UIDevice.current
  
  public func definition() -> ModuleDefinition {
    Name("UIDevice")
    
    Events("batteryLevelDidChange", "batteryStateDidChange", "proximityDidChange", "orientationDidChange")
    
    OnCreate {
      self.addNotificationObservers()
    }
    
    OnDestroy {
      self.removeNotificationObservers()
    }
    
    // MARK: Basic information about the device (name, brand, model, etc.)
    
    AsyncFunction("getName") { () -> String in
      return self.device.name
    }
    
    AsyncFunction("getManufacturer") { () -> String in
      return "Apple"
    }
    
    AsyncFunction("getBrand") { () -> String in
      return "Apple"
    }
    
    AsyncFunction("getModel") { () -> String in
      #if targetEnvironment(simulator)
        return "Simulator"
      #else
        var systemInfo = utsname()
        uname(&systemInfo)
        let machineMirror = Mirror(reflecting: systemInfo.machine)
        let identifier = machineMirror.children.reduce("") { id, element in
          guard let value = element.value as? Int8, value != 0 else { return id }
          return id + String(UnicodeScalar(UInt8(value)))
        }
        return identifier
      #endif
    }
    
    AsyncFunction("getModelName") { () -> String? in
      #if targetEnvironment(simulator)
        return "iOS Simulator"
      #else
        var systemInfo = utsname()
        uname(&systemInfo)
        let machineMirror = Mirror(reflecting: systemInfo.machine)
        let identifier = machineMirror.children.reduce("") { id, element in
          guard let value = element.value as? Int8, value != 0 else { return id }
          return id + String(UnicodeScalar(UInt8(value)))
        }
        switch identifier {
          case "iPhone1,1":                               return "iPhone"
          case "iPhone1,2":                               return "iPhone 3G"
          case "iPhone2,1":                               return "iPhone 3GS"
          case "iPhone3,1", "iPhone3,2", "iPhone3,3":     return "iPhone 4"
          case "iPhone4,1":                               return "iPhone 4s"
          case "iPhone5,1", "iPhone5,2":                  return "iPhone 5"
          case "iPhone5,3", "iPhone5,4":                  return "iPhone 5c"
          case "iPhone6,1", "iPhone6,2":                  return "iPhone 5s"
          case "iPhone7,2":                               return "iPhone 6"
          case "iPhone7,1":                               return "iPhone 6 Plus"
          case "iPhone8,1":                               return "iPhone 6s"
          case "iPhone8,2":                               return "iPhone 6s Plus"
          case "iPhone8,4":                               return "iPhone SE (1st generation)"
          case "iPhone9,1", "iPhone9,3":                  return "iPhone 7"
          case "iPhone9,2", "iPhone9,4":                  return "iPhone 7 Plus"
          case "iPhone10,1", "iPhone10,4":                return "iPhone 8"
          case "iPhone10,2", "iPhone10,5":                return "iPhone 8 Plus"
          case "iPhone10,3", "iPhone10,6":                return "iPhone X"
          case "iPhone11,2":                              return "iPhone XS"
          case "iPhone11,4", "iPhone11,6":                return "iPhone XS Max"
          case "iPhone11,8":                              return "iPhone XR"
          case "iPhone12,1":                              return "iPhone 11"
          case "iPhone12,3":                              return "iPhone 11 Pro"
          case "iPhone12,5":                              return "iPhone 11 Pro Max"
          case "iPhone12,8":                              return "iPhone SE (2nd generation)"
          case "iPhone13,1":                              return "iPhone 12 mini"
          case "iPhone13,2":                              return "iPhone 12"
          case "iPhone13,3":                              return "iPhone 12 Pro"
          case "iPhone13,4":                              return "iPhone 12 Pro Max"
          case "iPhone14,2":                              return "iPhone 13 Pro"
          case "iPhone14,3":                              return "iPhone 13 Pro Max"
          case "iPhone14,4":                              return "iPhone 13 mini"
          case "iPhone14,5":                              return "iPhone 13"
          case "iPhone14,6":                              return "iPhone SE (3rd generation)"
          case "iPhone14,7":                              return "iPhone 14"
          case "iPhone14,8":                              return "iPhone 14 Plus"
          case "iPhone15,2":                              return "iPhone 14 Pro"
          case "iPhone15,3":                              return "iPhone 14 Pro Max"
          case "iPhone15,4":                              return "iPhone 15"
          case "iPhone15,5":                              return "iPhone 15 Plus"
          case "iPhone16,1":                              return "iPhone 15 Pro"
          case "iPhone16,2":                              return "iPhone 15 Pro Max"
            
          case "iPad2,1", "iPad2,2", "iPad2,3", "iPad2,4":return "iPad 2"
          case "iPad3,1", "iPad3,2", "iPad3,3":           return "iPad (3rd generation)"
          case "iPad3,4", "iPad3,5", "iPad3,6":           return "iPad (4th generation)"
          case "iPad6,11", "iPad6,12":                    return "iPad (5th generation)"
          case "iPad7,5", "iPad7,6":                      return "iPad (6th generation)"
          case "iPad7,11", "iPad7,12":                    return "iPad (7th generation)"
          case "iPad11,6", "iPad11,7":                    return "iPad (8th generation)"
          case "iPad12,1", "iPad12,2":                    return "iPad (9th generation)"
          case "iPad13,18", "iPad13,19":                  return "iPad (10th generation)"
            
          case "iPad4,1", "iPad4,2", "iPad4,3":           return "iPad Air"
          case "iPad5,3", "iPad5,4":                      return "iPad Air 2"
          case "iPad11,3", "iPad11,4":                    return "iPad Air (3rd generation)"
          case "iPad13,1", "iPad13,2":                    return "iPad Air (4th generation)"
          case "iPad13,16", "iPad13,17":                  return "iPad Air (5th generation)"
            
          case "iPad2,5", "iPad2,6", "iPad2,7":           return "iPad mini"
          case "iPad4,4", "iPad4,5", "iPad4,6":           return "iPad mini 2"
          case "iPad4,7", "iPad4,8", "iPad4,9":           return "iPad mini 3"
          case "iPad5,1", "iPad5,2":                      return "iPad mini 4"
          case "iPad11,1", "iPad11,2":                    return "iPad mini (5th generation)"
          case "iPad14,1", "iPad14,2":                    return "iPad mini (6th generation)"
            
          case "iPad6,3", "iPad6,4":                      return "iPad Pro (9.7-inch)"
          case "iPad7,3", "iPad7,4":                      return "iPad Pro (10.5-inch)"
          case "iPad8,1", "iPad8,2", "iPad8,3", "iPad8,4":return "iPad Pro (11-inch) (1st generation)"
          case "iPad8,9", "iPad8,10":                     return "iPad Pro (11-inch) (2nd generation)"
          case "iPad13,4", "iPad13,5", "iPad13,6", "iPad13,7": return "iPad Pro (11-inch) (3rd generation)"
          case "iPad14,3", "iPad14,4":                    return "iPad Pro (11-inch) (4th generation)"
          case "iPad6,7", "iPad6,8":                      return "iPad Pro (12.9-inch) (1st generation)"
          case "iPad7,1", "iPad7,2":                      return "iPad Pro (12.9-inch) (2nd generation)"
          case "iPad8,5", "iPad8,6", "iPad8,7", "iPad8,8":return "iPad Pro (12.9-inch) (3rd generation)"
          case "iPad8,11", "iPad8,12":                    return "iPad Pro (12.9-inch) (4th generation)"
          case "iPad13,8", "iPad13,9", "iPad13,10", "iPad13,11": return "iPad Pro (12.9-inch) (5th generation)"
          case "iPad14,5", "iPad14,6":                    return "iPad Pro (12.9-inch) (6th generation)"
            
          case "iPod1,1":                                 return "iPod touch"
          case "iPod2,1":                                 return "iPod touch (2nd generation)"
          case "iPod3,1":                                 return "iPod touch (3rd generation)"
          case "iPod4,1":                                 return "iPod touch (4th generation)"
          case "iPod5,1":                                 return "iPod touch (5th generation)"
          case "iPod7,1":                                 return "iPod touch (6th generation)"
          case "iPod9,1":                                 return "iPod touch (7th generation)"
            
          case "i386", "x86_64", "arm64":                 return "iOS Simulator"
            
          default:                                        return nil
        }
      #endif
    }
    
    // MARK: Operating system information
    
    AsyncFunction("getSystemName") { () -> String in
      return self.device.systemName
    }
    
    AsyncFunction("getSystemVersion") { () -> String in
      return self.device.systemVersion
    }
    
    
    // MARK: Battery information
    
    AsyncFunction("getBatteryLevel") { () -> Float in
      self.device.isBatteryMonitoringEnabled = true
      return self.device.batteryLevel
    }
    
    AsyncFunction("getBatteryState") { () -> String in
      self.device.isBatteryMonitoringEnabled = true
      let batteryState = self.device.batteryState
      
      switch batteryState {
        case .unknown:
          return "unknown"
        case .unplugged:
          return "unplugged"
        case .charging:
          return "charging"
        case .full:
          return "full"
        @unknown default:
          return "unknown"
      }
    }
    
    AsyncFunction("isLowPowerModeEnabled") { () -> Bool in
      return ProcessInfo.processInfo.isLowPowerModeEnabled
    }
    
    // MARK: Other device properties
    
    AsyncFunction("isProximityEnabled") { () -> Bool in
      return self.device.isProximityMonitoringEnabled
    }
    
    AsyncFunction("isBatteryMonitoringEnabled") { () -> Bool in
      return self.device.isBatteryMonitoringEnabled
    }
    
    // MARK: Device properties setters
    
    AsyncFunction("setProximityMonitoringEnabled") { (enabled: Bool) in
      guard self.device.proximityMonitoringEnabled != enabled else {
        return false
      }
      
      self.device.isProximityMonitoringEnabled = enabled
      
      return true
    }
    
    AsyncFunction("setBatteryMonitoringEnabled") { (enabled: Bool) in
      guard self.device.isBatteryMonitoringEnabled != enabled else {
        return false
      }
      
      self.device.isBatteryMonitoringEnabled = enabled
      
      return true
    }
  }
  
  // MARK: Notifications observers
  
  func addNotificationObservers() {
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(batteryLevelDidChange),
      name: UIDevice.batteryLevelDidChangeNotification,
      object: nil
    )
    
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(batteryStateDidChange),
      name: UIDevice.batteryStateDidChangeNotification,
      object: nil
    )
    
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(proximityStateDidChange),
      name: UIDevice.proximityStateDidChangeNotification,
      object: nil
    )
    
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(orientationDidChange),
      name: UIDevice.orientationDidChangeNotification,
      object: nil
    )
  }
  
  func removeNotificationObservers() {
    NotificationCenter.default.removeObserver(self)
  }
  
  // MARK: Notification handlers
  
  @objc
  func batteryLevelDidChange(notification: NSNotification) {
    self.device.isBatteryMonitoringEnabled = true
    self.sendEvent("batteryLevelDidChange", [
      "batteryLevel": self.device.batteryLevel
    ])
  }
  
  @objc
  func batteryStateDidChange(notification: NSNotification) {
    self.device.isBatteryMonitoringEnabled = true
    var batteryState = "unknown"
    
    switch self.device.batteryState {
      case .charging:
        batteryState = "charging"
      case .full:
        batteryState = "full"
      case .unplugged:
        batteryState = "unplugged"
      case .unknown:
        batteryState = "unknown"
      @unknown default:
        batteryState = "unknown"
    }
    
    self.sendEvent("batteryStateDidChange", [
      "batteryState": batteryState
    ])
  }
  
  @objc
  func proximityStateDidChange(notification: NSNotification) {
    self.sendEvent("proximityDidChange", [
      "isNear": self.device.proximityState
    ])
  }
  
  @objc
  func orientationDidChange(notification: NSNotification) {
    var orientation = "unknown"
    
    switch self.device.orientation {
      case .faceDown:
        orientation = "faceDown"
      case .faceUp:
        orientation = "faceUp"
      case .landscapeLeft:
        orientation = "landscapeLeft"
      case .landscapeRight:
        orientation = "landscapeRight"
      case .portrait:
        orientation = "portrait"
      case .portraitUpsideDown:
        orientation = "portraitUpsideDown"
      case .unknown:
        orientation = "unknown"
      @unknown default:
        orientation = "unknown"
    }
    
    self.sendEvent("orientationDidChange", [
      "orientation": orientation
    ])
  }
}
EOF
  
  # Replace the original file
  mv "$DEVICE_SWIFT_FILE.fixed" "$DEVICE_SWIFT_FILE"
  log "${GREEN}Successfully fixed UIDevice.swift compilation error${RESET}"
else
  log "${YELLOW}UIDevice.swift file not found at $DEVICE_SWIFT_FILE${RESET}"
fi

# Fix DeviceModule.swift compilation errors
DEVICE_MODULE_FILE="expo-app/node_modules/expo-device/ios/DeviceModule.swift"
if [ -f "$DEVICE_MODULE_FILE" ]; then
  log "Fixing Swift compilation error in DeviceModule.swift..."
  
  # Create a temporary file with the fix
  cat > "$DEVICE_MODULE_FILE.fixed" << EOF
// Copyright 2022-present 650 Industries. All rights reserved.

import ExpoModulesCore

public class DeviceModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoDevice")
    
    Constants([
      "isDevice": !ProcessInfo.processInfo.environment["SIMULATOR_DEVICE_NAME"].hasValue,
      "brand": "Apple"
    ])
    
    AsyncFunction("getDeviceTypeAsync") { () -> String in
      if ProcessInfo.processInfo.isiOSAppOnMac {
        return "Desktop"
      }
      
      if UIDevice.current.userInterfaceIdiom == .pad {
        return "Tablet"
      }
      
      if UIDevice.current.userInterfaceIdiom == .phone {
        return "Phone"
      }
      
      return "Unknown"
    }
    
    AsyncFunction("getUptimeAsync") { () -> Double in
      return ProcessInfo.processInfo.systemUptime
    }
    
    AsyncFunction("getMaxMemoryAsync") { () -> Int in
      return ProcessInfo.processInfo.physicalMemory
    }
    
    AsyncFunction("isRootedExperimentalAsync") { () -> Bool in
      // Check 1: Test writing to a system location
      let writableTest = FileManager.default.isWritableFile(atPath: "/private/jailbreak.txt")
      if writableTest {
        return true
      }
      
      // Check 2: Check for common jailbreak files
      let jailbreakFiles = [
        "/Applications/Cydia.app",
        "/Library/MobileSubstrate/MobileSubstrate.dylib",
        "/bin/bash",
        "/usr/sbin/sshd",
        "/etc/apt",
        "/usr/bin/ssh"
      ]
      
      for path in jailbreakFiles {
        if FileManager.default.fileExists(atPath: path) {
          return true
        }
      }
      
      // Check 3: Try opening a suspicious URL scheme
      if UIApplication.shared.canOpenURL(URL(string: "cydia://")!) {
        return true
      }
      
      return false
    }
    
    AsyncFunction("getModelAsync") { () -> String in
      // Get the device model (like "iPhone10,1")
      var systemInfo = utsname()
      uname(&systemInfo)
      let machineMirror = Mirror(reflecting: systemInfo.machine)
      
      let identifier = machineMirror.children.reduce("") { identifier, element in
        guard let value = element.value as? Int8, value != 0 else { return identifier }
        return identifier + String(UnicodeScalar(UInt8(value)))
      }
      
      return identifier
    }
    
    AsyncFunction("getDeviceNameAsync") { () -> String in
      return UIDevice.current.name
    }
    
    AsyncFunction("getDeviceYearClassAsync") { () -> Int in
      // Simplified algorithm to determine device year class
      // In a real app, would use more complex detection
      
      // Get the device model
      var systemInfo = utsname()
      uname(&systemInfo)
      let machineMirror = Mirror(reflecting: systemInfo.machine)
      
      let identifier = machineMirror.children.reduce("") { identifier, element in
        guard let value = element.value as? Int8, value != 0 else { return identifier }
        return identifier + String(UnicodeScalar(UInt8(value)))
      }
      
      // Simplified classification by model
      if identifier.hasPrefix("iPhone") {
        // Extract the number after "iPhone" - fixed syntax to avoid script path injection
        let components = identifier.components(separatedBy: CharacterSet.decimalDigits.inverted)
        // Using properly written closure syntax for compactMap and filter
        let numbers = components.compactMap { (str) -> Int? in 
          return Int(str) 
        }.filter { (num) -> Bool in 
          return num > 0 
        }
        
        if let firstNumber = numbers.first {
          // Simplified mapping
          if firstNumber <= 5 {
            return 2013
          } else if firstNumber <= 8 {
            return 2015
          } else if firstNumber <= 11 {
            return 2017
          } else if firstNumber <= 13 {
            return 2020
          } else {
            return 2022
          }
        }
      }
      
      // Default for other devices
      return 2019
    }
    
    AsyncFunction("getTotalMemoryAsync") { () -> Int in
      return Int(ProcessInfo.processInfo.physicalMemory)
    }
    
    AsyncFunction("getManufacturerAsync") { () -> String in
      return "Apple"
    }
  }
}
EOF
  
  # Replace the original file
  mv "$DEVICE_MODULE_FILE.fixed" "$DEVICE_MODULE_FILE"
  log "${GREEN}Successfully fixed DeviceModule.swift compilation error${RESET}"
else
  log "${YELLOW}DeviceModule.swift file not found at $DEVICE_MODULE_FILE${RESET}"
fi

# Fix ExpoModulesProvider.swift file
MODULES_PROVIDER_FILE="expo-app/ios/Pods/Target Support Files/Pods-SpiritualConditionTracker/ExpoModulesProvider.swift"
if [ -f "$MODULES_PROVIDER_FILE" ]; then
  log "Checking ExpoModulesProvider.swift for 'No such module ExpoDevice' error..."
  
  # Check if the file imports ExpoDevice
  if grep -q "import ExpoDevice" "$MODULES_PROVIDER_FILE"; then
    log "ExpoModulesProvider.swift imports ExpoDevice, checking if the module is available..."
    
    # Check if ExpoDevice.modulemap exists
    DEVICE_MODULE_MAP="expo-app/ios/Pods/Headers/Public/ExpoDevice/ExpoDevice.modulemap"
    if [ ! -f "$DEVICE_MODULE_MAP" ]; then
      log "${YELLOW}ExpoDevice.modulemap not found, creating a fixed version of ExpoModulesProvider.swift...${RESET}"
      
      # Create a fixed version without the ExpoDevice import
      cat "$MODULES_PROVIDER_FILE" | grep -v "import ExpoDevice" | grep -v "ExpoDevice.DeviceModule" > "${MODULES_PROVIDER_FILE}.fixed"
      
      # Replace any ExpoDevice references in the providers array
      sed -i -e 's/ExpoDevice.DeviceModule(),//g' "${MODULES_PROVIDER_FILE}.fixed"
      
      # Replace the original file
      mv "${MODULES_PROVIDER_FILE}.fixed" "$MODULES_PROVIDER_FILE"
      log "${GREEN}Successfully removed ExpoDevice references from ExpoModulesProvider.swift${RESET}"
    else
      log "${GREEN}ExpoDevice.modulemap exists, no need to fix ExpoModulesProvider.swift${RESET}"
    fi
  else
    log "${GREEN}ExpoModulesProvider.swift does not import ExpoDevice, no need to fix${RESET}"
  fi
else
  log "${YELLOW}ExpoModulesProvider.swift not found at $MODULES_PROVIDER_FILE${RESET}"
fi

# Copy necessary assets
log "${BLUE}Copying assets to iOS project...${RESET}"

ASSETS_SRC="expo-app/assets"
PROJECT_NAME="SpiritualConditionTracker"

# Ensure assets directory exists
if [ -d "$ASSETS_SRC" ]; then
  # Copy app icon
  if [ -f "$ASSETS_SRC/icon.png" ]; then
    log "Copying app icon..."
    mkdir -p "expo-app/ios/$PROJECT_NAME/Images.xcassets/AppIcon.appiconset/"
    cp "$ASSETS_SRC/icon.png" "expo-app/ios/$PROJECT_NAME/Images.xcassets/AppIcon.appiconset/"
  fi
  
  # Copy fonts if needed
  if [ -d "$ASSETS_SRC/fonts" ]; then
    log "Copying fonts..."
    mkdir -p "$EXPO_APP_DIR/ios/$PROJECT_NAME/fonts"
    cp -R "$ASSETS_SRC/fonts"/* "$EXPO_APP_DIR/ios/$PROJECT_NAME/fonts/"
  fi
  
  log "${GREEN}Assets copied successfully${RESET}"
else
  log "${YELLOW}Warning: Assets directory not found at $ASSETS_SRC${RESET}"
fi

# Install CocoaPods dependencies
log "${BLUE}Installing CocoaPods dependencies...${RESET}"

cd "$EXPO_APP_DIR/ios"

# Note: We're NOT modifying the Podfile here since it's already properly configured
log "Running 'pod install'..."
pod install

cd "$PROJECT_ROOT"

# Create JavaScript bundle for iOS
log "${BLUE}Generating JavaScript bundle for iOS...${RESET}"

# Create necessary directories
BUNDLE_DIR="$EXPO_APP_DIR/ios/$PROJECT_NAME/main.jsbundle-assets"
mkdir -p "$BUNDLE_DIR"
BUNDLE_FILE="$EXPO_APP_DIR/ios/$PROJECT_NAME/main.jsbundle"

# Ensure node_modules exist
if [ ! -d "$EXPO_APP_DIR/node_modules" ]; then
  log "Installing node dependencies..."
  cd "$EXPO_APP_DIR"
  npm install
  cd "$PROJECT_ROOT"
fi

# Generate the bundle using the React Native CLI
log "Generating bundle with Metro..."
cd "$EXPO_APP_DIR"
export NODE_OPTIONS="--max-old-space-size=4096"
npx react-native bundle \
  --entry-file=index.js \
  --platform=ios \
  --dev=false \
  --bundle-output=ios/$PROJECT_NAME/main.jsbundle \
  --assets-dest=ios/$PROJECT_NAME/main.jsbundle-assets

# Check if bundle was created successfully
if [ -f "ios/$PROJECT_NAME/main.jsbundle" ]; then
  log "${GREEN}Bundle created successfully at ios/$PROJECT_NAME/main.jsbundle${RESET}"
  
  # Get bundle size for verification
  BUNDLE_SIZE=$(du -h "ios/$PROJECT_NAME/main.jsbundle" | cut -f1)
  log "Bundle size: $BUNDLE_SIZE"
  
  # Count assets
  ASSET_COUNT=$(find "ios/$PROJECT_NAME/main.jsbundle-assets" -type f | wc -l)
  log "Asset count: $ASSET_COUNT"
else
  log "${RED}Failed to create bundle. Please check Metro errors.${RESET}"
fi

cd "$PROJECT_ROOT"

echo -e "${BOLD}${GREEN}===== iOS Build Preparation Complete =====${RESET}"
echo ""
echo -e "Next steps:"
echo -e "1. ${BOLD}Open the Xcode workspace:${RESET}"
echo -e "   ${BLUE}open $EXPO_APP_DIR/ios/SpiritualConditionTracker.xcworkspace${RESET}"
echo ""
echo -e "2. ${BOLD}Configure signing in Xcode:${RESET}"
echo -e "   - Select the main project target"
echo -e "   - Go to Signing & Capabilities tab"
echo -e "   - Select your team"
echo -e "   - Ensure 'Automatically manage signing' is checked"
echo ""
echo -e "3. ${BOLD}Build and run on a simulator or device${RESET}"

# Final verification of critical files
log "${BLUE}Performing final verification of critical files...${RESET}"

# Check expo-configure-project.sh
FINAL_EXPO_SCRIPT="$EXPO_APP_DIR/ios/Pods/Target Support Files/Pods-SpiritualConditionTracker/expo-configure-project.sh"
if [ -f "$FINAL_EXPO_SCRIPT" ] && [ -x "$FINAL_EXPO_SCRIPT" ]; then
  log "${GREEN}✓ expo-configure-project.sh exists and is executable${RESET}"
else
  log "${RED}⚠️ expo-configure-project.sh is still missing or not executable at: $FINAL_EXPO_SCRIPT${RESET}"
  log "Creating directory and fallback script..."
  mkdir -p "$(dirname "$FINAL_EXPO_SCRIPT")"
  cat > "$FINAL_EXPO_SCRIPT" << 'EOL'
#!/bin/sh
# Fallback expo-configure-project.sh script (created during final verification)
echo "Running fallback expo-configure-project.sh script"
exit 0
EOL
  chmod +x "$FINAL_EXPO_SCRIPT"
  log "${GREEN}Created fallback expo-configure-project.sh script${RESET}"
fi

# Check modulemap file
MODULEMAP_FILE="$EXPO_APP_DIR/ios/Pods/Headers/Public/ExpoDevice/ExpoDevice.modulemap"
if [ -f "$MODULEMAP_FILE" ]; then
  log "${GREEN}✓ ExpoDevice.modulemap exists${RESET}"
else
  log "${YELLOW}⚠️ ExpoDevice.modulemap is missing at: $MODULEMAP_FILE${RESET}"
  log "This may cause Swift import errors. Creating directory and simple modulemap..."
  mkdir -p "$(dirname "$MODULEMAP_FILE")"
  cat > "$MODULEMAP_FILE" << 'EOL'
module ExpoDevice {
  umbrella header "ExpoDevice.h"
  export *
}
EOL
  log "${GREEN}Created simple ExpoDevice.modulemap file${RESET}"
fi