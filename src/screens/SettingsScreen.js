import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  SafeAreaView,
  Modal,
  TextInput,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { DatePickerModal } from 'react-native-paper-dates';
import { Provider as PaperProvider } from 'react-native-paper';

import { useUser } from '../contexts/UserContext';
import { calculateSobrietyDays, calculateSobrietyYears } from '../utils/calculations';

const SettingsScreen = () => {
  const { user, updateUserProfile } = useUser();
  
  // State for settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    user?.profileSettings?.notificationsEnabled || false
  );
  const [privacyEnabled, setPrivacyEnabled] = useState(
    user?.profileSettings?.privacyEnabled || true
  );
  const [reminderTime, setReminderTime] = useState(
    user?.profileSettings?.reminderTime || 30
  );
  
  // State for profile editing
  const [showSobrietyDatePicker, setShowSobrietyDatePicker] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [sobrietyDate, setSobrietyDate] = useState(
    user?.sobrietyDate ? new Date(user.sobrietyDate) : new Date()
  );
  
  // State for profile form
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [homeGroup, setHomeGroup] = useState(user?.homeGroup || '');
  
  // Format sobriety information
  const sobrietyDays = user?.sobrietyDate 
    ? calculateSobrietyDays(user.sobrietyDate) 
    : 0;
  
  const sobrietyYears = user?.sobrietyDate 
    ? calculateSobrietyYears(user.sobrietyDate) 
    : 0;
  
  // Handle switching settings
  const handleToggleNotifications = () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    saveSettings({ notificationsEnabled: newValue });
  };
  
  const handleTogglePrivacy = () => {
    const newValue = !privacyEnabled;
    setPrivacyEnabled(newValue);
    saveSettings({ privacyEnabled: newValue });
  };
  
  // Handle changing reminder time
  const handleReminderTimeChange = (value) => {
    setReminderTime(value);
    saveSettings({ reminderTime: value });
  };
  
  // Save settings to database
  const saveSettings = async (settings) => {
    try {
      const currentSettings = user?.profileSettings || {};
      const updatedSettings = { ...currentSettings, ...settings };
      
      await updateUserProfile({
        profileSettings: updatedSettings
      });
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };
  
  // Date handling is now managed through the DatePickerModal's onConfirm
  
  // Handle profile update
  const handleUpdateProfile = async () => {
    try {
      await updateUserProfile({
        name,
        email,
        phone,
        homeGroup
      });
      
      setShowProfileEditor(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>
        
        {/* Profile Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="user" size={18} color="#3498db" />
            <Text style={styles.cardTitle}>Profile</Text>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'AA Member'}</Text>
            {user?.email && (
              <Text style={styles.profileDetail}>{user.email}</Text>
            )}
            {user?.phone && (
              <Text style={styles.profileDetail}>{user.phone}</Text>
            )}
            {user?.homeGroup && (
              <Text style={styles.profileDetail}>Home Group: {user.homeGroup}</Text>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={() => setShowProfileEditor(true)}
          >
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        
        {/* Sobriety Date Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="calendar-check" size={18} color="#27ae60" />
            <Text style={styles.cardTitle}>Sobriety Date</Text>
          </View>
          
          <View style={styles.sobrietyInfo}>
            <Text style={styles.sobrietyDate}>
              {user?.sobrietyDate 
                ? new Date(user.sobrietyDate).toLocaleDateString() 
                : 'Not set'}
            </Text>
            
            {user?.sobrietyDate && (
              <View style={styles.sobrietyCounter}>
                <Text style={styles.sobrietyDays}>{sobrietyDays} days</Text>
                <Text style={styles.sobrietyYears}>({sobrietyYears} years)</Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={() => setShowSobrietyDatePicker(true)}
          >
            <Text style={styles.buttonText}>Change Sobriety Date</Text>
          </TouchableOpacity>
          
          <DatePickerModal
            visible={showSobrietyDatePicker}
            mode="single"
            onDismiss={() => setShowSobrietyDatePicker(false)}
            date={sobrietyDate}
            onConfirm={({ date }) => {
              setShowSobrietyDatePicker(false);
              if (date) {
                setSobrietyDate(date);
                updateUserProfile({
                  sobrietyDate: date
                });
              }
            }}
            saveLabel="Confirm"
            label="Select Sobriety Date"
            maxDate={new Date()}
            locale="en"
          />
        </View>
        
        {/* Notifications Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="bell" size={18} color="#f39c12" />
            <Text style={styles.cardTitle}>Notifications</Text>
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Enable Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive reminders for meetings and recovery activities
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: '#bdc3c7', true: '#3498db' }}
              thumbColor={notificationsEnabled ? '#fff' : '#fff'}
            />
          </View>
          
          <View style={styles.reminderOptions}>
            <Text style={styles.reminderTitle}>Meeting Reminder Time</Text>
            
            <View style={styles.reminderButtons}>
              <TouchableOpacity 
                style={[
                  styles.reminderButton,
                  reminderTime === 15 && styles.reminderButtonActive
                ]}
                onPress={() => handleReminderTimeChange(15)}
              >
                <Text 
                  style={[
                    styles.reminderButtonText,
                    reminderTime === 15 && styles.reminderButtonTextActive
                  ]}
                >
                  15 min
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.reminderButton,
                  reminderTime === 30 && styles.reminderButtonActive
                ]}
                onPress={() => handleReminderTimeChange(30)}
              >
                <Text 
                  style={[
                    styles.reminderButtonText,
                    reminderTime === 30 && styles.reminderButtonTextActive
                  ]}
                >
                  30 min
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.reminderButton,
                  reminderTime === 60 && styles.reminderButtonActive
                ]}
                onPress={() => handleReminderTimeChange(60)}
              >
                <Text 
                  style={[
                    styles.reminderButtonText,
                    reminderTime === 60 && styles.reminderButtonTextActive
                  ]}
                >
                  1 hour
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.reminderButton,
                  reminderTime === 120 && styles.reminderButtonActive
                ]}
                onPress={() => handleReminderTimeChange(120)}
              >
                <Text 
                  style={[
                    styles.reminderButtonText,
                    reminderTime === 120 && styles.reminderButtonTextActive
                  ]}
                >
                  2 hours
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Privacy Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="user-shield" size={18} color="#9b59b6" />
            <Text style={styles.cardTitle}>Privacy</Text>
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Enhanced Privacy Mode</Text>
              <Text style={styles.settingDescription}>
                Limit the information shared with nearby AA members
              </Text>
            </View>
            <Switch
              value={privacyEnabled}
              onValueChange={handleTogglePrivacy}
              trackColor={{ false: '#bdc3c7', true: '#3498db' }}
              thumbColor={privacyEnabled ? '#fff' : '#fff'}
            />
          </View>
        </View>
        
        {/* About Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="info-circle" size={18} color="#3498db" />
            <Text style={styles.cardTitle}>About</Text>
          </View>
          
          <Text style={styles.aboutText}>
            AA Recovery Tracker is designed to help you track your recovery journey
            and maintain your spiritual fitness. All of your data is stored locally
            on your device to ensure your privacy.
          </Text>
          
          <Text style={styles.versionText}>
            Version 1.0.0
          </Text>
        </View>
        
        {/* Profile Editor Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showProfileEditor}
          onRequestClose={() => setShowProfileEditor(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Profile</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowProfileEditor(false)}
                >
                  <Icon name="times" size={20} color="#7f8c8d" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalContent}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                />
                
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Your email"
                  keyboardType="email-address"
                />
                
                <Text style={styles.inputLabel}>Phone</Text>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Your phone number"
                  keyboardType="phone-pad"
                />
                
                <Text style={styles.inputLabel}>Home Group</Text>
                <TextInput
                  style={styles.input}
                  value={homeGroup}
                  onChangeText={setHomeGroup}
                  placeholder="Your home group"
                />
                
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={handleUpdateProfile}
                >
                  <Text style={styles.saveButtonText}>Save Profile</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ScrollView>
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
    marginBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 8
  },
  profileInfo: {
    marginBottom: 16
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4
  },
  profileDetail: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2
  },
  sobrietyInfo: {
    alignItems: 'center',
    marginBottom: 16
  },
  sobrietyDate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 8
  },
  sobrietyCounter: {
    flexDirection: 'row',
    alignItems: 'baseline'
  },
  sobrietyDays: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500'
  },
  sobrietyYears: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 6
  },
  button: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonText: {
    color: '#2c3e50',
    fontWeight: '600'
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  settingInfo: {
    flex: 1,
    paddingRight: 16
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 2
  },
  settingDescription: {
    fontSize: 14,
    color: '#7f8c8d'
  },
  reminderOptions: {
    marginTop: 8
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 12
  },
  reminderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  reminderButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4
  },
  reminderButtonActive: {
    backgroundColor: '#3498db'
  },
  reminderButtonText: {
    color: '#7f8c8d',
    fontSize: 13
  },
  reminderButtonTextActive: {
    color: '#fff',
    fontWeight: '500'
  },
  aboutText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
    marginBottom: 16
  },
  versionText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  closeButton: {
    padding: 4
  },
  modalContent: {
    padding: 16
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 8
  },
  input: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16
  },
  saveButton: {
    backgroundColor: '#27ae60',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  }
});

export default SettingsScreen;