import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Icon from 'react-native-vector-icons/FontAwesome';

/**
 * ProximityWizard component guides users through the process of
 * connecting with nearby AA members
 */
export default function ProximityWizard({ onClose, navigation, member }) {
  const { theme } = useTheme();
  const [step, setStep] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [selectedMember] = useState(member || {
    id: 1,
    username: 'John S.',
    distance: 0.3,
    sobrietyYears: 5.2
  });
  
  // Reset state when component mounts
  useEffect(() => {
    return () => {
      // Clean up any connections when component unmounts
    };
  }, []);
  
  const startWizard = () => {
    setStep(2);
    simulateScanning();
  };
  
  const simulateScanning = () => {
    setIsSearching(true);
    // Simulate Bluetooth/WiFi scanning for 3 seconds
    setTimeout(() => {
      setIsSearching(false);
      setIsConnected(true);
      setStep(3);
    }, 3000);
  };
  
  const finishWizard = () => {
    // In a real app, this would save the connection
    if (onClose) {
      onClose();
    } else {
      navigation.goBack();
    }
  };
  
  const cancelWizard = () => {
    if (onClose) {
      onClose();
    } else {
      navigation.goBack();
    }
  };
  
  const retryConnection = () => {
    setConnectionError(null);
    simulateScanning();
  };
  
  const themedStyles = {
    container: {
      backgroundColor: theme.cardBackground,
      borderColor: theme.border,
    },
    title: {
      color: theme.text,
    },
    subtitle: {
      color: theme.textSecondary,
    },
    memberName: {
      color: theme.text,
    },
    memberDetail: {
      color: theme.textSecondary,
    },
    progressBar: {
      backgroundColor: theme.isDark ? '#333333' : '#e0e0e0',
    },
    progressFill: {
      backgroundColor: theme.primary,
    },
    stepIndicator: {
      backgroundColor: theme.isDark ? '#333333' : '#e0e0e0',
    },
    stepIndicatorActive: {
      backgroundColor: theme.primary,
    },
    actionButton: {
      backgroundColor: theme.primary,
    },
    cancelButton: {
      backgroundColor: 'transparent',
      borderColor: theme.border,
    },
    cancelButtonText: {
      color: theme.textSecondary,
    },
    errorText: {
      color: theme.error,
    },
    errorContainer: {
      backgroundColor: theme.errorBackground,
      borderColor: theme.error,
    }
  };
  
  const renderStepContent = () => {
    switch(step) {
      case 1:
        return (
          <View>
            <Text style={[styles.title, themedStyles.title]}>Connect with AA Member</Text>
            <Text style={[styles.subtitle, themedStyles.subtitle]}>
              You're about to connect with:
            </Text>
            
            <View style={styles.memberCard}>
              <View style={styles.memberInfo}>
                <Text style={[styles.memberName, themedStyles.memberName]}>
                  {selectedMember.username}
                </Text>
                <Text style={[styles.memberDetail, themedStyles.memberDetail]}>
                  <Icon name="map-marker" size={14} /> {selectedMember.distance} miles away
                </Text>
                <Text style={[styles.memberDetail, themedStyles.memberDetail]}>
                  <Icon name="calendar" size={14} /> {selectedMember.sobrietyYears.toFixed(1)} years sober
                </Text>
              </View>
            </View>
            
            <Text style={[styles.instructionText, themedStyles.subtitle]}>
              To connect, both of you need to:
            </Text>
            
            <View style={styles.instructionList}>
              <View style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>1</Text>
                </View>
                <Text style={[styles.instructionDetail, themedStyles.subtitle]}>
                  Be within about 30 feet of each other
                </Text>
              </View>
              
              <View style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>2</Text>
                </View>
                <Text style={[styles.instructionDetail, themedStyles.subtitle]}>
                  Have WiFi and Bluetooth turned on
                </Text>
              </View>
              
              <View style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>3</Text>
                </View>
                <Text style={[styles.instructionDetail, themedStyles.subtitle]}>
                  Both start the connection wizard
                </Text>
              </View>
            </View>
            
            <Text style={[styles.privacyText, themedStyles.subtitle]}>
              Your contact information is only shared after both parties confirm the connection.
            </Text>
          </View>
        );
      
      case 2:
        return (
          <View>
            <Text style={[styles.title, themedStyles.title]}>Searching for Member</Text>
            <Text style={[styles.subtitle, themedStyles.subtitle]}>
              Looking for {selectedMember.username} nearby...
            </Text>
            
            {isSearching && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} style={styles.loadingIndicator} />
                <Text style={[styles.loadingText, themedStyles.subtitle]}>
                  Scanning for nearby device...
                </Text>
                <Text style={[styles.tipText, themedStyles.subtitle]}>
                  Make sure you're within 30 feet of each other
                </Text>
              </View>
            )}
            
            {connectionError && (
              <View style={[styles.errorContainer, themedStyles.errorContainer]}>
                <Icon name="exclamation-triangle" size={20} color={theme.error} style={styles.errorIcon} />
                <Text style={[styles.errorText, themedStyles.errorText]}>
                  {connectionError}
                </Text>
              </View>
            )}
          </View>
        );
      
      case 3:
        return (
          <View>
            <Text style={[styles.title, themedStyles.title]}>Connection Successful!</Text>
            <Text style={[styles.subtitle, themedStyles.subtitle]}>
              You are now connected with {selectedMember.username}
            </Text>
            
            <View style={styles.successIconContainer}>
              <Icon name="check-circle" size={80} color={theme.success} style={styles.successIcon} />
            </View>
            
            <View style={styles.connectionDetails}>
              <Text style={[styles.detailLabel, themedStyles.subtitle]}>
                Member:
              </Text>
              <Text style={[styles.detailValue, themedStyles.memberName]}>
                {selectedMember.username}
              </Text>
            </View>
            
            <View style={styles.connectionDetails}>
              <Text style={[styles.detailLabel, themedStyles.subtitle]}>
                Connected:
              </Text>
              <Text style={[styles.detailValue, themedStyles.memberName]}>
                {new Date().toLocaleTimeString()}
              </Text>
            </View>
            
            <Text style={[styles.nextStepsText, themedStyles.subtitle]}>
              You can now message each other, share meeting information, or arrange to meet up.
            </Text>
          </View>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <View style={[styles.container, themedStyles.container]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Progress indicator */}
        <View style={styles.stepIndicatorContainer}>
          <View style={[styles.stepIndicator, themedStyles.stepIndicator, step >= 1 && themedStyles.stepIndicatorActive]} />
          <View style={[styles.stepConnector, themedStyles.progressBar]}>
            <View 
              style={[
                themedStyles.progressFill, 
                { 
                  width: step === 1 ? '0%' : step === 2 ? '50%' : '100%'
                }
              ]} 
            />
          </View>
          <View style={[styles.stepIndicator, themedStyles.stepIndicator, step >= 2 && themedStyles.stepIndicatorActive]} />
          <View style={[styles.stepConnector, themedStyles.progressBar]}>
            <View 
              style={[
                themedStyles.progressFill, 
                { 
                  width: step === 3 ? '100%' : '0%'
                }
              ]} 
            />
          </View>
          <View style={[styles.stepIndicator, themedStyles.stepIndicator, step >= 3 && themedStyles.stepIndicatorActive]} />
        </View>
        
        {/* Current step content */}
        <View style={styles.contentContainer}>
          {renderStepContent()}
        </View>
        
        {/* Action buttons */}
        <View style={styles.buttonsContainer}>
          {step === 1 && (
            <>
              <TouchableOpacity 
                style={[styles.actionButton, themedStyles.actionButton]}
                onPress={startWizard}
              >
                <Text style={styles.actionButtonText}>Start Connection</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.cancelButton, themedStyles.cancelButton]}
                onPress={cancelWizard}
              >
                <Text style={[styles.cancelButtonText, themedStyles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
          
          {step === 2 && (
            <TouchableOpacity 
              style={[styles.cancelButton, themedStyles.cancelButton]}
              onPress={cancelWizard}
              disabled={isSearching && !connectionError}
            >
              <Text style={[styles.cancelButtonText, themedStyles.cancelButtonText]}>
                {connectionError ? 'Go Back' : 'Cancel'}
              </Text>
            </TouchableOpacity>
          )}
          
          {connectionError && (
            <TouchableOpacity 
              style={[styles.actionButton, themedStyles.actionButton]}
              onPress={retryConnection}
            >
              <Text style={styles.actionButtonText}>Retry</Text>
            </TouchableOpacity>
          )}
          
          {step === 3 && (
            <TouchableOpacity 
              style={[styles.actionButton, themedStyles.actionButton]}
              onPress={finishWizard}
            >
              <Text style={styles.actionButtonText}>Continue</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  scrollContainer: {
    padding: 20,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  stepIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepConnector: {
    height: 4,
    flex: 1,
    marginHorizontal: 5,
    position: 'relative',
  },
  contentContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  memberCard: {
    marginTop: 10,
    marginBottom: 20,
    padding: 15,
    alignItems: 'center',
  },
  memberInfo: {
    alignItems: 'center',
  },
  memberName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  memberDetail: {
    fontSize: 14,
    marginBottom: 3,
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 15,
  },
  instructionList: {
    marginBottom: 20,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4F86C6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  instructionNumberText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  instructionDetail: {
    fontSize: 14,
    flex: 1,
  },
  privacyText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  loadingIndicator: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: '80%',
  },
  successIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
  },
  connectionDetails: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  detailLabel: {
    width: 100,
    fontSize: 16,
  },
  detailValue: {
    flex: 1,
    fontSize: 16,
  },
  nextStepsText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 20,
  },
  buttonsContainer: {
    marginTop: 10,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 20,
  },
  errorIcon: {
    marginRight: 10,
  },
  errorText: {
    fontSize: 14,
    flex: 1,
  },
});