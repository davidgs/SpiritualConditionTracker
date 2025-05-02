import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch, Slider, ScrollView, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { useUser } from '../contexts/UserContext';
import { userOperations, calculateDistance, calculateSobrietyYears } from '../utils/database';

const STEPS = {
  INTRO: 'intro',
  PERMISSIONS: 'permissions',
  DISCOVERABILITY: 'discoverability',
  SEARCH_RADIUS: 'searchRadius',
  SEARCH_RESULTS: 'searchResults',
  NO_RESULTS: 'noResults',
  CONNECTION: 'connection'
};

export default function ProximityWizard({ onClose }) {
  const [currentStep, setCurrentStep] = useState(STEPS.INTRO);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [isDiscoverable, setIsDiscoverable] = useState(false);
  const [searchRadius, setSearchRadius] = useState(10); // default 10km radius
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, setUser } = useUser();

  // Ask for location permissions
  const requestLocationPermission = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Location permission is required to find nearby members');
        setHasLocationPermission(false);
        return;
      }
      
      setHasLocationPermission(true);
      setCurrentStep(STEPS.DISCOVERABILITY);
      
    } catch (err) {
      setError('Error requesting location permissions: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle discoverability
  const toggleDiscoverability = async (value) => {
    setIsLoading(true);
    setError(null);
    
    try {
      setIsDiscoverable(value);
      
      // Update user in database
      if (user && user.id) {
        await userOperations.updateDiscoverability(user.id, value);
        
        // Update user context
        setUser({ ...user, discoverable: value });
      }
      
    } catch (err) {
      setError('Error updating discoverability: ' + err.message);
      setIsDiscoverable(!value); // Revert on error
    } finally {
      setIsLoading(false);
    }
  };

  // Find nearby users based on search radius
  const findNearbyUsers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const { latitude, longitude } = location.coords;
      
      // Update user's location in the database
      if (user && user.id) {
        await userOperations.updateUserLocation(user.id, latitude, longitude);
      }
      
      // Find nearby users
      const nearby = await userOperations.getNearbyUsers(latitude, longitude, searchRadius);
      
      // Filter out the current user
      const filteredUsers = nearby.filter(u => u.id !== user.id);
      
      setNearbyUsers(filteredUsers);
      
      // Navigate to appropriate step based on results
      if (filteredUsers.length > 0) {
        setCurrentStep(STEPS.SEARCH_RESULTS);
      } else {
        setCurrentStep(STEPS.NO_RESULTS);
      }
      
    } catch (err) {
      setError('Error finding nearby users: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Select a user to connect with
  const selectUser = (user) => {
    setSelectedUser(user);
    setCurrentStep(STEPS.CONNECTION);
  };

  // Format phone number for display
  const formatPhoneNumber = (phone) => {
    if (!phone) return 'Not available';
    
    // Basic US format (XXX) XXX-XXXX
    const cleaned = ('' + phone).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    
    if (match) {
      return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    
    return phone;
  };

  // Render current step content
  const renderStep = () => {
    switch (currentStep) {
      case STEPS.INTRO:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Connect with Nearby AA Members</Text>
            <Text style={styles.description}>
              This wizard will help you discover and connect with other members of 
              Alcoholics Anonymous in your area. Your privacy and anonymity are important, 
              and you can control what information is shared.
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setCurrentStep(STEPS.PERMISSIONS)}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        );
        
      case STEPS.PERMISSIONS:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Location Access</Text>
            <Text style={styles.description}>
              To find nearby members, we need access to your location. This information 
              is only stored on your device and is never shared without your permission.
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={requestLocationPermission}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Requesting...' : 'Allow Location Access'}
              </Text>
            </TouchableOpacity>
            {error && <Text style={styles.error}>{error}</Text>}
            {isLoading && <ActivityIndicator style={styles.loader} />}
          </View>
        );
        
      case STEPS.DISCOVERABILITY:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Discoverability Settings</Text>
            <Text style={styles.description}>
              Would you like to be discoverable to other members? If enabled, your 
              basic profile info (name, sobriety date, and phone number) will be 
              visible to nearby members.
            </Text>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>I want to be discoverable</Text>
              <Switch
                value={isDiscoverable}
                onValueChange={toggleDiscoverability}
                disabled={isLoading}
              />
            </View>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setCurrentStep(STEPS.SEARCH_RADIUS)}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
            {error && <Text style={styles.error}>{error}</Text>}
            {isLoading && <ActivityIndicator style={styles.loader} />}
          </View>
        );
        
      case STEPS.SEARCH_RADIUS:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Set Search Radius</Text>
            <Text style={styles.description}>
              How far would you like to search for other members? Set your preferred 
              distance in kilometers.
            </Text>
            <Text style={styles.radiusText}>{searchRadius} km</Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={50}
              step={1}
              value={searchRadius}
              onValueChange={setSearchRadius}
              minimumTrackTintColor="#007AFF"
              maximumTrackTintColor="#D3D3D3"
            />
            <TouchableOpacity
              style={styles.button}
              onPress={findNearbyUsers}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Searching...' : 'Find Nearby Members'}
              </Text>
            </TouchableOpacity>
            {error && <Text style={styles.error}>{error}</Text>}
            {isLoading && <ActivityIndicator style={styles.loader} />}
          </View>
        );
        
      case STEPS.SEARCH_RESULTS:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Nearby Members</Text>
            <Text style={styles.description}>
              {nearbyUsers.length} member{nearbyUsers.length !== 1 ? 's' : ''} found within {searchRadius} km.
              Select a member to view their details.
            </Text>
            <ScrollView style={styles.resultsList}>
              {nearbyUsers.map(user => (
                <TouchableOpacity
                  key={user.id}
                  style={styles.userCard}
                  onPress={() => selectUser(user)}
                >
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userDetail}>
                    {user.sobrietyDate ? 
                      `${calculateSobrietyYears(user.sobrietyDate)} years sober` : 
                      'Sobriety date not shared'}
                  </Text>
                  <Text style={styles.userDistance}>
                    {user.distance.toFixed(1)} km away
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setCurrentStep(STEPS.SEARCH_RADIUS)}
            >
              <Text style={styles.secondaryButtonText}>Adjust Search Radius</Text>
            </TouchableOpacity>
          </View>
        );
        
      case STEPS.NO_RESULTS:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>No Members Found</Text>
            <Text style={styles.description}>
              We couldn't find any members within {searchRadius} km of your location.
              Try increasing your search radius or check back later.
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setCurrentStep(STEPS.SEARCH_RADIUS)}
            >
              <Text style={styles.buttonText}>Adjust Search Radius</Text>
            </TouchableOpacity>
          </View>
        );
        
      case STEPS.CONNECTION:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Member Details</Text>
            {selectedUser && (
              <View style={styles.connectionCard}>
                <Text style={styles.connectionName}>{selectedUser.name}</Text>
                <Text style={styles.connectionDetail}>
                  {selectedUser.sobrietyDate ? 
                    `Sobriety Date: ${new Date(selectedUser.sobrietyDate).toLocaleDateString()}` : 
                    'Sobriety date not shared'}
                </Text>
                <Text style={styles.connectionDetail}>
                  {selectedUser.sobrietyDate ? 
                    `Years Sober: ${calculateSobrietyYears(selectedUser.sobrietyDate)}` : 
                    ''}
                </Text>
                <Text style={styles.connectionDetail}>
                  Phone: {formatPhoneNumber(selectedUser.phone)}
                </Text>
                <Text style={styles.connectionDetail}>
                  Distance: {selectedUser.distance.toFixed(1)} km away
                </Text>
                {selectedUser.phone && (
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                      // Just simulate the phone call for now
                      Alert.alert(
                        'Call Member',
                        `This would call ${selectedUser.name} at ${formatPhoneNumber(selectedUser.phone)}`,
                        [{ text: 'OK' }]
                      );
                    }}
                  >
                    <Text style={styles.buttonText}>Call Member</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setCurrentStep(STEPS.SEARCH_RESULTS)}
            >
              <Text style={styles.secondaryButtonText}>Back to Results</Text>
            </TouchableOpacity>
          </View>
        );
        
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderStep()}
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#555',
  },
  button: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryButtonText: {
    color: '#555',
    fontSize: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#555',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 30,
  },
  radiusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultsList: {
    width: '100%',
    maxHeight: 300,
    marginBottom: 20,
  },
  userCard: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userDetail: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  userDistance: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: 'bold',
  },
  connectionCard: {
    backgroundColor: '#f8f8f8',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  connectionName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  connectionDetail: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
  loader: {
    marginTop: 20,
  },
});