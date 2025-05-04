import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const WIZARD_STEPS = [
  {
    id: 'intro',
    title: 'Connect with a Nearby Member',
    content: 'This wizard will help you safely connect with another AA member nearby.',
  },
  {
    id: 'method',
    title: 'Choose Connection Method',
    content: 'How would you like to connect with this member?',
  },
  {
    id: 'message',
    title: 'Add a Brief Message',
    content: 'You can include a short message with your connection request.',
  },
  {
    id: 'confirm',
    title: 'Review and Confirm',
    content: 'Review your connection request details before sending.',
  }
];

export default function ProximityWizard({ onClose, navigation }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [connectionMethod, setConnectionMethod] = useState(null);
  const [message, setMessage] = useState('');
  
  const step = WIZARD_STEPS[currentStep];
  
  const handleNext = () => {
    if (currentStep === 1 && !connectionMethod) {
      Alert.alert('Please Select', 'Please select a connection method to continue.');
      return;
    }
    
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSendRequest();
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onClose();
    }
  };
  
  const handleSendRequest = () => {
    // In a real app, this would actually send the connection request
    Alert.alert(
      'Connection Request Sent',
      'Your connection request has been sent. You\'ll be notified when they respond.',
      [{ text: 'OK', onPress: onClose }]
    );
  };
  
  const callMember = () => {
    // Simulate calling the member
    Linking.openURL('tel:5555555555');
  };
  
  const renderStepContent = () => {
    switch (step.id) {
      case 'intro':
        return (
          <View style={styles.stepContent}>
            <MaterialCommunityIcons name="account-group" size={60} color="#4a86e8" />
            <Text style={styles.stepDescription}>
              Connecting with another member in-person can strengthen your recovery. 
              This process maintains your privacy while helping you reach out.
            </Text>
          </View>
        );
        
      case 'method':
        return (
          <View style={styles.stepContent}>
            <TouchableOpacity
              style={[
                styles.methodOption,
                connectionMethod === 'phone' && styles.methodSelected
              ]}
              onPress={() => setConnectionMethod('phone')}
            >
              <MaterialCommunityIcons name="phone" size={30} color={connectionMethod === 'phone' ? 'white' : '#4a86e8'} />
              <Text style={[styles.methodText, connectionMethod === 'phone' && styles.methodTextSelected]}>
                Phone Call
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.methodOption,
                connectionMethod === 'message' && styles.methodSelected
              ]}
              onPress={() => setConnectionMethod('message')}
            >
              <MaterialCommunityIcons name="message-text" size={30} color={connectionMethod === 'message' ? 'white' : '#4a86e8'} />
              <Text style={[styles.methodText, connectionMethod === 'message' && styles.methodTextSelected]}>
                In-App Message
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.methodOption,
                connectionMethod === 'inperson' && styles.methodSelected
              ]}
              onPress={() => setConnectionMethod('inperson')}
            >
              <MaterialCommunityIcons name="handshake" size={30} color={connectionMethod === 'inperson' ? 'white' : '#4a86e8'} />
              <Text style={[styles.methodText, connectionMethod === 'inperson' && styles.methodTextSelected]}>
                In-Person Meeting
              </Text>
            </TouchableOpacity>
          </View>
        );
        
      case 'message':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepDescription}>
              Add a brief message to introduce yourself:
            </Text>
            <TextInput
              style={styles.messageInput}
              value={message}
              onChangeText={setMessage}
              placeholder="e.g., Hi, I'm new to the area and looking to connect with local members."
              multiline
              numberOfLines={4}
            />
            <Text style={styles.privacyNote}>
              Note: For safety and anonymity, avoid sharing personal details like your full name, 
              address, or other identifying information.
            </Text>
          </View>
        );
        
      case 'confirm':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.confirmLabel}>Connection Method:</Text>
            <Text style={styles.confirmValue}>
              {connectionMethod === 'phone' ? 'Phone Call' : 
               connectionMethod === 'message' ? 'In-App Message' : 'In-Person Meeting'}
            </Text>
            
            <Text style={styles.confirmLabel}>Your Message:</Text>
            <Text style={styles.confirmValue}>
              {message || '(No message included)'}
            </Text>
            
            <Text style={styles.privacyNote}>
              By sending this request, you agree to share your first name and sobriety 
              information with this member, according to your privacy settings.
            </Text>
          </View>
        );
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepIndicator}>Step {currentStep + 1} of {WIZARD_STEPS.length}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <MaterialCommunityIcons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.title}>{step.title}</Text>
      
      {renderStepContent()}
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <Text style={styles.backButtonText}>
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === WIZARD_STEPS.length - 1 ? 'Send Request' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Direct actions */}
      {connectionMethod === 'phone' && currentStep === WIZARD_STEPS.length - 1 && (
        <TouchableOpacity 
          style={styles.directActionButton}
          onPress={callMember}
        >
          <MaterialCommunityIcons name="phone" size={20} color="white" />
          <Text style={styles.directActionText}>Call Now</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepIndicator: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    padding: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  stepContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  stepDescription: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 20,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4a86e8',
    backgroundColor: 'white',
  },
  methodSelected: {
    backgroundColor: '#4a86e8',
  },
  methodText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4a86e8',
    marginLeft: 15,
  },
  methodTextSelected: {
    color: 'white',
  },
  messageInput: {
    width: '100%',
    height: 120,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginVertical: 20,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  privacyNote: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 15,
  },
  confirmLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 5,
    width: '100%',
    marginTop: 15,
  },
  confirmValue: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
    width: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  backButton: {
    flex: 1,
    padding: 15,
    marginRight: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 16,
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#4a86e8',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  directActionButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  directActionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
});