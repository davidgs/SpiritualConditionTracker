import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch } from 'react-native';
import { useUser } from '../contexts/UserContext';
import { ACTIVITY_TYPES } from '../contexts/ActivitiesContext';

function ActivityLogScreen() {
  const { logActivity } = useUser();
  const [activityType, setActivityType] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = () => {
    if (!activityType || !duration) {
      return; // Basic validation
    }

    const newActivity = {
      type: activityType,
      duration: parseInt(duration, 10),
      date: new Date().toISOString(),
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
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Log Recovery Activity</Text>
        
        {showSuccess && (
          <View style={styles.successMessage}>
            <Text style={styles.successText}>Activity logged successfully!</Text>
          </View>
        )}
        
        <Text style={styles.label}>Activity Type</Text>
        <View style={styles.activityTypeContainer}>
          {Object.keys(ACTIVITY_TYPES).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.activityTypeButton,
                activityType === type && styles.activityTypeSelected
              ]}
              onPress={() => setActivityType(type)}
            >
              <Text 
                style={[
                  styles.activityTypeText,
                  activityType === type && styles.activityTypeTextSelected
                ]}
              >
                {ACTIVITY_TYPES[type].label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.label}>Duration (minutes)</Text>
        <TextInput
          style={styles.input}
          value={duration}
          onChangeText={setDuration}
          keyboardType="numeric"
          placeholder="Enter duration in minutes"
        />
        
        <Text style={styles.label}>Notes (optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Add any notes about this activity"
          multiline
          numberOfLines={4}
        />
        
        <TouchableOpacity 
          style={[
            styles.submitButton,
            (!activityType || !duration) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!activityType || !duration}
        >
          <Text style={styles.submitButtonText}>Log Activity</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.title}>Activity Types Info</Text>
        {Object.keys(ACTIVITY_TYPES).map((key) => (
          <View key={key} style={styles.infoItem}>
            <Text style={styles.infoLabel}>{ACTIVITY_TYPES[key].label}:</Text>
            <Text style={styles.infoDescription}>{ACTIVITY_TYPES[key].description}</Text>
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