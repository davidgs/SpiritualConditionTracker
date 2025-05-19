import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Linking,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useUser } from '../contexts/UserContext';
import { discoveredMembersOperations } from '../utils/database';

const NearbyMembersScreen = ({ navigation }) => {
  const { user } = useUser();
  const [discoveredMembers, setDiscoveredMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDiscovering, setIsDiscovering] = useState(false);
  
  // Load nearby members on mount
  useEffect(() => {
    loadDiscoveredMembers();
  }, []);
  
  // Load discovered members from database
  const loadDiscoveredMembers = async () => {
    try {
      setIsLoading(true);
      const members = await discoveredMembersOperations.getAll();
      setDiscoveredMembers(members);
    } catch (error) {
      console.error('[ NearbyMembersScreen.js ] Error loading discovered members:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Start nearby discovery
  const startDiscovery = () => {
    // Navigate to the proximity wizard to handle discovery
    navigation.navigate('ProximityWizard');
  };
  
  // Handle calling a nearby member
  const callMember = (member) => {
    Alert.alert(
      'Call Member',
      `Would you like to call ${member.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Call',
          onPress: () => {
            // Simulate phone number
            const phoneNumber = '555-555-5555';
            Linking.openURL(`tel:${phoneNumber}`);
          }
        }
      ]
    );
  };
  
  // Render each nearby member
  const renderMember = ({ item }) => {
    // Get discovery method icon
    const getDiscoveryIcon = (method) => {
      switch (method) {
        case 'bluetooth':
          return 'bluetooth-b';
        case 'wifi':
          return 'wifi';
        case 'gps':
          return 'map-marker-alt';
        default:
          return 'user';
      }
    };
    
    // Format last seen date
    const formatLastSeen = (dateStr) => {
      const lastSeen = new Date(dateStr);
      const now = new Date();
      const diffMs = now - lastSeen;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffMins < 60) {
        return `${diffMins} min ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      } else {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      }
    };
    
    return (
      <View style={styles.memberItem}>
        <View style={styles.memberInfo}>
          <View style={styles.memberAvatar}>
            <Icon name="user" size={24} color="#fff" />
          </View>
          
          <View style={styles.memberDetails}>
            <Text style={styles.memberName}>{item.name}</Text>
            <View style={styles.memberMeta}>
              <Icon 
                name={getDiscoveryIcon(item.discoveryMethod)} 
                size={12} 
                color="#7f8c8d" 
                style={styles.metaIcon}
              />
              <Text style={styles.memberMetaText}>
                Discovered via {item.discoveryMethod}
              </Text>
            </View>
            <Text style={styles.memberLastSeen}>
              Last seen: {formatLastSeen(item.lastSeen)}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.callButton}
          onPress={() => callMember(item)}
        >
          <Icon name="phone" size={20} color="#3498db" />
        </TouchableOpacity>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Nearby AA Members</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.discoveryButton}
          onPress={startDiscovery}
          disabled={isDiscovering}
        >
          <Icon name="search" size={16} color="#fff" style={styles.discoveryIcon} />
          <Text style={styles.discoveryButtonText}>
            Start Nearby Discovery
          </Text>
        </TouchableOpacity>
        
        <View style={styles.privacyNote}>
          <Icon name="shield-alt" size={14} color="#7f8c8d" style={styles.privacyIcon} />
          <Text style={styles.privacyText}>
            Only your first name is shared with nearby AA members
          </Text>
        </View>
        
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Recently Discovered</Text>
        </View>
        
        {isLoading ? (
          <View style={styles.centered}>
            <Text>Loading nearby members...</Text>
          </View>
        ) : discoveredMembers.length === 0 ? (
          <View style={styles.centered}>
            <Icon name="users" size={50} color="#bdc3c7" />
            <Text style={styles.emptyText}>
              No nearby members discovered yet
            </Text>
            <Text style={styles.emptySubtext}>
              Tap "Start Nearby Discovery" to find AA members around you
            </Text>
          </View>
        ) : (
          <FlatList
            data={discoveredMembers}
            renderItem={renderMember}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  container: {
    flex: 1,
    padding: 16
  },
  header: {
    marginBottom: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  discoveryButton: {
    backgroundColor: '#3498db',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    marginBottom: 8
  },
  discoveryIcon: {
    marginRight: 8
  },
  discoveryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  privacyIcon: {
    marginRight: 6
  },
  privacyText: {
    fontSize: 12,
    color: '#7f8c8d'
  },
  listHeader: {
    marginBottom: 12
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50'
  },
  list: {
    paddingBottom: 20
  },
  memberItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  memberDetails: {
    flex: 1
  },
  memberName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4
  },
  memberMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2
  },
  metaIcon: {
    marginRight: 6
  },
  memberMetaText: {
    fontSize: 14,
    color: '#7f8c8d'
  },
  memberLastSeen: {
    fontSize: 14,
    color: '#7f8c8d'
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f7fd',
    justifyContent: 'center',
    alignItems: 'center'
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8
  },
  emptySubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 20
  }
});

export default NearbyMembersScreen;