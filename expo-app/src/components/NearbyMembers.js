import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';

/**
 * NearbyMembers component displays nearby AA members and
 * provides functionality to connect with them
 */
function NearbyMembers({ navigation, onStartWizard }) {
  const { theme } = useTheme();
  const [location, setLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [nearbyMembers, setNearbyMembers] = useState([]);
  
  useEffect(() => {
    checkLocationPermission();
  }, []);
  
  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
      
      if (status === 'granted') {
        await getCurrentLocation();
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error checking location permission:', error);
      setIsLoading(false);
    }
  };
  
  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      setLocation(location);
      await findNearbyMembers(location);
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please make sure location services are enabled.'
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  const findNearbyMembers = async (userLocation) => {
    // This would normally make an API call to find nearby members
    // For now, we'll use mock data to demonstrate the UI
    
    // Sample data - in a real app, this would come from your API
    const mockNearbyMembers = [
      {
        id: 1,
        username: 'John S.',
        distance: 0.3,
        sobrietyYears: 5.2,
        isReachable: true,
        lastActive: '10 minutes ago'
      },
      {
        id: 2,
        username: 'Sarah M.',
        distance: 0.7,
        sobrietyYears: 2.4,
        isReachable: true,
        lastActive: '2 hours ago'
      },
      {
        id: 3,
        username: 'Robert J.',
        distance: 1.1,
        sobrietyYears: 8.7,
        isReachable: false,
        lastActive: 'Yesterday'
      },
      {
        id: 4,
        username: 'Emily K.',
        distance: 1.5,
        sobrietyYears: 1.1,
        isReachable: true,
        lastActive: '5 minutes ago'
      }
    ];
    
    setNearbyMembers(mockNearbyMembers);
  };
  
  const handleConnectWithMember = (member) => {
    if (onStartWizard) {
      onStartWizard(member);
    } else {
      // Fallback if no callback is provided
      Alert.alert(
        'Connect with Member',
        `Start connection with ${member.username}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Connect',
            onPress: () => {
              // Navigate to proximity wizard screen
              navigation.navigate('ProximityWizard', { member });
            }
          }
        ]
      );
    }
  };
  
  const themedStyles = {
    container: {
      backgroundColor: theme.background,
    },
    header: {
      color: theme.text,
    },
    card: {
      backgroundColor: theme.cardBackground,
      borderColor: theme.border,
    },
    userName: {
      color: theme.text,
    },
    userInfo: {
      color: theme.textSecondary,
    },
    connectButton: {
      backgroundColor: theme.primary,
    },
    unavailableButton: {
      backgroundColor: theme.isDark ? '#444444' : '#e0e0e0',
    },
    locationPermissionCard: {
      backgroundColor: theme.errorBackground,
      borderColor: theme.error,
    },
    locationPermissionText: {
      color: theme.error,
    },
    refreshButton: {
      backgroundColor: theme.primary,
    },
    refreshButtonText: {
      color: '#FFFFFF',
    },
    emptyText: {
      color: theme.textSecondary,
    }
  };
  
  return (
    <ScrollView style={[styles.container, themedStyles.container]}>
      <Text style={[styles.header, themedStyles.header]}>Nearby AA Members</Text>
      
      {!locationPermission && (
        <View style={[styles.locationPermissionCard, themedStyles.locationPermissionCard]}>
          <Text style={[styles.locationPermissionText, themedStyles.locationPermissionText]}>
            Location permission is required to find nearby members.
          </Text>
          <TouchableOpacity 
            style={[styles.refreshButton, themedStyles.refreshButton]}
            onPress={checkLocationPermission}
          >
            <Text style={styles.refreshButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {locationPermission && (
        <View style={styles.refreshContainer}>
          <TouchableOpacity 
            style={[styles.refreshButton, themedStyles.refreshButton]}
            onPress={getCurrentLocation}
            disabled={isLoading}
          >
            <Icon name="refresh" size={16} color="#FFFFFF" style={styles.refreshIcon} />
            <Text style={styles.refreshButtonText}>
              {isLoading ? 'Searching...' : 'Refresh Nearby'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={themedStyles.emptyText}>Searching for nearby members...</Text>
        </View>
      ) : locationPermission && nearbyMembers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="users" size={60} color={theme.textSecondary} style={styles.emptyIcon} />
          <Text style={[styles.emptyText, themedStyles.emptyText]}>
            No AA members found nearby.
          </Text>
          <Text style={[styles.emptySubText, themedStyles.emptyText]}>
            Try again later or expand your search radius.
          </Text>
        </View>
      ) : locationPermission && (
        <View style={styles.membersContainer}>
          {nearbyMembers.map(member => (
            <View key={member.id} style={[styles.memberCard, themedStyles.card]}>
              <View style={styles.memberInfo}>
                <View style={styles.memberNameContainer}>
                  <Text style={[styles.memberName, themedStyles.userName]}>
                    {member.username}
                  </Text>
                  <View style={styles.sobrietyBadge}>
                    <Icon name="calendar" size={12} color="#FFFFFF" style={styles.sobrietyIcon} />
                    <Text style={styles.sobrietyText}>
                      {member.sobrietyYears.toFixed(1)} Years
                    </Text>
                  </View>
                </View>
                
                <Text style={[styles.memberDistance, themedStyles.userInfo]}>
                  <Icon name="map-marker" size={14} /> {member.distance} miles away
                </Text>
                
                <Text style={[styles.memberActive, themedStyles.userInfo]}>
                  <Icon name="clock-o" size={14} /> Active {member.lastActive}
                </Text>
              </View>
              
              <TouchableOpacity
                style={[
                  styles.connectButton,
                  member.isReachable ? themedStyles.connectButton : themedStyles.unavailableButton
                ]}
                onPress={() => handleConnectWithMember(member)}
                disabled={!member.isReachable}
              >
                <Text style={styles.connectButtonText}>
                  {member.isReachable ? 'Connect' : 'Unavailable'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      
      <View style={styles.privacyContainer}>
        <Text style={[styles.privacyTitle, themedStyles.header]}>Your Privacy</Text>
        <Text style={[styles.privacyText, themedStyles.userInfo]}>
          Your anonymity is protected. Other members can only see your first name and 
          last initial. Your exact location is never shared - only approximate distance.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  locationPermissionCard: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
  },
  locationPermissionText: {
    fontSize: 15,
    marginBottom: 15,
  },
  refreshContainer: {
    marginBottom: 20,
    alignItems: 'flex-end',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  refreshIcon: {
    marginRight: 8,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  membersContainer: {
    marginBottom: 20,
  },
  memberCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
  },
  memberInfo: {
    flex: 1,
  },
  memberNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 5,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
  },
  sobrietyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F86C6',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  sobrietyIcon: {
    marginRight: 4,
  },
  sobrietyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  memberDistance: {
    fontSize: 14,
    marginBottom: 2,
  },
  memberActive: {
    fontSize: 14,
  },
  connectButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 10,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    marginBottom: 20,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  privacyContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  privacyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  privacyText: {
    fontSize: 14,
    lineHeight: 20,
  }
});

export default NearbyMembers;