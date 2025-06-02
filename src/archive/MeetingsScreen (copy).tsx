import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Calendar from 'expo-calendar';

function MeetingsScreen() {
  const [meetings, setMeetings] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    name: '',
    location: '',
    day: '',
    time: '',
    type: '',
  });

  useEffect(() => {
    // Load meetings from database
    // This is just sample data for now
    setMeetings([
      {
        id: '1',
        name: 'Serenity Group',
        location: '123 Main St, Anytown',
        day: 'Monday',
        time: '7:00 PM',
        type: 'Discussion',
      },
      {
        id: '2',
        name: 'New Beginnings',
        location: '456 Oak Ave, Somecity',
        day: 'Wednesday',
        time: '6:30 PM',
        type: 'Big Book',
      },
      {
        id: '3',
        name: 'Hope Group',
        location: '789 Pine St, Othertown',
        day: 'Saturday',
        time: '10:00 AM',
        type: 'Speaker',
      },
    ]);
  }, []);

  const handleAddMeeting = () => {
    // Validate form
    if (!newMeeting.name || !newMeeting.location || !newMeeting.day || !newMeeting.time) {
      Alert.alert('Missing Information', 'Please fill out all required fields');
      return;
    }

    // Add new meeting
    const addedMeeting = {
      id: Date.now().toString(),
      ...newMeeting,
    };

    setMeetings([...meetings, addedMeeting]);
    
    // Reset form
    setNewMeeting({
      name: '',
      location: '',
      day: '',
      time: '',
      type: '',
    });
    setShowAddForm(false);
  };

  const addToCalendar = async (meeting) => {
    try {
      // Request calendar permissions
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Cannot add meeting to calendar without permission');
        return;
      }

      // Get default calendar
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find(cal => cal.allowsModifications);

      if (!defaultCalendar) {
        Alert.alert('Calendar Error', 'No writable calendar found');
        return;
      }

      // Create event details
      const startDate = new Date();
      // Parse day and time to set proper date
      // This is simplified - in real app would need more complex date handling
      startDate.setHours(parseInt(meeting.time.split(':')[0]), parseInt(meeting.time.split(':')[1]));

      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 1);

      // Create the event
      await Calendar.createEventAsync(defaultCalendar.id, {
        title: `AA Meeting: ${meeting.name}`,
        location: meeting.location,
        startDate,
        endDate,
        notes: `Meeting Type: ${meeting.type}`,
        alarms: [{ relativeOffset: -30 }], // 30 minute reminder
      });

      Alert.alert('Success', 'Meeting added to your calendar');
    } catch (error) {
      Alert.alert('Error', 'Failed to add meeting to calendar: ' + error.message);
    }
  };

  const shareMeeting = (meeting) => {
    Alert.alert(
      'Share Meeting',
      'This would allow you to share this meeting with other app users.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Meetings</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddForm(!showAddForm)}
        >
          <MaterialCommunityIcons name={showAddForm ? 'close' : 'plus'} size={24} color="white" />
        </TouchableOpacity>
      </View>

      {showAddForm && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Add New Meeting</Text>
          
          <Text style={styles.label}>Meeting Name *</Text>
          <TextInput
            style={styles.input}
            value={newMeeting.name}
            onChangeText={(text) => setNewMeeting({...newMeeting, name: text})}
            placeholder="Enter meeting name"
          />
          
          <Text style={styles.label}>Location *</Text>
          <TextInput
            style={styles.input}
            value={newMeeting.location}
            onChangeText={(text) => setNewMeeting({...newMeeting, location: text})}
            placeholder="Enter meeting location"
          />
          
          <Text style={styles.label}>Day *</Text>
          <TextInput
            style={styles.input}
            value={newMeeting.day}
            onChangeText={(text) => setNewMeeting({...newMeeting, day: text})}
            placeholder="Enter day (e.g., Monday)"
          />
          
          <Text style={styles.label}>Time *</Text>
          <TextInput
            style={styles.input}
            value={newMeeting.time}
            onChangeText={(text) => setNewMeeting({...newMeeting, time: text})}
            placeholder="Enter time (e.g., 7:00 PM)"
          />
          
          <Text style={styles.label}>Type</Text>
          <TextInput
            style={styles.input}
            value={newMeeting.type}
            onChangeText={(text) => setNewMeeting({...newMeeting, type: text})}
            placeholder="Enter meeting type (e.g., Discussion)"
          />
          
          <View style={styles.formButtons}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowAddForm(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleAddMeeting}
            >
              <Text style={styles.saveButtonText}>Save Meeting</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView style={styles.meetingsList}>
        {meetings.length > 0 ? (
          meetings.map((meeting) => (
            <View key={meeting.id} style={styles.meetingCard}>
              <View style={styles.meetingInfo}>
                <Text style={styles.meetingName}>{meeting.name}</Text>
                <Text style={styles.meetingLocation}>{meeting.location}</Text>
                <Text style={styles.meetingSchedule}>
                  {meeting.day} at {meeting.time}
                </Text>
                {meeting.type && (
                  <Text style={styles.meetingType}>Type: {meeting.type}</Text>
                )}
              </View>
              
              <View style={styles.meetingActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => addToCalendar(meeting)}
                >
                  <MaterialCommunityIcons name="calendar-plus" size={20} color="#4a86e8" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => shareMeeting(meeting)}
                >
                  <MaterialCommunityIcons name="share-variant" size={20} color="#4a86e8" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="calendar-blank" size={50} color="#ccc" />
            <Text style={styles.emptyText}>
              You haven't added any meetings yet.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#4a86e8',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formCard: {
    backgroundColor: 'white',
    padding: 15,
    margin: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  formTitle: {
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
  formButtons: {
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
  meetingsList: {
    flex: 1,
    padding: 15,
  },
  meetingCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
  },
  meetingInfo: {
    flex: 1,
  },
  meetingName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  meetingLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  meetingSchedule: {
    fontSize: 14,
    color: '#4a86e8',
    marginTop: 5,
    fontWeight: '500',
  },
  meetingType: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
    fontStyle: 'italic',
  },
  meetingActions: {
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 5,
  },
  actionButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 15,
    maxWidth: '80%',
  },
});

export default MeetingsScreen;