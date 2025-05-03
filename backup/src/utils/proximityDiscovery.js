import { Platform } from 'react-native';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import NetInfo from '@react-native-community/netinfo';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { userOperations } from './database';

// Constants for discovery types
export const DISCOVERY_TYPES = {
  BLUETOOTH: 'bluetooth',
  WIFI: 'wifi',
  GPS: 'gps',
};

// Request Bluetooth permissions
export const requestBluetoothPermissions = async () => {
  try {
    let permissionStatus;
    if (Platform.OS === 'android') {
      // Android requires different permissions based on API level
      if (Platform.Version >= 31) { // Android 12+
        permissionStatus = await request(PERMISSIONS.ANDROID.BLUETOOTH_SCAN);
        if (permissionStatus === RESULTS.GRANTED) {
          permissionStatus = await request(PERMISSIONS.ANDROID.BLUETOOTH_CONNECT);
        }
      } else {
        permissionStatus = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      }
    } else if (Platform.OS === 'ios') {
      permissionStatus = await request(PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL);
    }
    
    return permissionStatus === RESULTS.GRANTED;
  } catch (error) {
    console.error('Error requesting Bluetooth permissions:', error);
    return false;
  }
};

// Check if Bluetooth is enabled
export const isBluetoothEnabled = async () => {
  try {
    return await RNBluetoothClassic.isBluetoothEnabled();
  } catch (error) {
    console.error('Error checking Bluetooth status:', error);
    return false;
  }
};

// Enable Bluetooth (Android only)
export const enableBluetooth = async () => {
  try {
    if (Platform.OS === 'android') {
      return await RNBluetoothClassic.requestBluetoothEnabled();
    }
    // iOS requires manual user action
    return false;
  } catch (error) {
    console.error('Error enabling Bluetooth:', error);
    return false;
  }
};

// Start Bluetooth discovery
export const startBluetoothDiscovery = async (timeoutMs = 10000) => {
  try {
    if (!(await isBluetoothEnabled())) {
      const enabled = await enableBluetooth();
      if (!enabled) {
        throw new Error('Bluetooth is not enabled');
      }
    }
    
    // Set device name to include user ID for identification
    await RNBluetoothClassic.setDeviceName(`AARecovery-${Date.now()}`);
    
    // Start discovery
    const discovering = await RNBluetoothClassic.startDiscovery();
    
    // Set timeout to stop discovery
    setTimeout(async () => {
      try {
        await RNBluetoothClassic.cancelDiscovery();
      } catch (err) {
        console.error('Error canceling discovery:', err);
      }
    }, timeoutMs);
    
    return discovering;
  } catch (error) {
    console.error('Error starting Bluetooth discovery:', error);
    return false;
  }
};

// Get discovered devices
export const getDiscoveredDevices = async () => {
  try {
    const bondedDevices = await RNBluetoothClassic.getBondedDevices();
    const availableDevices = await RNBluetoothClassic.getDiscoveredDevices();
    
    // Filter for AA Recovery app devices
    const aaDevices = [...bondedDevices, ...availableDevices]
      .filter(device => device.name && device.name.startsWith('AARecovery-'));
    
    return aaDevices;
  } catch (error) {
    console.error('Error getting discovered devices:', error);
    return [];
  }
};

// Check if WiFi is connected
export const isWifiConnected = async () => {
  try {
    const netInfo = await NetInfo.fetch();
    return netInfo.type === 'wifi' && netInfo.isConnected;
  } catch (error) {
    console.error('Error checking WiFi status:', error);
    return false;
  }
};

// Convert discovered devices to user objects
export const processDiscoveredDevices = async (devices, currentUserId) => {
  try {
    // Get all users who have enabled discovery
    const allUsers = await userOperations.getUsersByDiscoverability(true);
    
    // Extract device IDs from names
    const deviceTimestamps = devices.map(device => {
      const match = device.name.match(/AARecovery-(\d+)/);
      return match ? match[1] : null;
    }).filter(Boolean);
    
    // For demo purposes, we'll simulate matches with nearby users
    // In a real app, you would need a backend service to match device IDs with users
    const nearbyUsers = allUsers.filter(user => 
      user.id !== currentUserId && // Filter out current user
      Math.random() > 0.5 // Simulate some matching (would be real matching in production)
    );
    
    return nearbyUsers.map(user => ({
      ...user,
      discoveryType: DISCOVERY_TYPES.BLUETOOTH,
      distance: 'Very close', // Bluetooth indicates close proximity
      lastSeen: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error processing discovered devices:', error);
    return [];
  }
};

// Main discovery function that combines methods
export const discoverNearbyUsers = async (userId, options = {}) => {
  try {
    const { useGps = true, useBluetooth = true, timeoutMs = 10000 } = options;
    let nearbyUsers = [];
    
    // Start with GPS if enabled
    if (useGps) {
      try {
        const gpsUsers = await userOperations.getNearbyUsers(
          options.latitude,
          options.longitude,
          options.radius || 5
        );
        
        // Filter out current user and add discovery type
        nearbyUsers = gpsUsers
          .filter(user => user.id !== userId)
          .map(user => ({
            ...user,
            discoveryType: DISCOVERY_TYPES.GPS
          }));
      } catch (err) {
        console.error('Error discovering GPS users:', err);
      }
    }
    
    // Add Bluetooth discovery if enabled
    if (useBluetooth) {
      try {
        const hasPermission = await requestBluetoothPermissions();
        if (hasPermission) {
          await startBluetoothDiscovery(timeoutMs);
          // Wait for discovery to complete
          await new Promise(resolve => setTimeout(resolve, timeoutMs));
          
          const devices = await getDiscoveredDevices();
          const bluetoothUsers = await processDiscoveredDevices(devices, userId);
          
          // Merge with GPS users, avoiding duplicates
          const existingIds = new Set(nearbyUsers.map(user => user.id));
          bluetoothUsers.forEach(user => {
            if (!existingIds.has(user.id)) {
              nearbyUsers.push(user);
              existingIds.add(user.id);
            }
          });
        }
      } catch (err) {
        console.error('Error discovering Bluetooth users:', err);
      }
    }
    
    return nearbyUsers;
  } catch (error) {
    console.error('Error in discoverNearbyUsers:', error);
    return [];
  }
};

// Get the connection type string
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
  DISCOVERY_TYPES
};