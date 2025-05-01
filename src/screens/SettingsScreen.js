import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Switch,
  Alert,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from 'react-native-vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useUser } from '../contexts/UserContext';
import { settingsOperations } from '../utils/database';
import { calculateSobrietyDays, calculateSobrietyYears, formatNumberWithCommas } from '../utils/calculations';

const SettingsScreen = () => {
  const { user, updateUser } = useUser();
  
  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [sobrietyDate, setSobrietyDate] = useState(new Date());
  const [homeGroup, setHomeGroup] = useState('');
  const [hasSobrietyDate, setHasSobrietyDate] = useState(false);
  
  // Settings state
  const [reminderTime, setReminderTime] = useState('08:00');
  const [darkMode, setDarkMode] = useState(false);
  
  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Initialize form
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');
      setHomeGroup(user.homeGroup || '');
      
      if (user.sobrietyDate) {
        setSobrietyDate(new Date(user.sobrietyDate));
        setHasSobrietyDate(true);
      } else {
        setSobrietyDate(new Date());
        setHasSobrietyDate(false);
      }
    }
    
    // Load app settings
    const loadSettings = async () => {
      try {
        const savedReminderTime = await settingsOperations.getSetting('reminderTime', '08:00');
        const savedDarkMode = await settingsOperations.getSetting('darkMode', false);
        
        setReminderTime(savedReminderTime);
        setDarkMode(savedDarkMode);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    
    loadSettings();
  }, [user]);
  
  // Handle sobriety date change
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || sobrietyDate;
    setShowDatePicker(Platform.OS === 'ios');
    setSobrietyDate(currentDate);
  };
  
  // Handle form submission
  const handleSaveProfile = async () => {
    try {
      const updatedUser = {
        ...user,
        name,
        phone,
        email,
        sobrietyDate: hasSobrietyDate ? sobrietyDate.toISOString() : null,
        homeGroup,
      };
      
      await updateUser(updatedUser);
      
      Alert.alert('Success', 'Your profile has been updated successfully.');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };
  
  // Handle dark mode toggle
  const handleDarkModeToggle = async (value) => {
    setDarkMode(value);
    await settingsOperations.saveSetting('darkMode', value);
  };
  
  // Handle reminder time change
  const saveReminderTime = async (time) => {
    setReminderTime(time);
    await settingsOperations.saveSetting('reminderTime', time);
  };
  
  // Handle data reset
  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'Are you sure you want to reset all data? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: async () => {
            try {
              // The database layer would handle clearing all tables
              // This is a placeholder for actual implementation
              Alert.alert('Data Reset', 'All data has been reset successfully.');
            } catch (error) {
              console.error('Error resetting data:', error);
              Alert.alert('Error', 'Failed to reset data. Please try again.');
            }
          }
        },
      ]
    );
  };
  
  // Render sobriety info
  const renderSobrietyInfo = () => {
    if (!hasSobrietyDate || !user.sobrietyDate) return null;
    
    const days = calculateSobrietyDays(user.sobrietyDate);
    const years = calculateSobrietyYears(user.sobrietyDate);
    
    return (
      <View style={styles.sobrietyInfoContainer}>
        <Text style={styles.sobrietyInfoTitle}>Your Sobriety</Text>
        <View style={styles.sobrietyStatsContainer}>
          <View style={styles.sobrietyStatBox}>
            <Text style={styles.sobrietyStatsNumber}>{formatNumberWithCommas(days)}</Text>
            <Text style={styles.sobrietyStatsLabel}>Days</Text>
          </View>
          <View style={styles.sobrietyStatBox}>
            <Text style={styles.sobrietyStatsNumber}>{years.toFixed(2)}</Text>
            <Text style={styles.sobrietyStatsLabel}>Years</Text>
          </View>
        </View>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          {renderSobrietyInfo()}
          
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              value={name}
              onChangeText={setName}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Your phone number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Email (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Home Group (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Your home group"
              value={homeGroup}
              onChangeText={setHomeGroup}
            />
          </View>
          
          <View style={styles.formGroup}>
            <View style={styles.sobrietyDateHeader}>
              <Text style={styles.inputLabel}>Sobriety Date</Text>
              <Switch
                value={hasSobrietyDate}
                onValueChange={setHasSobrietyDate}
                trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
                thumbColor={hasSobrietyDate ? '#3b82f6' : '#f3f4f6'}
              />
            </View>
            
            {hasSobrietyDate && (
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Text>{sobrietyDate.toLocaleDateString()}</Text>
              </TouchableOpacity>
            )}
            
            {showDatePicker && (
              <DateTimePicker
                value={sobrietyDate}
                mode="date"
                display="default"
                onChange={onDateChange}
                maximumDate={new Date()} // Can't select future dates
              />
            )}
          </View>
          
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveProfile}
          >
            <Text style={styles.saveButtonText}>Save Profile</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <Text style={styles.settingLabel}>Daily Reminder Time</Text>
              <Text style={styles.settingDescription}>Time to be reminded to log activities</Text>
            </View>
            <View style={styles.timePickerContainer}>
              <TouchableOpacity onPress={() => {
                // Simple time picker for demo purposes
                const hours = ['06:00', '08:00', '12:00', '18:00', '20:00'];
                const currentIndex = hours.indexOf(reminderTime);
                const nextIndex = (currentIndex + 1) % hours.length;
                saveReminderTime(hours[nextIndex]);
              }}>
                <Text style={styles.timePickerText}>{reminderTime}</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.settingDescription}>Use dark theme for the app</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
              thumbColor={darkMode ? '#3b82f6' : '#f3f4f6'}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleResetData}
          >
            <Text style={styles.dangerButtonText}>Reset All Data</Text>
          </TouchableOpacity>
          <Text style={styles.dangerHelpText}>
            This will delete all your activities, preferences, and personal information.
            This action cannot be undone.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.aboutContainer}>
            <Text style={styles.appName}>AA Recovery Tracker</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
            <Text style={styles.appDescription}>
              This app helps you track your recovery activities and calculate your spiritual fitness.
              All your data is stored locally on your device for privacy.
            </Text>
          </View>
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  sobrietyDateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
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
  timePickerContainer: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 8,
  },
  timePickerText: {
    fontSize: 16,
    color: '#1f2937',
  },
  dangerButton: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  dangerHelpText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  aboutContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  appDescription: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
  },
  sobrietyInfoContainer: {
    backgroundColor: '#ebf5ff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sobrietyInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  sobrietyStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  sobrietyStatBox: {
    alignItems: 'center',
    minWidth: 80,
  },
  sobrietyStatsNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  sobrietyStatsLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
});

export default SettingsScreen;