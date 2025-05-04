import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';

// Only import DateTimePicker on native platforms
let DateTimePicker;
if (Platform.OS !== 'web') {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

function SettingsScreen() {
  const { user, updateUser } = useUser();
  const { isDark, theme, toggleTheme } = useTheme();
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    sobrietyDate: user?.sobrietyDate ? new Date(user.sobrietyDate) : new Date(),
    homeGroup: user?.homeGroup || '',
    phoneNumber: user?.phoneNumber || '',
    sponsorName: user?.sponsorName || '',
    sponsorPhone: user?.sponsorPhone || '',
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({
    shareLocation: user?.privacySettings?.shareLocation || false,
    shareFullName: user?.privacySettings?.shareFullName || false,
    shareSobrietyDate: user?.privacySettings?.shareSobrietyDate || true,
    allowBluetoothDiscovery: user?.privacySettings?.allowBluetoothDiscovery || false,
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    meetingReminders: user?.notificationSettings?.meetingReminders || true,
    dailyReflection: user?.notificationSettings?.dailyReflection || false,
    sobrietyMilestones: user?.notificationSettings?.sobrietyMilestones || true,
    reminderTime: user?.notificationSettings?.reminderTime || 30, // minutes before meeting
  });

  const handleSaveProfile = () => {
    // Validate
    if (!profile.firstName) {
      Alert.alert('Missing Information', 'Please enter your first name');
      return;
    }

    // Update user profile
    updateUser({
      ...profile,
      privacySettings,
      notificationSettings,
    });

    setEditing(false);
    Alert.alert('Success', 'Your profile has been updated');
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setProfile({...profile, sobrietyDate: selectedDate});
    }
  };
  
  // For web date picker
  const [webDate, setWebDate] = useState({
    day: profile.sobrietyDate.getDate().toString(),
    month: (profile.sobrietyDate.getMonth() + 1).toString(),
    year: profile.sobrietyDate.getFullYear().toString()
  });
  
  // Format phone number as (xxx) yyy-zzzz
  const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return '';
    
    // Remove all non-numeric characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Format based on length
    if (cleaned.length === 0) {
      return '';
    } else if (cleaned.length <= 3) {
      return `(${cleaned}`;
    } else if (cleaned.length <= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
  };
  
  // Update webDate when profile.sobrietyDate changes (initialization)
  useEffect(() => {
    if (profile.sobrietyDate) {
      setWebDate({
        day: profile.sobrietyDate.getDate().toString(),
        month: (profile.sobrietyDate.getMonth() + 1).toString(),
        year: profile.sobrietyDate.getFullYear().toString()
      });
    }
  }, []);
  
  const updateSobrietyDateFromWeb = () => {
    const day = parseInt(webDate.day, 10);
    const month = parseInt(webDate.month, 10) - 1; // JS months are 0-indexed
    const year = parseInt(webDate.year, 10);
    
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      const newDate = new Date(year, month, day);
      if (!isNaN(newDate.getTime())) {
        setProfile({...profile, sobrietyDate: newDate});
      }
    }
  };
  
  // When any part of the web date changes, update the sobriety date
  useEffect(() => {
    updateSobrietyDateFromWeb();
  }, [webDate]);
  
  // Generate arrays for days, months and years for the dropdowns
  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  };
  
  const days = Array.from(
    { length: getDaysInMonth(parseInt(webDate.month), parseInt(webDate.year)) }, 
    (_, i) => (i + 1).toString()
  );
  
  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];
  
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: 100 }, 
    (_, i) => (currentYear - i).toString()
  );

  const reminderOptions = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 120, label: '2 hours' },
  ];

  // Apply theme to styles
  const themedStyles = {
    container: {
      ...styles.container,
      backgroundColor: theme.background,
    },
    card: {
      ...styles.card,
      backgroundColor: theme.card,
      ...theme.shadow,
    },
    cardTitle: {
      ...styles.cardTitle,
      color: theme.text,
    },
    profileName: {
      ...styles.profileName,
      color: theme.text,
    },
    profileDetail: {
      ...styles.profileDetail,
      color: theme.textSecondary,
    },
    label: {
      ...styles.label,
      color: theme.textSecondary,
    },
    input: {
      ...styles.input,
      backgroundColor: theme.card,
      borderColor: theme.border,
      color: theme.text,
    },
    settingLabel: {
      ...styles.settingLabel,
      color: theme.text,
    },
    settingDescription: {
      ...styles.settingDescription,
      color: theme.textSecondary,
    },
    infoText: {
      ...styles.infoText,
      color: theme.textSecondary,
    },
    webDatePickerLabel: {
      ...styles.webDatePickerLabel,
      color: theme.textSecondary,
    },
    supportButton: {
      ...styles.supportButton,
      backgroundColor: isDark ? '#333333' : '#f0f0f0',
    },
    supportButtonText: {
      ...styles.supportButtonText,
      color: theme.text,
    },
    dateButtonText: {
      ...styles.dateButtonText,
      color: theme.text,
    },
    dateButton: {
      ...styles.dateButton,
      backgroundColor: theme.card,
      borderColor: theme.border,
    },
    dateHelpText: {
      ...styles.dateHelpText,
      color: theme.textSecondary,
    },
    webDatePickerSelect: {
      ...styles.webDatePickerSelect,
      backgroundColor: theme.card,
      borderColor: theme.border,
    },
    cancelButton: {
      ...styles.cancelButton,
      borderColor: theme.border,
    },
    cancelButtonText: {
      ...styles.cancelButtonText,
      color: theme.textSecondary,
    },
    settingRow: {
      ...styles.settingRow,
      borderBottomColor: theme.divider,
    },
  };

  return (
    <ScrollView style={themedStyles.container}>
      <View style={themedStyles.card}>
        <View style={styles.cardHeader}>
          <Text style={themedStyles.cardTitle}>My Profile</Text>
          {!editing && (
            <TouchableOpacity onPress={() => setEditing(true)}>
              <MaterialCommunityIcons name="pencil" size={22} color="#4a86e8" />
            </TouchableOpacity>
          )}
        </View>
        
        {editing ? (
          <View style={styles.editForm}>
            <Text style={styles.label}>First Name *</Text>
            <TextInput
              style={styles.input}
              value={profile.firstName}
              onChangeText={(text) => setProfile({...profile, firstName: text})}
              placeholder="Enter your first name"
            />
            
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={profile.lastName}
              onChangeText={(text) => setProfile({...profile, lastName: text})}
              placeholder="Enter your last name"
            />
            
            <Text style={styles.label}>Sobriety Date</Text>
            
            {Platform.OS === 'web' ? (
              <View>
                <View style={styles.webDatePickerContainer}>
                  {/* Month dropdown */}
                  <View style={styles.webDatePickerItem}>
                    <Text style={styles.webDatePickerLabel}>Month</Text>
                    <View style={styles.webDatePickerSelect}>
                      <select
                        value={webDate.month}
                        onChange={(e) => setWebDate({...webDate, month: e.target.value})}
                        style={styles.webDateDropdown}
                      >
                        {months.map(month => (
                          <option key={month.value} value={month.value}>{month.label}</option>
                        ))}
                      </select>
                    </View>
                  </View>
                  
                  {/* Day dropdown */}
                  <View style={styles.webDatePickerItem}>
                    <Text style={styles.webDatePickerLabel}>Day</Text>
                    <View style={styles.webDatePickerSelect}>
                      <select
                        value={webDate.day}
                        onChange={(e) => setWebDate({...webDate, day: e.target.value})}
                        style={styles.webDateDropdown}
                      >
                        {days.map(day => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                    </View>
                  </View>
                  
                  {/* Year dropdown */}
                  <View style={styles.webDatePickerItem}>
                    <Text style={styles.webDatePickerLabel}>Year</Text>
                    <View style={styles.webDatePickerSelect}>
                      <select
                        value={webDate.year}
                        onChange={(e) => setWebDate({...webDate, year: e.target.value})}
                        style={styles.webDateDropdown}
                      >
                        {years.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </View>
                  </View>
                </View>
                <Text style={styles.dateHelpText}>
                  Your sobriety date: {profile.sobrietyDate.toLocaleDateString()}
                </Text>
              </View>
            ) : (
              <>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    {profile.sobrietyDate.toLocaleDateString()}
                  </Text>
                  <MaterialCommunityIcons name="calendar" size={20} color="#4a86e8" />
                </TouchableOpacity>
                
                {showDatePicker && (
                  <DateTimePicker
                    value={profile.sobrietyDate}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                  />
                )}
              </>
            )}
            
            <Text style={styles.label}>Home Group</Text>
            <TextInput
              style={styles.input}
              value={profile.homeGroup}
              onChangeText={(text) => setProfile({...profile, homeGroup: text})}
              placeholder="Enter your home group"
            />
            
            <Text style={styles.label}>Your Phone Number</Text>
            <TextInput
              style={styles.input}
              value={formatPhoneNumber(profile.phoneNumber)}
              onChangeText={(text) => setProfile({...profile, phoneNumber: text})}
              placeholder="(555) 555-5555"
              keyboardType="phone-pad"
            />
            
            <Text style={styles.label}>Sponsor Name</Text>
            <TextInput
              style={styles.input}
              value={profile.sponsorName}
              onChangeText={(text) => setProfile({...profile, sponsorName: text})}
              placeholder="Enter your sponsor's name"
            />
            
            <Text style={styles.label}>Sponsor Phone</Text>
            <TextInput
              style={styles.input}
              value={formatPhoneNumber(profile.sponsorPhone)}
              onChangeText={(text) => setProfile({...profile, sponsorPhone: text})}
              placeholder="(555) 555-5555"
              keyboardType="phone-pad"
            />
            
            <View style={styles.editButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setEditing(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {profile.firstName} {profile.lastName}
            </Text>
            <Text style={styles.profileDetail}>
              Sobriety Date: {profile.sobrietyDate.toLocaleDateString()}
            </Text>
            {profile.homeGroup && (
              <Text style={styles.profileDetail}>
                Home Group: {profile.homeGroup}
              </Text>
            )}
            {profile.phoneNumber && (
              <Text style={styles.profileDetail}>
                Phone: {formatPhoneNumber(profile.phoneNumber)}
              </Text>
            )}
            {profile.sponsorName && (
              <Text style={styles.profileDetail}>
                Sponsor: {profile.sponsorName}
              </Text>
            )}
            {profile.sponsorPhone && (
              <Text style={styles.profileDetail}>
                Sponsor Phone: {formatPhoneNumber(profile.sponsorPhone)}
              </Text>
            )}
          </View>
        )}
      </View>
      
      <View style={themedStyles.card}>
        <Text style={themedStyles.cardTitle}>Privacy Settings</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingLabel}>Share Location for Meetings</Text>
            <Text style={styles.settingDescription}>
              Allow the app to use your location to find nearby meetings
            </Text>
          </View>
          <Switch
            value={privacySettings.shareLocation}
            onValueChange={(value) => 
              setPrivacySettings({...privacySettings, shareLocation: value})
            }
            trackColor={{ false: '#ccc', true: '#90caf9' }}
            thumbColor={privacySettings.shareLocation ? '#4a86e8' : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingLabel}>Share Full Name</Text>
            <Text style={styles.settingDescription}>
              Show your last name to other AA members
            </Text>
          </View>
          <Switch
            value={privacySettings.shareFullName}
            onValueChange={(value) => 
              setPrivacySettings({...privacySettings, shareFullName: value})
            }
            trackColor={{ false: '#ccc', true: '#90caf9' }}
            thumbColor={privacySettings.shareFullName ? '#4a86e8' : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingLabel}>Share Sobriety Date</Text>
            <Text style={styles.settingDescription}>
              Allow other members to see your sobriety date
            </Text>
          </View>
          <Switch
            value={privacySettings.shareSobrietyDate}
            onValueChange={(value) => 
              setPrivacySettings({...privacySettings, shareSobrietyDate: value})
            }
            trackColor={{ false: '#ccc', true: '#90caf9' }}
            thumbColor={privacySettings.shareSobrietyDate ? '#4a86e8' : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingLabel}>Allow Bluetooth Discovery</Text>
            <Text style={styles.settingDescription}>
              Enable more precise discovery of nearby members
            </Text>
          </View>
          <Switch
            value={privacySettings.allowBluetoothDiscovery}
            onValueChange={(value) => 
              setPrivacySettings({...privacySettings, allowBluetoothDiscovery: value})
            }
            trackColor={{ false: '#ccc', true: '#90caf9' }}
            thumbColor={privacySettings.allowBluetoothDiscovery ? '#4a86e8' : '#f4f3f4'}
          />
        </View>
      </View>
      
      <View style={themedStyles.card}>
        <Text style={themedStyles.cardTitle}>Notification Settings</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingLabel}>Meeting Reminders</Text>
            <Text style={styles.settingDescription}>
              Get notified before your scheduled meetings
            </Text>
          </View>
          <Switch
            value={notificationSettings.meetingReminders}
            onValueChange={(value) => 
              setNotificationSettings({...notificationSettings, meetingReminders: value})
            }
            trackColor={{ false: '#ccc', true: '#90caf9' }}
            thumbColor={notificationSettings.meetingReminders ? '#4a86e8' : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingLabel}>Daily Reflection</Text>
            <Text style={styles.settingDescription}>
              Receive a daily recovery reflection
            </Text>
          </View>
          <Switch
            value={notificationSettings.dailyReflection}
            onValueChange={(value) => 
              setNotificationSettings({...notificationSettings, dailyReflection: value})
            }
            trackColor={{ false: '#ccc', true: '#90caf9' }}
            thumbColor={notificationSettings.dailyReflection ? '#4a86e8' : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingLabel}>Sobriety Milestones</Text>
            <Text style={styles.settingDescription}>
              Get notified of sobriety milestones
            </Text>
          </View>
          <Switch
            value={notificationSettings.sobrietyMilestones}
            onValueChange={(value) => 
              setNotificationSettings({...notificationSettings, sobrietyMilestones: value})
            }
            trackColor={{ false: '#ccc', true: '#90caf9' }}
            thumbColor={notificationSettings.sobrietyMilestones ? '#4a86e8' : '#f4f3f4'}
          />
        </View>
        
        <Text style={styles.label}>Reminder Time Before Meetings</Text>
        <View style={styles.reminderOptions}>
          {reminderOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.reminderOption,
                notificationSettings.reminderTime === option.value && styles.reminderOptionSelected
              ]}
              onPress={() => 
                setNotificationSettings({...notificationSettings, reminderTime: option.value})
              }
            >
              <Text 
                style={[
                  styles.reminderOptionText,
                  notificationSettings.reminderTime === option.value && styles.reminderOptionTextSelected
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={themedStyles.card}>
        <Text style={themedStyles.cardTitle}>Display Settings</Text>
        
        <View style={themedStyles.settingRow}>
          <View style={styles.settingTextContainer}>
            <Text style={themedStyles.settingLabel}>Dark Mode</Text>
            <Text style={themedStyles.settingDescription}>
              Switch between light and dark theme
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#ccc', true: '#90caf9' }}
            thumbColor={isDark ? '#4a86e8' : '#f4f3f4'}
          />
        </View>
      </View>
      
      <View style={themedStyles.card}>
        <Text style={themedStyles.cardTitle}>App Information</Text>
        <Text style={themedStyles.infoText}>Version: 1.0.0</Text>
        <Text style={themedStyles.infoText}>
          AA Recovery Tracker is designed to help members of Alcoholics Anonymous 
          track their recovery journey while maintaining anonymity and privacy.
        </Text>
        
        <TouchableOpacity style={themedStyles.supportButton}>
          <Text style={themedStyles.supportButtonText}>Contact Support</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 15,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  editForm: {
    marginTop: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 12,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  dateHelpText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 5,
    marginBottom: 10,
  },
  webDatePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  webDatePickerItem: {
    flex: 1,
    marginHorizontal: 5,
  },
  webDatePickerLabel: {
    fontSize: 12,
    color: '#555',
    marginBottom: 5,
  },
  webDatePickerSelect: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#fff',
    height: 40,
    justifyContent: 'center',
  },
  webDateDropdown: {
    width: '100%',
    height: 36,
    border: 'none',
    backgroundColor: 'transparent',
    paddingHorizontal: 10,
    fontSize: 16,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    marginRight: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#4a86e8',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  profileInfo: {
    marginVertical: 5,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  profileDetail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 3,
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
  },
  reminderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  reminderOption: {
    borderWidth: 1,
    borderColor: '#4a86e8',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 5,
    backgroundColor: 'white',
  },
  reminderOptionSelected: {
    backgroundColor: '#4a86e8',
  },
  reminderOptionText: {
    color: '#4a86e8',
    fontWeight: '500',
    fontSize: 14,
  },
  reminderOptionTextSelected: {
    color: 'white',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginVertical: 5,
  },
  supportButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 15,
  },
  supportButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
});

export default SettingsScreen;