import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import proximityDiscovery from '../utils/proximityDiscovery';
import * as Location from 'expo-location';

/**
 * Component for managing discovery settings (GPS, Bluetooth, WiFi)
 */
const DiscoverySettings = ({ onSettingsChange }) => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [useGps, setUseGps] = useState(true);
  const [useBluetooth, setUseBluetooth] = useState(false);
  const [useWifi, setUseWifi] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(false);
  const [wifiConnected, setWifiConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Initialize device capabilities on mount
  useEffect(() => {
    checkDeviceCapabilities();
    
    return () => {
      // Clean up Bluetooth resources on unmount
      proximityDiscovery.cleanupBluetooth();
    };
  }, []);
  
  // Update settings when they change
  useEffect(() => {
    if (onSettingsChange) {
      onSettingsChange({ useGps, useBluetooth, useWifi });
    }
  }, [useGps, useBluetooth, useWifi, onSettingsChange]);
  
  // Check device capabilities (permissions and services)
  const checkDeviceCapabilities = async () => {
    setLoading(true);
    
    try {
      // Check location permission
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
      
      // Check Bluetooth state
      const btEnabled = await proximityDiscovery.isBluetoothEnabled();
      setBluetoothEnabled(btEnabled);
      
      // Check WiFi connection
      const wifiConn = await proximityDiscovery.isWifiConnected();
      setWifiConnected(wifiConn);
    } catch (error) {
      console.error('Error checking device capabilities:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Load settings from storage
  const loadSettings = async () => {
    try {
      // In a real app, load from AsyncStorage or database
      // Default settings for now
      setUseGps(true);
      setUseBluetooth(false);
      setUseWifi(false);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };
  
  // Save settings to storage
  const saveSettings = async (settings) => {
    try {
      // In a real app, save to AsyncStorage or database
      console.log('Saved settings:', settings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };
  
  // Toggle GPS discovery
  const toggleGps = async (value) => {
    if (value && !locationPermission) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is required to discover nearby members using GPS.',
          [{ text: 'OK' }]
        );
        return;
      }
      setLocationPermission(true);
    }
    
    setUseGps(value);
    const settings = { useGps: value, useBluetooth, useWifi };
    await saveSettings(settings);
  };
  
  // Toggle Bluetooth discovery
  const toggleBluetooth = async (value) => {
    if (!value) {
      setUseBluetooth(false);
      const settings = { useGps, useBluetooth: false, useWifi };
      await saveSettings(settings);
      return;
    }
    
    await initializeBluetooth();
  };
  
  // Toggle WiFi discovery
  const toggleWifi = async (value) => {
    if (value && !wifiConnected) {
      Alert.alert(
        'WiFi Required',
        'Please connect to a WiFi network to discover nearby members using this method.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setUseWifi(value);
    const settings = { useGps, useBluetooth, useWifi: value };
    await saveSettings(settings);
  };
  
  // Initialize Bluetooth discovery
  const initializeBluetooth = async () => {
    setLoading(true);
    try {
      const hasPermission = await proximityDiscovery.requestBluetoothPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Bluetooth permission is required to discover nearby members.',
          [{ text: 'OK' }]
        );
        setUseBluetooth(false);
        const settings = { useGps, useBluetooth: false, useWifi };
        await saveSettings(settings);
        return;
      }
      
      const isEnabled = await proximityDiscovery.isBluetoothEnabled();
      if (!isEnabled) {
        const enabled = await proximityDiscovery.enableBluetooth();
        if (!enabled) {
          if (Platform.OS === 'android') {
            Alert.alert(
              'Bluetooth Required',
              'Please enable Bluetooth to discover nearby members.',
              [{ text: 'OK' }]
            );
            setUseBluetooth(false);
            const settings = { useGps, useBluetooth: false, useWifi };
            await saveSettings(settings);
            return;
          }
        }
      }
      
      setBluetoothEnabled(true);
      setUseBluetooth(true);
      const settings = { useGps, useBluetooth: true, useWifi };
      await saveSettings(settings);
    } catch (error) {
      console.error('Error initializing Bluetooth:', error);
      Alert.alert('Error', 'Failed to initialize Bluetooth discovery.');
      setUseBluetooth(false);
    } finally {
      setLoading(false);
    }
  };
  
  // Refresh connection status
  const refreshConnectionStatus = async () => {
    await checkDeviceCapabilities();
  };
  
  // Theme-specific styles
  const themedStyles = {
    container: {
      backgroundColor: theme.cardBackground,
      borderColor: theme.border,
    },
    header: {
      backgroundColor: theme.cardBackground,
    },
    headerText: {
      color: theme.text,
    },
    headerIcon: {
      color: theme.textSecondary,
    },
    divider: {
      backgroundColor: theme.border,
    },
    settingLabelContainer: {
      backgroundColor: theme.cardBackground,
    },
    settingLabel: {
      color: theme.text,
    },
    settingDescription: {
      color: theme.textSecondary,
    },
    statusIcon: {
      color: theme.textSecondary,
    },
    refreshButton: {
      backgroundColor: theme.primary,
    },
    refreshButtonText: {
      color: '#FFFFFF',
    },
    statusText: {
      color: theme.textSecondary,
    },
    statusContainer: {
      backgroundColor: theme.backgroundSecondary,
      borderColor: theme.border,
    }
  };
  
  return (
    <View style={[styles.container, themedStyles.container]}>
      <TouchableOpacity 
        style={[styles.header, themedStyles.header]}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.headerContent}>
          <Ionicons 
            name="signal" 
            size={20} 
            style={[styles.headerIcon, themedStyles.headerIcon]} 
          />
          <Text style={[styles.headerText, themedStyles.headerText]}>
            Discovery Settings
          </Text>
        </View>
        <Ionicons 
          name={isExpanded ? "chevron-up" : "chevron-down"} 
          size={20} 
          style={[styles.headerIcon, themedStyles.headerIcon]} 
        />
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.content}>
          <View style={[styles.divider, themedStyles.divider]} />
          
          {/* GPS Setting */}
          <View style={[styles.settingRow, themedStyles.settingLabelContainer]}>
            <View style={styles.settingLabelContainer}>
              <Text style={[styles.settingLabel, themedStyles.settingLabel]}>
                GPS Discovery
              </Text>
              <Text style={[styles.settingDescription, themedStyles.settingDescription]}>
                Find members within a few miles
              </Text>
            </View>
            <Switch
              value={useGps}
              onValueChange={toggleGps}
              trackColor={{ false: "#767577", true: theme.primaryDark }}
              thumbColor={useGps ? theme.primary : "#f4f3f4"}
              disabled={loading}
            />
          </View>
          
          {/* Bluetooth Setting */}
          <View style={[styles.settingRow, themedStyles.settingLabelContainer]}>
            <View style={styles.settingLabelContainer}>
              <Text style={[styles.settingLabel, themedStyles.settingLabel]}>
                Bluetooth Discovery
              </Text>
              <Text style={[styles.settingDescription, themedStyles.settingDescription]}>
                Find members within 30 feet
              </Text>
            </View>
            <Switch
              value={useBluetooth}
              onValueChange={toggleBluetooth}
              trackColor={{ false: "#767577", true: theme.primaryDark }}
              thumbColor={useBluetooth ? theme.primary : "#f4f3f4"}
              disabled={loading}
            />
          </View>
          
          {/* WiFi Setting */}
          <View style={[styles.settingRow, themedStyles.settingLabelContainer]}>
            <View style={styles.settingLabelContainer}>
              <Text style={[styles.settingLabel, themedStyles.settingLabel]}>
                WiFi Discovery
              </Text>
              <Text style={[styles.settingDescription, themedStyles.settingDescription]}>
                Find members on the same network
              </Text>
            </View>
            <Switch
              value={useWifi}
              onValueChange={toggleWifi}
              trackColor={{ false: "#767577", true: theme.primaryDark }}
              thumbColor={useWifi ? theme.primary : "#f4f3f4"}
              disabled={loading || !wifiConnected}
            />
          </View>
          
          <View style={[styles.divider, themedStyles.divider]} />
          
          {/* Status and refresh button */}
          <View style={styles.statusSection}>
            <View style={[styles.statusContainer, themedStyles.statusContainer]}>
              <View style={styles.statusRow}>
                <Ionicons 
                  name="location" 
                  size={16} 
                  style={[
                    styles.statusIcon, 
                    themedStyles.statusIcon,
                    locationPermission && { color: '#4CAF50' }
                  ]} 
                />
                <Text style={[styles.statusText, themedStyles.statusText]}>
                  Location: {locationPermission ? 'Permitted' : 'Not Permitted'}
                </Text>
              </View>
              
              <View style={styles.statusRow}>
                <Ionicons 
                  name="bluetooth" 
                  size={16} 
                  style={[
                    styles.statusIcon, 
                    themedStyles.statusIcon,
                    bluetoothEnabled && { color: '#4CAF50' }
                  ]} 
                />
                <Text style={[styles.statusText, themedStyles.statusText]}>
                  Bluetooth: {bluetoothEnabled ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
              
              <View style={styles.statusRow}>
                <Ionicons 
                  name="wifi" 
                  size={16} 
                  style={[
                    styles.statusIcon, 
                    themedStyles.statusIcon,
                    wifiConnected && { color: '#4CAF50' }
                  ]} 
                />
                <Text style={[styles.statusText, themedStyles.statusText]}>
                  WiFi: {wifiConnected ? 'Connected' : 'Not Connected'}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.refreshButton, themedStyles.refreshButton]}
              onPress={refreshConnectionStatus}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.refreshButtonText}>Refresh Status</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 15,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 8,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 15,
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabelContainer: {
    flex: 1,
    marginRight: 10,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
  },
  statusSection: {
    marginTop: 10,
  },
  statusContainer: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginBottom: 15,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIcon: {
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
  },
  refreshButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default DiscoverySettings;