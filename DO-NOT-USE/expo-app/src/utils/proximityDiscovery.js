import { PermissionsAndroid, Platform } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import * as Location from 'expo-location';
import { Buffer } from 'buffer';

// Discovery types
export const DISCOVERY_TYPES = {
  BLUETOOTH: 'bluetooth',
  WIFI: 'wifi',
  GPS: 'gps'
};

// BLE instance for handling BLE operations
let bleManager = null;

// Initialize BLE manager if not already done
const getBleManager = () => {
  if (!bleManager) {
    bleManager = new BleManager();
  }
  return bleManager;
};

/**
 * Request Bluetooth permissions based on the platform
 * @returns {Promise<boolean>} Whether permissions were granted
 */
export const requestBluetoothPermissions = async () => {
  if (Platform.OS === 'android') {
    const apiLevel = Platform.Version;
    
    // For Android 12+ (API 31+), we need additional permissions
    if (apiLevel >= 31) {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ];
      
      try {
        const granted = await PermissionsAndroid.requestMultiple(permissions);
        
        return (
          granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === 'granted' &&
          granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === 'granted' &&
          granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE] === 'granted' &&
          granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === 'granted'
        );
      } catch (error) {
        console.error('Error requesting Android Bluetooth permissions:', error);
        return false;
      }
    } else {
      // For older Android versions
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission Required',
            message: 'This app needs access to your location to discover Bluetooth devices.',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (error) {
        console.error('Error requesting Android location permission:', error);
        return false;
      }
    }
  } else {
    // iOS permissions are handled implicitly when using BLE
    return true;
  }
};

/**
 * Check if Bluetooth is enabled
 * @returns {Promise<boolean>} Whether Bluetooth is enabled
 */
export const isBluetoothEnabled = async () => {
  try {
    if (Platform.OS === 'android') {
      const enabled = await RNBluetoothClassic.isBluetoothEnabled();
      return enabled;
    } else {
      // iOS doesn't provide a direct way to check, so we attempt a BLE operation
      const manager = getBleManager();
      const state = await manager.state();
      return state === 'PoweredOn';
    }
  } catch (error) {
    console.error('Error checking Bluetooth state:', error);
    return false;
  }
};

/**
 * Enable Bluetooth (Android only)
 * @returns {Promise<boolean>} Whether Bluetooth was enabled
 */
export const enableBluetooth = async () => {
  try {
    if (Platform.OS === 'android') {
      const result = await RNBluetoothClassic.requestBluetoothEnabled();
      return result;
    } else {
      // iOS doesn't allow enabling Bluetooth programmatically
      return false;
    }
  } catch (error) {
    console.error('Error enabling Bluetooth:', error);
    return false;
  }
};

/**
 * Start Bluetooth discovery for nearby devices
 * @returns {Promise<void>}
 */
export const startBluetoothDiscovery = async () => {
  try {
    if (Platform.OS === 'android') {
      // For classic Bluetooth on Android
      await RNBluetoothClassic.startDiscovery();
    }
    // BLE discovery is done in getDiscoveredDevices
  } catch (error) {
    console.error('Error starting Bluetooth discovery:', error);
  }
};

/**
 * Get discovered Bluetooth devices
 * @returns {Promise<Array>} List of discovered devices
 */
export const getDiscoveredDevices = async () => {
  try {
    const devices = [];
    
    // Get classic Bluetooth devices (Android only)
    if (Platform.OS === 'android') {
      const classicDevices = await RNBluetoothClassic.getDiscoveredDevices();
      devices.push(...classicDevices.map(device => ({
        id: device.address,
        name: device.name || 'Unknown Device',
        rssi: device.rssi || -70,
        type: 'classic'
      })));
    }
    
    // Get BLE devices (iOS and Android)
    const manager = getBleManager();
    return new Promise((resolve) => {
      const bleDevices = [];
      manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.error('BLE Scan error:', error);
          manager.stopDeviceScan();
          resolve([...devices, ...bleDevices]);
          return;
        }
        
        if (device && !bleDevices.some(d => d.id === device.id)) {
          bleDevices.push({
            id: device.id,
            name: device.name || 'Unknown BLE Device',
            rssi: device.rssi || -70,
            type: 'ble'
          });
        }
        
        // Stop scanning after 5 seconds
        setTimeout(() => {
          manager.stopDeviceScan();
          resolve([...devices, ...bleDevices]);
        }, 5000);
      });
    });
  } catch (error) {
    console.error('Error getting discovered devices:', error);
    return [];
  }
};

/**
 * Check if the device is connected to WiFi
 * @returns {Promise<boolean>} Whether the device is connected to WiFi
 */
export const isWifiConnected = async () => {
  try {
    // This is a simplified check - for a real app, use NetInfo
    return true;
  } catch (error) {
    console.error('Error checking WiFi connection:', error);
    return false;
  }
};

/**
 * Discover nearby users using selected methods
 * @param {Object} options - Discovery options
 * @returns {Promise<Array>} List of nearby users
 */
export const discoverNearbyUsers = async (options = {}) => {
  try {
    const { useGps = true, useBluetooth = false, useWifi = false } = options;
    const nearbyUsers = [];
    const existingIds = new Set();
    
    // GPS-based discovery
    if (useGps) {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced
          });
          
          // In a real app, this would make an API call to a server
          // to find users near the current location
          
          // For demonstration, simulate finding users
          const simulatedGpsUsers = [
            {
              id: 'gps1',
              username: 'Sarah M.',
              distance: 0.7,
              sobrietyYears: 2.4,
              isReachable: true,
              lastActive: '2 hours ago',
              discoveryType: DISCOVERY_TYPES.GPS
            },
            {
              id: 'gps2',
              username: 'Robert J.',
              distance: 1.1,
              sobrietyYears: 8.7,
              isReachable: true,
              lastActive: 'Yesterday',
              discoveryType: DISCOVERY_TYPES.GPS
            }
          ];
          
          simulatedGpsUsers.forEach(user => {
            if (!existingIds.has(user.id)) {
              nearbyUsers.push(user);
              existingIds.add(user.id);
            }
          });
        }
      } catch (err) {
        console.error('Error discovering GPS users:', err);
      }
    }
    
    // Bluetooth-based discovery
    if (useBluetooth) {
      try {
        const hasPermission = await requestBluetoothPermissions();
        if (hasPermission) {
          const isEnabled = await isBluetoothEnabled();
          if (isEnabled) {
            await startBluetoothDiscovery();
            const devices = await getDiscoveredDevices();
            
            // In a real app, these devices would contain data about AA users
            // For demonstration, simulate AA users from discovered devices
            
            if (devices.length > 0) {
              // Simulate finding a user for the first discovered device
              const simulatedBtUser = {
                id: 'bt1',
                username: 'John S.',
                distance: 0.3,
                sobrietyYears: 5.2,
                isReachable: true,
                lastActive: '10 minutes ago',
                discoveryType: DISCOVERY_TYPES.BLUETOOTH,
                deviceId: devices[0].id
              };
              
              if (!existingIds.has(simulatedBtUser.id)) {
                nearbyUsers.push(simulatedBtUser);
                existingIds.add(simulatedBtUser.id);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error discovering Bluetooth users:', err);
      }
    }
    
    // WiFi-based discovery
    if (useWifi) {
      try {
        const connected = await isWifiConnected();
        if (connected) {
          // In a real app, this would scan the local network
          // or use a service like mDNS to find other app users
          
          // For demonstration, simulate finding users
          const simulatedWifiUser = {
            id: 'wifi1',
            username: 'Emily K.',
            distance: 0.1,
            sobrietyYears: 1.1,
            isReachable: true,
            lastActive: '5 minutes ago',
            discoveryType: DISCOVERY_TYPES.WIFI
          };
          
          if (!existingIds.has(simulatedWifiUser.id)) {
            nearbyUsers.push(simulatedWifiUser);
            existingIds.add(simulatedWifiUser.id);
          }
        }
      } catch (err) {
        console.error('Error discovering WiFi users:', err);
      }
    }
    
    return nearbyUsers;
  } catch (error) {
    console.error('Error in discoverNearbyUsers:', error);
    return [];
  }
};

/**
 * Get a human-readable string for the connection type
 * @param {string} discoveryType - Type of discovery (from DISCOVERY_TYPES)
 * @returns {string} Human-readable connection type
 */
export const getConnectionTypeString = (discoveryType) => {
  switch (discoveryType) {
    case DISCOVERY_TYPES.BLUETOOTH:
      return 'Bluetooth (nearby)';
    case DISCOVERY_TYPES.WIFI:
      return 'Wi-Fi (local network)';
    case DISCOVERY_TYPES.GPS:
      return 'GPS location';
    default:
      return 'Unknown';
  }
};

// Clean up Bluetooth resources when no longer needed
export const cleanupBluetooth = () => {
  if (bleManager) {
    bleManager.destroy();
    bleManager = null;
  }
};

// Export a comprehensive discovery handler
export default {
  discoverNearbyUsers,
  requestBluetoothPermissions,
  isBluetoothEnabled,
  enableBluetooth,
  startBluetoothDiscovery,
  getDiscoveredDevices,
  isWifiConnected,
  getConnectionTypeString,
  cleanupBluetooth,
  DISCOVERY_TYPES
};