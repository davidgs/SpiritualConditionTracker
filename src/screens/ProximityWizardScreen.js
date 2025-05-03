import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useUser } from '../contexts/UserContext';
import { discoveredMembersOperations } from '../utils/database';

// Proximity discovery modes
const DISCOVERY_MODES = {
  BLUETOOTH: 'bluetooth',
  WIFI: 'wifi',
  GPS: 'gps'
};

const ProximityWizardScreen = ({ navigation }) => {
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedMode, setSelectedMode] = useState(DISCOVERY_MODES.BLUETOOTH);
  const [discoveredMembers, setDiscoveredMembers] = useState([]);
  
  // Mock functions for demonstration
  const startScanning = async (mode) => {
    setIsScanning(true);
    
    // Simulate discovery delay
    setTimeout(() => {
      // Generate mock discovered members
      const mockDiscoveredMembers = [
        {
          deviceId: 'device1',
          name: 'John S.',
          discoveryMethod: mode,
          meetCount: 0
        },
        {
          deviceId: 'device2',
          name: 'Sarah M.',
          discoveryMethod: mode,
          meetCount: 0
        }
      ];
      
      setDiscoveredMembers(mockDiscoveredMembers);
      setIsScanning(false);
    }, 3000);
  };
  
  const stopScanning = () => {
    setIsScanning(false);
  };
  
  // Save discovered members
  const saveDiscoveredMembers = async () => {
    try {
      // Save each discovered member to the database
      for (const member of discoveredMembers) {
        await discoveredMembersOperations.saveOrUpdate(member);
      }
      
      // Show success message
      Alert.alert(
        'Success',
        'Nearby members have been added to your contacts.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error saving discovered members:', error);
      Alert.alert('Error', 'Failed to save nearby members.');
    }
  };
  
  // Step 1: Select discovery mode
  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select Discovery Mode</Text>
      <Text style={styles.stepDescription}>
        Choose how you want to discover nearby AA members.
      </Text>
      
      <View style={styles.optionsContainer}>
        <TouchableOpacity 
          style={[
            styles.modeOption,
            selectedMode === DISCOVERY_MODES.BLUETOOTH && styles.modeOptionSelected
          ]}
          onPress={() => setSelectedMode(DISCOVERY_MODES.BLUETOOTH)}
        >
          <Icon 
            name="bluetooth-b" 
            size={32} 
            color={selectedMode === DISCOVERY_MODES.BLUETOOTH ? '#fff' : '#3498db'} 
            style={styles.modeIcon}
          />
          <Text 
            style={[
              styles.modeTitle,
              selectedMode === DISCOVERY_MODES.BLUETOOTH && styles.modeTitleSelected
            ]}
          >
            Bluetooth
          </Text>
          <Text 
            style={[
              styles.modeDescription,
              selectedMode === DISCOVERY_MODES.BLUETOOTH && styles.modeDescriptionSelected
            ]}
          >
            High accuracy, short range (30-50 ft)
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.modeOption,
            selectedMode === DISCOVERY_MODES.WIFI && styles.modeOptionSelected
          ]}
          onPress={() => setSelectedMode(DISCOVERY_MODES.WIFI)}
        >
          <Icon 
            name="wifi" 
            size={32} 
            color={selectedMode === DISCOVERY_MODES.WIFI ? '#fff' : '#3498db'} 
            style={styles.modeIcon}
          />
          <Text 
            style={[
              styles.modeTitle,
              selectedMode === DISCOVERY_MODES.WIFI && styles.modeTitleSelected
            ]}
          >
            Wi-Fi
          </Text>
          <Text 
            style={[
              styles.modeDescription,
              selectedMode === DISCOVERY_MODES.WIFI && styles.modeDescriptionSelected
            ]}
          >
            Medium accuracy, medium range (100-150 ft)
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.modeOption,
            selectedMode === DISCOVERY_MODES.GPS && styles.modeOptionSelected
          ]}
          onPress={() => setSelectedMode(DISCOVERY_MODES.GPS)}
        >
          <Icon 
            name="map-marker-alt" 
            size={32} 
            color={selectedMode === DISCOVERY_MODES.GPS ? '#fff' : '#3498db'} 
            style={styles.modeIcon}
          />
          <Text 
            style={[
              styles.modeTitle,
              selectedMode === DISCOVERY_MODES.GPS && styles.modeTitleSelected
            ]}
          >
            GPS Location
          </Text>
          <Text 
            style={[
              styles.modeDescription,
              selectedMode === DISCOVERY_MODES.GPS && styles.modeDescriptionSelected
            ]}
          >
            Low accuracy, long range (1000+ ft)
          </Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.nextButton}
        onPress={() => setCurrentStep(2)}
      >
        <Text style={styles.nextButtonText}>Continue</Text>
        <Icon name="arrow-right" size={16} color="#fff" style={styles.nextButtonIcon} />
      </TouchableOpacity>
    </View>
  );
  
  // Step 2: Scan for nearby members
  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>
        Scanning for Nearby Members
      </Text>
      <Text style={styles.stepDescription}>
        {isScanning 
          ? `Scanning via ${selectedMode}...` 
          : discoveredMembers.length > 0
            ? `${discoveredMembers.length} members found nearby!`
            : 'Ready to scan for nearby AA members.'}
      </Text>
      
      {isScanning ? (
        <View style={styles.scanningContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.scanningText}>
            Scanning for nearby AA members...
          </Text>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={stopScanning}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : discoveredMembers.length > 0 ? (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Discovered Members</Text>
          
          <View style={styles.membersList}>
            {discoveredMembers.map((member, index) => (
              <View key={member.deviceId} style={styles.memberItem}>
                <View style={styles.memberAvatar}>
                  <Icon name="user" size={20} color="#fff" />
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberMeta}>
                    Discovered via {member.discoveryMethod}
                  </Text>
                </View>
              </View>
            ))}
          </View>
          
          <TouchableOpacity 
            style={styles.nextButton}
            onPress={() => setCurrentStep(3)}
          >
            <Text style={styles.nextButtonText}>Continue</Text>
            <Icon name="arrow-right" size={16} color="#fff" style={styles.nextButtonIcon} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.startScanContainer}>
          <TouchableOpacity 
            style={styles.startScanButton}
            onPress={() => startScanning(selectedMode)}
          >
            <Icon name="search" size={24} color="#fff" style={styles.startScanIcon} />
            <Text style={styles.startScanText}>Start Scanning</Text>
          </TouchableOpacity>
          
          <Text style={styles.privacyNote}>
            Only your first name will be shared with nearby members
          </Text>
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setCurrentStep(1)}
          >
            <Icon name="arrow-left" size={16} color="#7f8c8d" style={styles.backButtonIcon} />
            <Text style={styles.backButtonText}>Change Discovery Mode</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
  
  // Step 3: Save and connect
  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>
        Save Discovered Members
      </Text>
      <Text style={styles.stepDescription}>
        These members have been discovered nearby. Would you like to save them to your contacts?
      </Text>
      
      <View style={styles.resultsContainer}>
        <View style={styles.membersList}>
          {discoveredMembers.map((member, index) => (
            <View key={member.deviceId} style={styles.memberItem}>
              <View style={styles.memberAvatar}>
                <Icon name="user" size={20} color="#fff" />
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberMeta}>
                  Discovered via {member.discoveryMethod}
                </Text>
              </View>
            </View>
          ))}
        </View>
        
        <View style={styles.finalButtons}>
          <TouchableOpacity 
            style={styles.cancelFinalButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelFinalButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.saveFinalButton}
            onPress={saveDiscoveredMembers}
          >
            <Text style={styles.saveFinalButtonText}>Save Contacts</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
  
  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return renderStep1();
    }
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="times" size={20} color="#7f8c8d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Proximity Wizard</Text>
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${(currentStep / 3) * 100}%` }
            ]}
          />
        </View>
        <Text style={styles.progressText}>Step {currentStep} of 3</Text>
      </View>
      
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {renderCurrentStep()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1'
  },
  closeButton: {
    padding: 8
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  placeholder: {
    width: 36  // Same width as close button for balanced header
  },
  progressContainer: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 8
  },
  progressBar: {
    height: 6,
    backgroundColor: '#ecf0f1',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3498db',
    borderRadius: 3
  },
  progressText: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'right'
  },
  container: {
    flex: 1
  },
  contentContainer: {
    padding: 16
  },
  stepContainer: {
    flex: 1
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8
  },
  stepDescription: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 24
  },
  optionsContainer: {
    marginBottom: 24
  },
  modeOption: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  modeOptionSelected: {
    backgroundColor: '#3498db'
  },
  modeIcon: {
    marginBottom: 12
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4
  },
  modeTitleSelected: {
    color: '#fff'
  },
  modeDescription: {
    fontSize: 14,
    color: '#7f8c8d'
  },
  modeDescriptionSelected: {
    color: '#e6f2fb'
  },
  nextButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8
  },
  nextButtonIcon: {
    marginTop: 1
  },
  scanningContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40
  },
  scanningText: {
    marginTop: 16,
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 24
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16
  },
  cancelButtonText: {
    color: '#e74c3c',
    fontWeight: '500'
  },
  startScanContainer: {
    alignItems: 'center',
    marginTop: 20
  },
  startScanButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 16
  },
  startScanIcon: {
    marginRight: 12
  },
  startScanText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  privacyNote: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 24
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  backButtonIcon: {
    marginRight: 8
  },
  backButtonText: {
    color: '#7f8c8d',
    fontWeight: '500'
  },
  resultsContainer: {
    marginTop: 12
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12
  },
  membersList: {
    marginBottom: 24
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  memberInfo: {
    flex: 1
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2
  },
  memberMeta: {
    fontSize: 14,
    color: '#7f8c8d'
  },
  finalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  cancelFinalButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginRight: 8
  },
  cancelFinalButtonText: {
    color: '#7f8c8d',
    fontWeight: '600'
  },
  saveFinalButton: {
    flex: 1,
    backgroundColor: '#27ae60',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginLeft: 8
  },
  saveFinalButtonText: {
    color: '#fff',
    fontWeight: '600'
  }
});

export default ProximityWizardScreen;