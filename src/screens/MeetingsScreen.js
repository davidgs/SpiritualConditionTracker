import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

// Database operations
import { meetingOperations, userOperations } from '../utils/database';
import { useUser } from '../contexts/UserContext';

// Define days of the week for filtering
const DAYS_OF_WEEK = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
];

// Meeting types
const MEETING_TYPES = {
  'open': 'Open Meeting',
  'closed': 'Closed Meeting',
  'speaker': 'Speaker Meeting',
  'discussion': 'Discussion Meeting',
  'bigbook': 'Big Book Study',
  'stepStudy': 'Step Study',
  'mensOnly': 'Men Only',
  'womensOnly': 'Women Only',
  'lgbtq': 'LGBTQ+',
  'beginner': 'Beginner Meeting',
  'other': 'Other'
};

const MeetingsScreen = () => {
  const { user } = useUser();
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterDay, setFilterDay] = useState(null);
  const [filterType, setFilterType] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Form state for adding new meeting
  const [meetingName, setMeetingName] = useState('');
  const [meetingLocation, setMeetingLocation] = useState('');
  const [meetingAddress, setMeetingAddress] = useState('');
  const [meetingDay, setMeetingDay] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingType, setMeetingType] = useState('open');
  const [meetingNotes, setMeetingNotes] = useState('');
  const [isShared, setIsShared] = useState(false);
  
  // Load meetings on mount
  useEffect(() => {
    loadMeetings();
  }, []);
  
  // Load meetings from database
  const loadMeetings = async () => {
    try {
      setIsLoading(true);
      
      // Get all user-created meetings and shared meetings
      const allMeetings = await meetingOperations.getAll();
      setMeetings(allMeetings);
    } catch (error) {
      console.error('Error loading meetings:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter meetings based on selected filters
  const filteredMeetings = meetings.filter(meeting => {
    // Filter by day if a day is selected
    if (filterDay && meeting.day !== filterDay) {
      return false;
    }
    
    // Filter by type if a type is selected
    if (filterType && meeting.type !== filterType) {
      return false;
    }
    
    return true;
  });
  
  // Sort meetings by day and time
  const sortedMeetings = [...filteredMeetings].sort((a, b) => {
    // First sort by day
    const dayIndexA = DAYS_OF_WEEK.indexOf(a.day);
    const dayIndexB = DAYS_OF_WEEK.indexOf(b.day);
    
    if (dayIndexA !== dayIndexB) {
      return dayIndexA - dayIndexB;
    }
    
    // Then sort by time
    return a.time.localeCompare(b.time);
  });
  
  // Handle adding a new meeting
  const handleAddMeeting = async () => {
    if (!meetingName || !meetingDay || !meetingTime) {
      // Basic validation
      alert('Please provide at least meeting name, day, and time.');
      return;
    }
    
    try {
      const newMeeting = {
        name: meetingName,
        location: meetingLocation,
        address: meetingAddress,
        day: meetingDay.toLowerCase(),
        time: meetingTime,
        type: meetingType,
        notes: meetingNotes,
        isShared: isShared,
        createdBy: user?.id || ''
      };
      
      await meetingOperations.create(newMeeting);
      
      // Reset form
      setMeetingName('');
      setMeetingLocation('');
      setMeetingAddress('');
      setMeetingDay('');
      setMeetingTime('');
      setMeetingType('open');
      setMeetingNotes('');
      setIsShared(false);
      
      // Close modal and reload meetings
      setModalVisible(false);
      loadMeetings();
    } catch (error) {
      console.error('Error adding meeting:', error);
      alert('Failed to add meeting. Please try again.');
    }
  };
  
  // Render each meeting item
  const renderMeeting = ({ item }) => {
    // Format day of week to be capitalized
    const formattedDay = item.day.charAt(0).toUpperCase() + item.day.slice(1);
    
    return (
      <View style={styles.meetingItem}>
        <View style={styles.meetingHeader}>
          <Text style={styles.meetingName}>{item.name}</Text>
          <View style={styles.meetingTypeTag}>
            <Text style={styles.meetingTypeText}>
              {MEETING_TYPES[item.type] || 'Meeting'}
            </Text>
          </View>
        </View>
        
        <View style={styles.meetingDetails}>
          <View style={styles.detailRow}>
            <Icon name="map-marker-alt" size={16} color="#3498db" style={styles.detailIcon} />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
          
          {item.address && (
            <View style={styles.detailRow}>
              <Icon name="road" size={16} color="#3498db" style={styles.detailIcon} />
              <Text style={styles.detailText}>{item.address}</Text>
            </View>
          )}
          
          <View style={styles.detailRow}>
            <Icon name="calendar-day" size={16} color="#3498db" style={styles.detailIcon} />
            <Text style={styles.detailText}>{formattedDay} at {item.time}</Text>
          </View>
        </View>
        
        {item.notes && (
          <Text style={styles.meetingNotes}>{item.notes}</Text>
        )}
        
        <View style={styles.meetingActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="calendar-plus" size={16} color="#27ae60" />
            <Text style={styles.actionText}>Add to Calendar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="share-alt" size={16} color="#3498db" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
          
          {item.createdBy === user?.id && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => deleteMeeting(item.id)}
            >
              <Icon name="trash" size={16} color="#e74c3c" />
              <Text style={styles.actionText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };
  
  // Delete a meeting
  const deleteMeeting = async (meetingId) => {
    try {
      await meetingOperations.delete(meetingId);
      loadMeetings();
    } catch (error) {
      console.error('Error deleting meeting:', error);
      alert('Failed to delete meeting. Please try again.');
    }
  };
  
  // Filter buttons component
  const FilterButtons = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filtersContainer}
    >
      {/* Day filters */}
      {DAYS_OF_WEEK.map(day => (
        <TouchableOpacity
          key={day}
          style={[
            styles.filterButton,
            filterDay === day && styles.filterButtonSelected
          ]}
          onPress={() => setFilterDay(filterDay === day ? null : day)}
        >
          <Text 
            style={[
              styles.filterButtonText,
              filterDay === day && styles.filterButtonTextSelected
            ]}
          >
            {day.charAt(0).toUpperCase() + day.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
      
      {/* Type filters */}
      {Object.entries(MEETING_TYPES).map(([type, label]) => (
        <TouchableOpacity
          key={type}
          style={[
            styles.filterButton,
            filterType === type && styles.filterButtonSelected,
            { backgroundColor: '#f8f9fa' }
          ]}
          onPress={() => setFilterType(filterType === type ? null : type)}
        >
          <Text 
            style={[
              styles.filterButtonText,
              filterType === type && styles.filterButtonTextSelected
            ]}
          >
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>AA Meetings</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Icon name="plus" size={16} color="#fff" />
            <Text style={styles.addButtonText}>Add Meeting</Text>
          </TouchableOpacity>
        </View>
        
        {/* Filters */}
        <FilterButtons />
        
        {/* Meetings List */}
        {isLoading ? (
          <View style={styles.centered}>
            <Text>Loading meetings...</Text>
          </View>
        ) : sortedMeetings.length === 0 ? (
          <View style={styles.centered}>
            <Icon name="users" size={50} color="#bdc3c7" />
            <Text style={styles.emptyText}>
              {filterDay || filterType 
                ? 'No meetings found with current filters'
                : 'No meetings added yet'}
            </Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.emptyButtonText}>Add Your First Meeting</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={sortedMeetings}
            renderItem={renderMeeting}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
          />
        )}
        
        {/* Add Meeting Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add AA Meeting</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Icon name="times" size={20} color="#7f8c8d" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalContent}>
                <Text style={styles.inputLabel}>Meeting Name *</Text>
                <TextInput
                  style={styles.input}
                  value={meetingName}
                  onChangeText={setMeetingName}
                  placeholder="Enter meeting name"
                />
                
                <Text style={styles.inputLabel}>Location *</Text>
                <TextInput
                  style={styles.input}
                  value={meetingLocation}
                  onChangeText={setMeetingLocation}
                  placeholder="Location name (e.g. Community Center)"
                />
                
                <Text style={styles.inputLabel}>Address</Text>
                <TextInput
                  style={styles.input}
                  value={meetingAddress}
                  onChangeText={setMeetingAddress}
                  placeholder="Full address"
                />
                
                <Text style={styles.inputLabel}>Day of Week *</Text>
                <View style={styles.dayButtons}>
                  {DAYS_OF_WEEK.map(day => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayButton,
                        meetingDay === day && styles.dayButtonSelected
                      ]}
                      onPress={() => setMeetingDay(day)}
                    >
                      <Text 
                        style={[
                          styles.dayButtonText,
                          meetingDay === day && styles.dayButtonTextSelected
                        ]}
                      >
                        {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <Text style={styles.inputLabel}>Time *</Text>
                <TextInput
                  style={styles.input}
                  value={meetingTime}
                  onChangeText={setMeetingTime}
                  placeholder="Meeting time (e.g. 7:30 PM)"
                />
                
                <Text style={styles.inputLabel}>Meeting Type</Text>
                <View style={styles.typeContainer}>
                  {Object.entries(MEETING_TYPES).map(([type, label]) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeButton,
                        meetingType === type && styles.typeButtonSelected
                      ]}
                      onPress={() => setMeetingType(type)}
                    >
                      <Text 
                        style={[
                          styles.typeButtonText,
                          meetingType === type && styles.typeButtonTextSelected
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <Text style={styles.inputLabel}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.notesInput]}
                  value={meetingNotes}
                  onChangeText={setMeetingNotes}
                  placeholder="Additional information about this meeting"
                  multiline
                />
                
                <View style={styles.shareContainer}>
                  <TouchableOpacity
                    style={[
                      styles.shareToggle,
                      isShared && styles.shareToggleActive
                    ]}
                    onPress={() => setIsShared(!isShared)}
                  >
                    <Icon 
                      name={isShared ? 'check-square' : 'square'} 
                      size={20} 
                      color={isShared ? '#3498db' : '#7f8c8d'} 
                    />
                    <Text style={styles.shareText}>
                      Share this meeting with other users
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={handleAddMeeting}
                >
                  <Text style={styles.saveButtonText}>Save Meeting</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 6
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingBottom: 12
  },
  filterButton: {
    backgroundColor: '#ecf0f1',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8
  },
  filterButtonSelected: {
    backgroundColor: '#3498db'
  },
  filterButtonText: {
    color: '#7f8c8d',
    fontSize: 12
  },
  filterButtonTextSelected: {
    color: '#fff'
  },
  list: {
    paddingBottom: 20
  },
  meetingItem: {
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
  meetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  meetingName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1
  },
  meetingTypeTag: {
    backgroundColor: '#e8f4fd',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12
  },
  meetingTypeText: {
    color: '#3498db',
    fontSize: 12,
    fontWeight: '500'
  },
  meetingDetails: {
    marginBottom: 10
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  detailIcon: {
    width: 20,
    textAlign: 'center',
    marginRight: 8
  },
  detailText: {
    color: '#7f8c8d',
    fontSize: 14
  },
  meetingNotes: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
    marginBottom: 10,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0'
  },
  meetingActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16
  },
  actionText: {
    color: '#7f8c8d',
    fontSize: 14,
    marginLeft: 6
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 16,
    marginBottom: 20,
    textAlign: 'center'
  },
  emptyButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '500'
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
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top'
  },
  dayButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16
  },
  dayButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    minWidth: 50,
    alignItems: 'center'
  },
  dayButtonSelected: {
    backgroundColor: '#3498db'
  },
  dayButtonText: {
    color: '#7f8c8d',
    fontWeight: '500'
  },
  dayButtonTextSelected: {
    color: '#fff'
  },
  typeContainer: {
    marginBottom: 16
  },
  typeButton: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8
  },
  typeButtonSelected: {
    backgroundColor: '#3498db'
  },
  typeButtonText: {
    color: '#7f8c8d'
  },
  typeButtonTextSelected: {
    color: '#fff',
    fontWeight: '500'
  },
  shareContainer: {
    marginBottom: 16
  },
  shareToggle: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  shareToggleActive: {
    opacity: 1
  },
  shareText: {
    color: '#2c3e50',
    marginLeft: 8
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

export default MeetingsScreen;