import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  Slider,
  Alert,
  Linking,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from 'react-native-vector-icons';
import * as Location from 'expo-location';
import { useUser } from '../contexts/UserContext';
import { userOperations, settingsOperations } from '../utils/database';
import { calculateSobrietyDays } from '../utils/calculations';

const NearbyMembersScreen = () => {
  const { user, updateUser, updateLocation, updateDiscoverability } = useUser();
  const [discoverable, setDiscoverable] = useState(false);
  const [radius, setRadius] = useState(5);
  const [nearbyMembers, setNearbyMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationPermission, setLocationPermission] = useState(null);
  
  // Initialize state
  useEffect(() => {
    if (user) {
      setDiscoverable(user.discoverable || false);
    }
    
    // Load saved radius
    const loadRadius = async () => {
      try {
        const savedRadius = await settingsOperations.getSetting('discoveryRadius', 5);
        setRadius(savedRadius);
      } catch (error) {
        console.error('Error loading radius:', error);
      }
    };
    
    loadRadius();
    checkLocationPermission();
  }, [user]);
  
  // Check location permission
  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
      
      if (status === 'granted') {
        getCurrentLocation();
      }
    } catch (error) {
      console.error('Error checking location permission:', error);
    }
  };
  
  // Get current location
  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const { latitude, longitude } = location.coords;
      
      // Update user location
      if (user && user.id) {
        updateLocation(latitude, longitude);
      }
      
      // Get nearby members if discoverable
      if (discoverable) {
        fetchNearbyMembers(latitude, longitude);
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };
  
  // Handle discoverability toggle
  const handleDiscoverabilityToggle = async (value) => {
    setDiscoverable(value);
    
    if (user && user.id) {
      if (value && !locationPermission) {
        // Need location permission to be discoverable
        Alert.alert(
          'Location Permission Required',
          'To be discoverable to other members, location permission is required.',
          [
            { text: 'Cancel', onPress: () => setDiscoverable(false), style: 'cancel' },
            { text: 'Grant Permission', onPress: checkLocationPermission },
          ]
        );
        return;
      }
      
      await updateDiscoverability(value);
      
      if (value && locationPermission) {
        getCurrentLocation();
      } else {
        setNearbyMembers([]);
      }
    }
  };
  
  // Handle radius change
  const handleRadiusChange = async (value) => {
    setRadius(value);
    await settingsOperations.saveSetting('discoveryRadius', value);
    
    // Refresh nearby members if discoverable
    if (discoverable && locationPermission && user && user.latitude && user.longitude) {
      fetchNearbyMembers(user.latitude, user.longitude);
    }
  };
  
  // Fetch nearby members
  const fetchNearbyMembers = async (latitude, longitude) => {
    if (!user || !user.id) return;
    
    setLoading(true);
    
    try {
      const members = await userOperations.getNearbyUsers(latitude, longitude, radius);
      
      // Filter out current user
      const filteredMembers = members.filter(member => member.id !== user.id);
      setNearbyMembers(filteredMembers);
    } catch (error) {
      console.error('Error fetching nearby members:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Call a member
  const callMember = (phone) => {
    if (!phone) {
      Alert.alert('Error', 'No phone number available for this member.');
      return;
    }
    
    const phoneUrl = `tel:${phone}`;
    
    Linking.canOpenURL(phoneUrl)
      .then(supported => {
        if (supported) {
          return Linking.openURL(phoneUrl);
        } else {
          Alert.alert('Error', 'Phone calls are not supported on this device.');
        }
      })
      .catch(err => {
        console.error('Error making phone call:', err);
        Alert.alert('Error', 'Could not make the phone call.');
      });
  };
  
  // Render member item
  const renderMemberItem = (member) => {
    const sobrietyDays = calculateSobrietyDays(member.sobrietyDate);
    
    return (
      <View key={member.id} style={styles.memberItem}>
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{member.name || 'Anonymous Member'}</Text>
          <View style={styles.memberDetails}>
            {member.sobrietyDate ? (
              <View style={styles.memberDetailItem}>
                <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                <Text style={styles.memberDetailText}>{sobrietyDays} days sober</Text>
              </View>
            ) : null}
            
            <View style={styles.memberDetailItem}>
              <Ionicons name="location-outline" size={16} color="#6b7280" />
              <Text style={styles.memberDetailText}>
                {member.distance.toFixed(1)} miles away
              </Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => callMember(member.phone)}
          disabled={!member.phone}
        >
          <Ionicons 
            name="call" 
            size={20} 
            color={member.phone ? '#3b82f6' : '#9ca3af'} 
          />
        </TouchableOpacity>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nearby AA Members</Text>
      </View>
      
      <View style={styles.settingsCard}>
        <Text style={styles.settingsTitle}>Your Discoverability</Text>
        <Text style={styles.settingsDescription}>
          When enabled, other AA members using this app can see your first name, sobriety date,
          and phone number if they are within your set radius.
        </Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <Text style={styles.settingLabel}>Make Me Discoverable</Text>
            <Text style={styles.settingDescription}>Allow other members to find you</Text>
          </View>
          <Switch
            value={discoverable}
            onValueChange={handleDiscoverabilityToggle}
            trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
            thumbColor={discoverable ? '#3b82f6' : '#f3f4f6'}
          />
        </View>
        
        <View style={styles.radiusContainer}>
          <Text style={styles.radiusLabel}>
            Discovery Radius: {radius} {radius === 1 ? 'mile' : 'miles'}
          </Text>
          <Slider
            style={styles.radiusSlider}
            minimumValue={1}
            maximumValue={25}
            step={1}
            value={radius}
            onValueChange={setRadius}
            onSlidingComplete={handleRadiusChange}
            minimumTrackTintColor="#3b82f6"
            maximumTrackTintColor="#d1d5db"
            thumbTintColor="#3b82f6"
          />
          <View style={styles.radiusLabels}>
            <Text style={styles.radiusLabelText}>1</Text>
            <Text style={styles.radiusLabelText}>5</Text>
            <Text style={styles.radiusLabelText}>10</Text>
            <Text style={styles.radiusLabelText}>15</Text>
            <Text style={styles.radiusLabelText}>20</Text>
            <Text style={styles.radiusLabelText}>25</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.membersTitle}>Nearby Members</Text>
        
        {!locationPermission ? (
          <View style={styles.messageContainer}>
            <Ionicons name="location-off" size={48} color="#d1d5db" />
            <Text style={styles.messageTitle}>Location Permission Required</Text>
            <Text style={styles.messageText}>
              This feature requires location permission to find nearby AA members.
            </Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={checkLocationPermission}
            >
              <Text style={styles.actionButtonText}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        ) : !discoverable ? (
          <View style={styles.messageContainer}>
            <Ionicons name="eye-off" size={48} color="#d1d5db" />
            <Text style={styles.messageTitle}>Discoverability Disabled</Text>
            <Text style={styles.messageText}>
              You need to enable discoverability to see nearby members.
            </Text>
          </View>
        ) : loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Finding nearby members...</Text>
          </View>
        ) : nearbyMembers.length === 0 ? (
          <View style={styles.messageContainer}>
            <Ionicons name="people" size={48} color="#d1d5db" />
            <Text style={styles.messageTitle}>No Nearby Members</Text>
            <Text style={styles.messageText}>
              No AA members found nearby at this time. This could be because other members 
              have not enabled discoverability or are not currently in your area.
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.membersList}>
            {nearbyMembers.map(member => renderMemberItem(member))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  settingsCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  settingsDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLabelContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  radiusContainer: {
    marginBottom: 8,
  },
  radiusLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 8,
  },
  radiusSlider: {
    width: '100%',
    height: 40,
  },
  radiusLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  radiusLabelText: {
    fontSize: 12,
    color: '#6b7280',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  membersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  membersList: {
    flex: 1,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  memberDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  memberDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  memberDetailText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NearbyMembersScreen;