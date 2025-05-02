import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Switch, 
  FlatList, 
  ActivityIndicator, 
  Linking, 
  Alert, 
  Modal 
} from 'react-native';
import * as Location from 'expo-location';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../contexts/UserContext';
import { userOperations, calculateDistance, calculateSobrietyYears } from '../utils/database';
import ProximityWizard from './ProximityWizard';

function NearbyMembers({ navigation, onStartWizard }) {
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDiscoverable, setIsDiscoverable] = useState(false);
  const [searchRadius, setSearchRadius] = useState(5); // Default 5km radius
  const [showWizard, setShowWizard] = useState(false);
  const { user, setUser } = useUser();

  // Toggle discoverability status
  const toggleDiscoverability = async (value) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (user && user.id) {
        await userOperations.updateDiscoverability(user.id, value);
        setIsDiscoverable(value);
        setUser({ ...user, discoverable: value });
      }
    } catch (error) {
      console.error('Error updating discoverability:', error);
      setError('Failed to update discoverability settings');
      setIsDiscoverable(!value); // Revert UI on error
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch nearby users
  const fetchNearbyUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get current location
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Location permission is required to find nearby members');
        setIsLoading(false);
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });
      
      const { latitude, longitude } = location.coords;
      
      // Update user location
      if (user && user.id) {
        await userOperations.updateUserLocation(user.id, latitude, longitude);
      }
      
      // Get nearby users
      const nearby = await userOperations.getNearbyUsers(latitude, longitude, searchRadius);
      
      // Filter out the current user
      const filteredUsers = nearby.filter(u => u.id !== user?.id);
      
      setNearbyUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching nearby users:', error);
      setError('Failed to find nearby members. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get user discovery setting on component mount
  useEffect(() => {
    if (user) {
      setIsDiscoverable(!!user.discoverable);
      fetchNearbyUsers();
    }
  }, [user, searchRadius]);

  // Calculate time since last seen
  const getTimeSince = (lastSeen) => {
    if (!lastSeen) return 'Unknown';
    
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffMs = now - lastSeenDate;
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  // Start the proximity wizard
  const startWizard = () => {
    if (navigation && navigation.navigate) {
      // Use stack navigation if available
      navigation.navigate('ProximityWizard');
    } else if (onStartWizard) {
      // Use callback if provided
      onStartWizard();
    } else {
      // Fallback to modal
      setShowWizard(true);
    }
  };

  // Call a user
  const callUser = (phone, name) => {
    if (!phone) {
      Alert.alert('No Phone Number', 'This member has not shared their phone number.');
      return;
    }
    
    Alert.alert(
      'Call Member',
      `Would you like to call ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: () => {
            Linking.openURL(`tel:${phone}`);
          }
        }
      ]
    );
  };

  // Render user item
  const renderUserItem = ({ item }) => {
    const sobrietyYears = item.sobrietyDate ? calculateSobrietyYears(item.sobrietyDate) : null;
    
    return (
      <View style={styles.userCard}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          {item.sobrietyDate && (
            <Text style={styles.userDetail}>
              {sobrietyYears} years sober
            </Text>
          )}
          <Text style={styles.userLastSeen}>
            Last seen: {getTimeSince(item.lastSeen)}
          </Text>
          <Text style={styles.userDistance}>
            {item.distance.toFixed(1)} km away
          </Text>
        </View>
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => callUser(item.phone, item.name)}
        >
          <Ionicons name="call" size={20} color="white" />
          <Text style={styles.callButtonText}>Call</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nearby AA Members</Text>
        <TouchableOpacity
          style={styles.wizardButton}
          onPress={startWizard}
        >
          <Text style={styles.wizardButtonText}>Connection Wizard</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.discoverySettings}>
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingTitle}>Discoverability</Text>
            <Text style={styles.settingDescription}>
              {isDiscoverable 
                ? 'Other AA members can see you' 
                : 'You are hidden from other members'}
            </Text>
          </View>
          <Switch
            value={isDiscoverable}
            onValueChange={toggleDiscoverability}
            disabled={isLoading}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isDiscoverable ? '#3498db' : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingTitle}>Search Radius: {searchRadius} km</Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={25}
            step={1}
            value={searchRadius}
            onValueChange={setSearchRadius}
            minimumTrackTintColor="#3498db"
            maximumTrackTintColor="#d3d3d3"
          />
        </View>
        
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={fetchNearbyUsers}
          disabled={isLoading}
        >
          <Text style={styles.refreshButtonText}>
            {isLoading ? 'Searching...' : 'Refresh Search'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>
          {nearbyUsers.length === 0 
            ? 'No members found nearby' 
            : `Found ${nearbyUsers.length} nearby ${nearbyUsers.length === 1 ? 'member' : 'members'}`}
        </Text>
        
        {isLoading ? (
          <ActivityIndicator size="large" color="#3498db" style={styles.loader} />
        ) : (
          <FlatList
            data={nearbyUsers}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.userList}
            ListEmptyComponent={
              !isLoading && (
                <View style={styles.emptyState}>
                  <Ionicons name="people" size={48} color="#cccccc" />
                  <Text style={styles.emptyStateText}>
                    No members found within {searchRadius} km
                  </Text>
                  <Text style={styles.emptyStateSubtext}>
                    Try increasing your search radius or check back later
                  </Text>
                </View>
              )
            }
          />
        )}
      </View>
      
      <Modal visible={showWizard} animationType="slide">
        <ProximityWizard
          onClose={() => {
            setShowWizard(false);
            // Refresh after wizard closes
            fetchNearbyUsers();
          }}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  wizardButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  wizardButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  discoverySettings: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  settingRow: {
    marginBottom: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  refreshButton: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#ffcccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#e74c3c',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  userList: {
    flexGrow: 1,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userDetail: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  userLastSeen: {
    fontSize: 12,
    color: '#95a5a6',
    marginBottom: 2,
  },
  userDistance: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: 'bold',
  },
  callButton: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  callButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7f8c8d',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#95a5a6',
    marginTop: 8,
    textAlign: 'center',
  },
  loader: {
    marginTop: 24,
  },
});

export default NearbyMembers;