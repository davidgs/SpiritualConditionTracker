import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useUser } from '../contexts/UserContext';
import ProximityWizard from '../components/ProximityWizard';

function NearbyMembersScreen({ navigation }) {
  const { user } = useUser();
  const [discoveryEnabled, setDiscoveryEnabled] = useState(false);
  const [locationPermission, setLocationPermission] = useState(null);
  const [nearbyMembers, setNearbyMembers] = useState([]);
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    // Request location permission when the component mounts
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
    })();
  }, []);

  const toggleDiscovery = async () => {
    if (!discoveryEnabled) {
      // If turning on discovery, check for location permission
      if (!locationPermission) {
        Alert.alert(
          'Location Permission Required',
          'Nearby member discovery requires location access. Please enable location services in your device settings.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Start discovery here
      setDiscoveryEnabled(true);
      
      // Simulate finding nearby members - in a real app, this would use actual API/Bluetooth
      setTimeout(() => {
        setNearbyMembers([
          {
            id: '1',
            firstName: 'John',
            sobrietyYears: 3,
            distance: 0.3,
            discoveryMethod: 'bluetooth'
          },
          {
            id: '2',
            firstName: 'Sarah',
            sobrietyYears: 5,
            distance: 0.7,
            discoveryMethod: 'location'
          },
          {
            id: '3',
            firstName: 'Michael',
            sobrietyYears: 1,
            distance: 1.2,
            discoveryMethod: 'location'
          }
        ]);
      }, 2000);
    } else {
      // Stop discovery here
      setDiscoveryEnabled(false);
      setNearbyMembers([]);
    }
  };

  const startProximityWizard = () => {
    setShowWizard(true);
  };

  const renderDiscoveryIcon = (method) => {
    if (method === 'bluetooth') {
      return <MaterialCommunityIcons name="bluetooth" size={18} color="#4a86e8" />;
    } else {
      return <MaterialCommunityIcons name="map-marker" size={18} color="#4a86e8" />;
    }
  };

  return (
    <View style={styles.container}>
      {showWizard ? (
        <ProximityWizard onClose={() => setShowWizard(false)} navigation={navigation} />
      ) : (
        <>
          <View style={styles.card}>
            <Text style={styles.title}>Nearby Members Discovery</Text>
            
            <View style={styles.discoveryToggleContainer}>
              <Text style={styles.discoveryLabel}>Enable Discovery</Text>
              <Switch
                value={discoveryEnabled}
                onValueChange={toggleDiscovery}
                trackColor={{ false: '#ccc', true: '#90caf9' }}
                thumbColor={discoveryEnabled ? '#4a86e8' : '#f4f3f4'}
              />
            </View>
            
            <Text style={styles.privacyNote}>
              When enabled, your profile (first name only) will be visible to other nearby AA members. 
              Your exact location is never shared.
            </Text>
          </View>
          
          <ScrollView style={styles.membersContainer}>
            {discoveryEnabled ? (
              nearbyMembers.length > 0 ? (
                <>
                  <Text style={styles.sectionTitle}>
                    {nearbyMembers.length} members found nearby
                  </Text>
                  {nearbyMembers.map((member) => (
                    <TouchableOpacity 
                      key={member.id} 
                      style={styles.memberCard}
                      onPress={startProximityWizard}
                    >
                      <View style={styles.memberInfo}>
                        <Text style={styles.memberName}>{member.firstName}</Text>
                        <Text style={styles.memberDetails}>
                          {member.sobrietyYears} {member.sobrietyYears === 1 ? 'year' : 'years'} sober
                        </Text>
                        <View style={styles.distanceContainer}>
                          {renderDiscoveryIcon(member.discoveryMethod)}
                          <Text style={styles.distanceText}>
                            {member.distance.toFixed(1)} miles away
                          </Text>
                        </View>
                      </View>
                      <MaterialCommunityIcons name="chevron-right" size={22} color="#999" />
                    </TouchableOpacity>
                  ))}
                </>
              ) : (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons name="account-search" size={50} color="#ccc" />
                  <Text style={styles.emptyText}>Searching for nearby members...</Text>
                </View>
              )
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="account-off" size={50} color="#ccc" />
                <Text style={styles.emptyText}>
                  Enable discovery to find AA members near you
                </Text>
              </View>
            )}
          </ScrollView>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.wizardButton, !discoveryEnabled && styles.wizardButtonDisabled]}
              onPress={startProximityWizard}
              disabled={!discoveryEnabled}
            >
              <Text style={styles.wizardButtonText}>Start Connection Wizard</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  discoveryToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  discoveryLabel: {
    fontSize: 16,
    color: '#333',
  },
  privacyNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 10,
  },
  membersContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 5,
    color: '#555',
  },
  memberCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  memberDetails: {
    fontSize: 14,
    color: '#666',
    marginVertical: 5,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 14,
    color: '#4a86e8',
    marginLeft: 5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 15,
    maxWidth: '80%',
  },
  buttonContainer: {
    padding: 15,
  },
  wizardButton: {
    backgroundColor: '#4a86e8',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
  },
  wizardButtonDisabled: {
    backgroundColor: '#b0c4e8',
  },
  wizardButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default NearbyMembersScreen;