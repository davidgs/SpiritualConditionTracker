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
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { useUser } from '../contexts/UserContext';
import proximityDiscovery, { DISCOVERY_TYPES } from '../utils/proximityDiscovery';
import { settingsOperations } from '../utils/database';

// Settings keys
const DISCOVERY_SETTINGS_KEY = 'discovery_settings';

const DiscoverySettings = ({ onUpdateDiscoveryOptions }) => {
  const { user, updateDiscoverability } = useUser();
  const [loading, setLoading] = useState(false);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(false);
  const [wifiConnected, setWifiConnected] = useState(false);
  const [useGps, setUseGps] = useState(true);
  const [useBluetooth, setUseBluetooth] = useState(false);
  const [useWifi, setUseWifi] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Check device capabilities
        checkDeviceCapabilities();
        
        // Load saved settings
        const settings = await settingsOperations.getSetting(DISCOVERY_SETTINGS_KEY, {
          useGps: true,
          useBluetooth: false,
          useWifi: false
        });
        
        setUseGps(settings.useGps);
        setUseBluetooth(settings.useBluetooth);
        setUseWifi(settings.useWifi);
        
        // Notify parent component about initial settings
        if (onUpdateDiscoveryOptions) {
          onUpdateDiscoveryOptions({
            useGps: settings.useGps,
            useBluetooth: settings.useBluetooth,
            useWifi: settings.useWifi
          });
        }
      } catch (error) {
        console.error('[ DiscoverySettings.js ] Error loading discovery settings:', error);
      }
    };
    
    loadSettings();
    
    // Listen to network state changes
    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
      setWifiConnected(state.type === 'wifi' && state.isConnected);
    });
    
    return () => {
      unsubscribeNetInfo();
    };
  }, []);
  
  // Check device capabilities (Bluetooth, WiFi)
  const checkDeviceCapabilities = async () => {
    setLoading(true);
    try {
      // Check Bluetooth
      const btEnabled = await proximityDiscovery.isBluetoothEnabled();
      setBluetoothEnabled(btEnabled);
      
      // Check WiFi
      const wifiConnected = await proximityDiscovery.isWifiConnected();
      setWifiConnected(wifiConnected);
    } catch (error) {
      console.error('[ DiscoverySettings.js ] Error checking device capabilities:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Save discovery settings
  const saveSettings = async (settings) => {
    try {
      await settingsOperations.saveSetting(DISCOVERY_SETTINGS_KEY, settings);
      
      // Notify parent component
      if (onUpdateDiscoveryOptions) {
        onUpdateDiscoveryOptions(settings);
      }
    } catch (error) {
      console.error('[ DiscoverySettings.js ] Error saving discovery settings:', error);
    }
  };
  
  // Toggle GPS discovery
  const toggleGps = async (value) => {
    setUseGps(value);
    const settings = { useGps: value, useBluetooth, useWifi };
    await saveSettings(settings);
  };
  
  // Toggle Bluetooth discovery
  const toggleBluetooth = async (value) => {
    if (value && !bluetoothEnabled) {
      if (Platform.OS === 'android') {
        // Try to enable Bluetooth on Android
        const enabled = await proximityDiscovery.enableBluetooth();
        if (!enabled) {
          Alert.alert(
            'Bluetooth Required',
            'Please enable Bluetooth to discover nearby members using this method.',
            [{ text: 'OK' }]
          );
          return;
        }
        setBluetoothEnabled(true);
      } else {
        // On iOS, just show an alert
        Alert.alert(
          'Bluetooth Required',
          'Please enable Bluetooth in your device settings to discover nearby members using this method.',
          [{ text: 'OK' }]
        );
      }
    }
    
    setUseBluetooth(value);
    const settings = { useGps, useBluetooth: value, useWifi };
    await saveSettings(settings);
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
    } catch (error) {
      console.error('[ DiscoverySettings.js ] Error initializing Bluetooth:', error);
      Alert.alert('Error', 'Failed to initialize Bluetooth discovery.');
    } finally {
      setLoading(false);
    }
  };
  
  // Refresh connection status
  const refreshConnectionStatus = async () => {
    await checkDeviceCapabilities();
  };
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.headerContent}>
          <Ionicons 
            name="signal" 
            size={20} 
            color="#3498db" 
          />
          <Text style={styles.headerText}>Discovery Options</Text>
        </View>
        <Ionicons 
          name={isExpanded ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#777" 
        />
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.content}>
          <Text style={styles.description}>
            Choose how you want to discover nearby AA members. Multiple methods provide the best chance of finding others.
          </Text>
          
          {/* GPS Option */}
          <View style={styles.optionRow}>
            <View style={styles.optionInfo}>
              <Ionicons name="location" size={20} color="#3498db" style={styles.optionIcon} />
              <View>
                <Text style={styles.optionTitle}>GPS Location</Text>
                <Text style={styles.optionDescription}>Discover members within a set radius (up to several km)</Text>
              </View>
            </View>
            <Switch
              value={useGps}
              onValueChange={toggleGps}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={useGps ? '#3498db' : '#f4f3f4'}
            />
          </View>
          
          {/* Bluetooth Option */}
          <View style={styles.optionRow}>
            <View style={styles.optionInfo}>
              <Ionicons name="bluetooth" size={20} color={bluetoothEnabled ? "#3498db" : "#ccc"} style={styles.optionIcon} />
              <View>
                <Text style={[styles.optionTitle, !bluetoothEnabled && styles.disabledText]}>
                  Bluetooth
                </Text>
                <Text style={[styles.optionDescription, !bluetoothEnabled && styles.disabledText]}>
                  Find members in immediate proximity (10-50m)
                </Text>
              </View>
            </View>
            <Switch
              value={useBluetooth}
              onValueChange={toggleBluetooth}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={useBluetooth ? '#3498db' : '#f4f3f4'}
              disabled={!bluetoothEnabled && Platform.OS === 'ios'}
            />
          </View>
          
          {/* WiFi Option */}
          <View style={styles.optionRow}>
            <View style={styles.optionInfo}>
              <Ionicons name="wifi" size={20} color={wifiConnected ? "#3498db" : "#ccc"} style={styles.optionIcon} />
              <View>
                <Text style={[styles.optionTitle, !wifiConnected && styles.disabledText]}>
                  WiFi Network
                </Text>
                <Text style={[styles.optionDescription, !wifiConnected && styles.disabledText]}>
                  Find members on the same network (cafes, meetings)
                </Text>
              </View>
            </View>
            <Switch
              value={useWifi}
              onValueChange={toggleWifi}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={useWifi ? '#3498db' : '#f4f3f4'}
              disabled={!wifiConnected}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={refreshConnectionStatus}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <View style={styles.refreshButtonContent}>
                <Ionicons name="refresh" size={16} color="#fff" style={styles.refreshIcon} />
                <Text style={styles.refreshText}>Refresh Status</Text>
              </View>
            )}
          </TouchableOpacity>
          
          {!bluetoothEnabled && (
            <TouchableOpacity 
              style={styles.enableBluetoothButton}
              onPress={initializeBluetooth}
              disabled={loading || (Platform.OS === 'ios' && useBluetooth)}
            >
              <View style={styles.refreshButtonContent}>
                <Ionicons name="bluetooth" size={16} color="#fff" style={styles.refreshIcon} />
                <Text style={styles.refreshText}>
                  {Platform.OS === 'android' ? 'Enable Bluetooth' : 'Initialize Bluetooth'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  content: {
    padding: 16,
  },
  description: {
    fontSize: 14,
    color: '#777',
    marginBottom: 16,
    lineHeight: 20,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  optionIcon: {
    marginRight: 12,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 12,
    color: '#777',
    lineHeight: 16,
  },
  disabledText: {
    color: '#ccc',
  },
  refreshButton: {
    backgroundColor: '#3498db',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: 'flex-end',
    marginTop: 16,
  },
  refreshButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshIcon: {
    marginRight: 4,
  },
  refreshText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  enableBluetoothButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
});

export default DiscoverySettings;