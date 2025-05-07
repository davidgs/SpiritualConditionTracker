import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { ACTIVITY_TYPES } from '../contexts/ActivitiesContext';

function ActivityLogScreen() {
  const { logActivity } = useUser();
  const { theme } = useTheme();
  const [activityType, setActivityType] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Add state for date selection
  const [activityDate, setActivityDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // For web date picker
  const [webDate, setWebDate] = useState({
    day: activityDate.getDate().toString(),
    month: (activityDate.getMonth() + 1).toString(),
    year: activityDate.getFullYear().toString()
  });
  
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
    title: {
      ...styles.title,
      color: theme.text,
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
    activityTypeButton: {
      ...styles.activityTypeButton,
      borderColor: theme.primary,
      backgroundColor: theme.card,
    },
    activityTypeSelected: {
      ...styles.activityTypeSelected,
      backgroundColor: theme.primary,
    },
    activityTypeText: {
      ...styles.activityTypeText,
      color: theme.primary,
    },
    submitButton: {
      ...styles.submitButton,
      backgroundColor: theme.primary,
    },
    infoLabel: {
      ...styles.infoLabel,
      color: theme.text,
    },
    infoDescription: {
      ...styles.infoDescription,
      color: theme.textSecondary,
    },
    dateButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 5,
      padding: 10,
      backgroundColor: theme.card,
      marginBottom: 15,
    },
    dateButtonText: {
      fontSize: 16,
      color: theme.text,
    },
    webDatePickerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 15,
    },
    webDatePickerItem: {
      flex: 1,
      marginHorizontal: 5,
    },
    webDatePickerLabel: {
      fontSize: 12,
      color: theme.textSecondary,
      marginBottom: 5,
    },
    webDatePickerSelect: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 5,
      backgroundColor: theme.card,
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
      color: theme.text,
    },
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setActivityDate(selectedDate);
      
      // Update web date picker values
      setWebDate({
        day: selectedDate.getDate().toString(),
        month: (selectedDate.getMonth() + 1).toString(),
        year: selectedDate.getFullYear().toString()
      });
    }
  };
  
  // Generate arrays for days, months and years for the web dropdowns
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
    { length: 10 }, 
    (_, i) => (currentYear - i).toString()
  );
  
  const updateActivityDateFromWeb = () => {
    const day = parseInt(webDate.day, 10);
    const month = parseInt(webDate.month, 10) - 1; // JS months are 0-indexed
    const year = parseInt(webDate.year, 10);
    
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      const newDate = new Date(year, month, day);
      if (!isNaN(newDate.getTime())) {
        setActivityDate(newDate);
      }
    }
  };
  
  // When any part of the web date changes, update the activity date
  useEffect(() => {
    updateActivityDateFromWeb();
  }, [webDate]);

  const handleSubmit = () => {
    if (!activityType || !duration) {
      return; // Basic validation
    }

    const newActivity = {
      type: activityType,
      duration: parseInt(duration, 10),
      date: activityDate.toISOString(),
      notes: notes || '',
    };

    logActivity(newActivity);

    // Reset form and show success message
    setActivityType('');
    setDuration('');
    setNotes('');
    setShowSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  return (
    <ScrollView style={themedStyles.container}>
      <View style={themedStyles.card}>
        <Text style={themedStyles.title}>Log Recovery Activity</Text>
        
        {showSuccess && (
          <View style={styles.successMessage}>
            <Text style={styles.successText}>Activity logged successfully!</Text>
          </View>
        )}
        
        <Text style={themedStyles.label}>Activity Date</Text>
        
        {Platform.OS === 'web' ? (
          <View style={themedStyles.webDatePickerContainer}>
            {/* Month dropdown */}
            <View style={themedStyles.webDatePickerItem}>
              <Text style={themedStyles.webDatePickerLabel}>Month</Text>
              <View style={themedStyles.webDatePickerSelect}>
                <select
                  value={webDate.month}
                  onChange={(e) => setWebDate({...webDate, month: e.target.value})}
                  style={themedStyles.webDateDropdown}
                >
                  {months.map(month => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                  ))}
                </select>
              </View>
            </View>
            
            {/* Day dropdown */}
            <View style={themedStyles.webDatePickerItem}>
              <Text style={themedStyles.webDatePickerLabel}>Day</Text>
              <View style={themedStyles.webDatePickerSelect}>
                <select
                  value={webDate.day}
                  onChange={(e) => setWebDate({...webDate, day: e.target.value})}
                  style={themedStyles.webDateDropdown}
                >
                  {days.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </View>
            </View>
            
            {/* Year dropdown */}
            <View style={themedStyles.webDatePickerItem}>
              <Text style={themedStyles.webDatePickerLabel}>Year</Text>
              <View style={themedStyles.webDatePickerSelect}>
                <select
                  value={webDate.year}
                  onChange={(e) => setWebDate({...webDate, year: e.target.value})}
                  style={themedStyles.webDateDropdown}
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </View>
            </View>
          </View>
        ) : (
          <>
            <TouchableOpacity 
              style={themedStyles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={themedStyles.dateButtonText}>
                {activityDate.toLocaleDateString()}
              </Text>
              <MaterialCommunityIcons name="calendar" size={20} color={theme.primary} />
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={activityDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
          </>
        )}
        
        <Text style={themedStyles.label}>Activity Type</Text>
        <View style={styles.activityTypeContainer}>
          {Object.keys(ACTIVITY_TYPES).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                themedStyles.activityTypeButton,
                activityType === type && themedStyles.activityTypeSelected
              ]}
              onPress={() => setActivityType(type)}
            >
              <Text 
                style={[
                  themedStyles.activityTypeText,
                  activityType === type && styles.activityTypeTextSelected
                ]}
              >
                {ACTIVITY_TYPES[type].label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={themedStyles.label}>Duration (minutes)</Text>
        <TextInput
          style={themedStyles.input}
          value={duration}
          onChangeText={setDuration}
          keyboardType="numeric"
          placeholder="Enter duration in minutes"
          placeholderTextColor={theme.textSecondary}
        />
        
        <Text style={themedStyles.label}>Notes (optional)</Text>
        <TextInput
          style={[themedStyles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Add any notes about this activity"
          placeholderTextColor={theme.textSecondary}
          multiline
          numberOfLines={4}
        />
        
        <TouchableOpacity 
          style={[
            themedStyles.submitButton,
            (!activityType || !duration) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!activityType || !duration}
        >
          <Text style={styles.submitButtonText}>Log Activity</Text>
        </TouchableOpacity>
      </View>
      
      <View style={themedStyles.card}>
        <Text style={themedStyles.title}>Activity Types Info</Text>
        {Object.keys(ACTIVITY_TYPES).map((key) => (
          <View key={key} style={styles.infoItem}>
            <Text style={themedStyles.infoLabel}>{ACTIVITY_TYPES[key].label}:</Text>
            <Text style={themedStyles.infoDescription}>{ACTIVITY_TYPES[key].description}</Text>
          </View>
        ))}
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 10,
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  activityTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  activityTypeButton: {
    borderWidth: 1,
    borderColor: '#4a86e8',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 5,
    backgroundColor: 'white',
  },
  activityTypeSelected: {
    backgroundColor: '#4a86e8',
  },
  activityTypeText: {
    color: '#4a86e8',
    fontWeight: '500',
    fontSize: 14,
  },
  activityTypeTextSelected: {
    color: 'white',
  },
  submitButton: {
    backgroundColor: '#4a86e8',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#b0c4e8',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  successMessage: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  successText: {
    color: '#155724',
    textAlign: 'center',
  },
  infoItem: {
    marginBottom: 15,
  },
  infoLabel: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 3,
    color: '#333',
  },
  infoDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default ActivityLogScreen;