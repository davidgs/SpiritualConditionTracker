import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { DatePickerModal } from 'react-native-paper-dates';
import { useTheme } from '../contexts/ThemeContext';
import { useActivities } from '../contexts/ActivitiesContext';
import Icon from 'react-native-vector-icons/FontAwesome';

/**
 * ActivityForm component - Allows users to log a new recovery activity
 * Adapted from the original web version to work with React Native
 */
function ActivityForm({ onSuccess }) {
  const { theme } = useTheme();
  const { addActivity } = useActivities();
  const [formData, setFormData] = useState({
    type: 'meeting',
    date: new Date(),
    duration: '60',
    name: '',
    notes: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDateChange = ({ date }) => {
    setShowDatePicker(false);
    if (date) {
      setFormData(prev => ({ ...prev, date }));
    }
  };
  
  const handleSubmit = async () => {
    if (!formData.type || !formData.date || !formData.duration) {
      setError('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create an activity object
      const activityData = {
        ...formData,
        duration: parseInt(formData.duration, 10) || 0,
        id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      
      // Save the activity
      await addActivity(activityData);
      
      // Reset form
      setFormData({
        type: 'meeting',
        date: new Date(),
        duration: '60',
        name: '',
        notes: '',
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error saving activity:', err);
      setError('Failed to save activity. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const activityTypes = [
    { id: 'meeting', label: 'AA Meeting', icon: 'users' },
    { id: 'meditation', label: 'Meditation', icon: 'brain' },
    { id: 'reading', label: 'Literature Reading', icon: 'book' },
    { id: 'sponsor', label: 'Time with Sponsor/Sponsee', icon: 'handshake-o' },
    { id: 'service', label: 'Service Work', icon: 'hand-paper-o' },
    { id: 'stepwork', label: 'Step Work', icon: 'list-ol' },
    { id: 'other', label: 'Other Activity', icon: 'star' },
  ];
  
  const themedStyles = {
    container: {
      backgroundColor: theme.background,
    },
    label: {
      color: theme.text,
    },
    input: {
      backgroundColor: theme.cardBackground,
      color: theme.text,
      borderColor: theme.border,
    },
    activityTypeButton: {
      backgroundColor: theme.cardBackground,
      borderColor: theme.border,
    },
    activityTypeText: {
      color: theme.text,
    },
    activeActivityType: {
      backgroundColor: theme.primaryLight,
      borderColor: theme.primary,
    },
    activeActivityTypeText: {
      color: theme.primary,
    },
    button: {
      backgroundColor: theme.primary,
    },
    buttonText: {
      color: '#FFFFFF',
    },
    errorContainer: {
      backgroundColor: theme.errorBackground,
    },
    errorText: {
      color: theme.error,
    },
    pickerContainer: {
      backgroundColor: theme.cardBackground,
      borderColor: theme.border,
    },
    picker: {
      color: theme.text,
    },
  };
  
  return (
    <ScrollView style={[styles.container, themedStyles.container]}>
      {error && (
        <View style={[styles.errorContainer, themedStyles.errorContainer]}>
          <Icon name="exclamation-triangle" size={16} color={theme.error} style={styles.errorIcon} />
          <Text style={[styles.errorText, themedStyles.errorText]}>{error}</Text>
        </View>
      )}
      
      {/* Activity Type Selection */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, themedStyles.label]}>Activity Type</Text>
        <View style={styles.activityTypesGrid}>
          {activityTypes.map(type => (
            <TouchableOpacity 
              key={type.id}
              style={[
                styles.activityTypeButton, 
                themedStyles.activityTypeButton,
                formData.type === type.id && [styles.activeActivityType, themedStyles.activeActivityType]
              ]}
              onPress={() => handleChange('type', type.id)}
            >
              <Icon 
                name={type.icon} 
                size={20} 
                color={formData.type === type.id ? theme.primary : theme.textSecondary} 
                style={styles.icon} 
              />
              <Text 
                style={[
                  styles.activityTypeText, 
                  themedStyles.activityTypeText,
                  formData.type === type.id && [styles.activeActivityTypeText, themedStyles.activeActivityTypeText]
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Date Picker */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, themedStyles.label]}>Date</Text>
        <TouchableOpacity 
          style={[styles.input, themedStyles.input]} 
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={[styles.inputText, {color: theme.text}]}>
            {formData.date.toDateString()}
          </Text>
        </TouchableOpacity>
        
        <DatePickerModal
          visible={showDatePicker}
          mode="single"
          onDismiss={() => setShowDatePicker(false)}
          date={formData.date}
          onConfirm={handleDateChange}
          saveLabel="Confirm"
          label="Select Date"
          animationType="slide"
          locale="en"
        />
      </View>
      
      {/* Duration */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, themedStyles.label]}>Duration (minutes)</Text>
        <View style={[styles.pickerContainer, themedStyles.pickerContainer]}>
          <Picker
            selectedValue={formData.duration}
            onValueChange={(itemValue) => handleChange('duration', itemValue)}
            style={[styles.picker, themedStyles.picker]}
          >
            <Picker.Item label="15 minutes" value="15" />
            <Picker.Item label="30 minutes" value="30" />
            <Picker.Item label="45 minutes" value="45" />
            <Picker.Item label="60 minutes" value="60" />
            <Picker.Item label="90 minutes" value="90" />
            <Picker.Item label="120 minutes" value="120" />
            <Picker.Item label="180 minutes" value="180" />
          </Picker>
        </View>
      </View>
      
      {/* Activity Name */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, themedStyles.label]}>Activity Name (optional)</Text>
        <TextInput
          style={[styles.input, themedStyles.input]}
          value={formData.name}
          onChangeText={(text) => handleChange('name', text)}
          placeholder={
            formData.type === 'meeting' ? 'e.g., Home Group Meeting' :
            formData.type === 'meditation' ? 'e.g., Morning Meditation' :
            formData.type === 'reading' ? 'e.g., Big Book Chapter 5' :
            formData.type === 'sponsor' ? 'e.g., Weekly Check-in' :
            formData.type === 'service' ? 'e.g., Coffee Service' :
            formData.type === 'stepwork' ? 'e.g., Step 4 Inventory' :
            'e.g., Recovery Workshop'
          }
          placeholderTextColor={theme.textSecondary}
        />
      </View>
      
      {/* Notes */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, themedStyles.label]}>Notes (optional)</Text>
        <TextInput
          style={[styles.textArea, themedStyles.input]}
          value={formData.notes}
          onChangeText={(text) => handleChange('notes', text)}
          placeholder="Any thoughts or reflections about this activity..."
          placeholderTextColor={theme.textSecondary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
      
      {/* Submit Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, themedStyles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={[styles.buttonText, themedStyles.buttonText]}>
            {isSubmitting ? 'Saving...' : 'Save Activity'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  inputText: {
    fontSize: 16,
    paddingVertical: 12,
  },
  textArea: {
    height: 120,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
    fontSize: 16,
  },
  activityTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  activityTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
  },
  activityTypeText: {
    fontSize: 14,
    marginLeft: 8,
  },
  activeActivityType: {
    borderWidth: 2,
  },
  activeActivityTypeText: {
    fontWeight: '500',
  },
  icon: {
    width: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    fontSize: 14,
    flex: 1,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
});

export default ActivityForm;