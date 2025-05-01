import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from 'react-native-vector-icons';
import { fetchMeetings } from '../utils/api';
import { useActivities } from '../contexts/ActivitiesContext';
import { 
  requestCalendarPermissions, 
  requestNotificationPermissions,
  addMeetingToCalendar,
  scheduleMeetingNotification
} from '../utils/calendarReminders';
import { calendarReminderOperations } from '../utils/database';

const MeetingsScreen = ({ navigation }) => {
  const { addActivity } = useActivities();
  const [searchLocation, setSearchLocation] = useState('');
  const [searchDay, setSearchDay] = useState('');
  const [searchTime, setSearchTime] = useState('');
  const [searchType, setSearchType] = useState('');
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Reminder modal state
  const [isReminderModalVisible, setIsReminderModalVisible] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [reminderMinutes, setReminderMinutes] = useState(30);
  const [isRecurring, setIsRecurring] = useState(true);
  const [addingReminder, setAddingReminder] = useState(false);
  
  // Days of week options
  const dayOptions = [
    { id: '', label: 'Any day' },
    { id: 'sunday', label: 'Sunday' },
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
    { id: 'saturday', label: 'Saturday' },
  ];
  
  // Time options
  const timeOptions = [
    { id: '', label: 'Any time' },
    { id: 'morning', label: 'Morning' },
    { id: 'noon', label: 'Noon' },
    { id: 'evening', label: 'Evening' },
    { id: 'night', label: 'Night' },
  ];
  
  // Meeting type options
  const typeOptions = [
    { id: '', label: 'Any type' },
    { id: 'open', label: 'Open' },
    { id: 'closed', label: 'Closed' },
    { id: 'discussion', label: 'Discussion' },
    { id: 'speaker', label: 'Speaker' },
    { id: 'step', label: 'Step' },
    { id: 'big_book', label: 'Big Book' },
  ];
  
  // Search for meetings
  const handleSearch = async () => {
    if (!searchLocation) {
      Alert.alert('Search Error', 'Please enter a location to search for meetings.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const meetingResults = await fetchMeetings(
        null, // Use default region for now
        searchDay,
        searchTime,
        searchType,
        searchLocation
      );
      
      setMeetings(meetingResults);
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError('Failed to load meetings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Log a meeting as an activity
  const logMeeting = (meeting) => {
    // Create activity object from meeting
    const name = meeting.name || 'AA Meeting';
    const locationInfo = [
      meeting.location, 
      meeting.address, 
      meeting.city, 
      meeting.state
    ].filter(Boolean).join(', ');
    
    const activity = {
      type: 'meeting',
      name,
      duration: 60, // Default to 1 hour
      notes: locationInfo,
      date: new Date().toISOString(),
    };
    
    // Save activity
    addActivity(activity);
    
    // Show confirmation
    Alert.alert(
      'Meeting Logged',
      `You've logged ${name} as an activity. You can view it in your activity log.`,
      [{ text: 'OK' }]
    );
  };
  
  // Open address in maps app
  const openMaps = (address) => {
    if (!address) return;
    
    const mapUrl = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(address)}`,
      android: `geo:0,0?q=${encodeURIComponent(address)}`,
    });
    
    Linking.canOpenURL(mapUrl)
      .then(supported => {
        if (supported) {
          return Linking.openURL(mapUrl);
        } else {
          // Fallback to Google Maps on web
          return Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(address)}`);
        }
      })
      .catch(err => {
        console.error('Error opening maps:', err);
        Alert.alert('Error', 'Could not open maps application.');
      });
  };
  
  // Add meeting to calendar
  const showReminderModal = (meeting) => {
    setSelectedMeeting(meeting);
    setIsReminderModalVisible(true);
  };
  
  // Process adding meeting to calendar
  const addMeetingReminder = async () => {
    if (!selectedMeeting) return;
    
    setAddingReminder(true);
    
    try {
      // Check if we have permissions
      const calendarPermission = await requestCalendarPermissions();
      const notificationPermission = await requestNotificationPermissions();
      
      if (!calendarPermission || !notificationPermission) {
        Alert.alert(
          'Permission Required',
          'Calendar and notification permissions are required to add meeting reminders.',
          [{ text: 'OK' }]
        );
        setAddingReminder(false);
        return;
      }
      
      // Format location
      const location = [
        selectedMeeting.location, 
        selectedMeeting.address, 
        selectedMeeting.city, 
        selectedMeeting.state
      ].filter(Boolean).join(', ');
      
      // Format meeting data
      const meeting = {
        ...selectedMeeting,
        id: selectedMeeting.id || `meeting_${Date.now()}`, // Ensure we have an ID
        name: selectedMeeting.name || 'AA Meeting',
        day: selectedMeeting.day || 'sunday',  // Default to sunday if no day specified
        time: selectedMeeting.time || '19:00', // Default to 7 PM if no time
      };
      
      // Add to calendar
      const calendarEventId = await addMeetingToCalendar(meeting, {
        reminderMinutes,
        recurrence: isRecurring ? 'weekly' : null
      });
      
      // Schedule notification
      const notificationId = await scheduleMeetingNotification(meeting, {
        reminderMinutes
      });
      
      // Save reminder info to database
      await calendarReminderOperations.saveCalendarReminder({
        meetingId: meeting.id,
        meetingName: meeting.name,
        meetingDay: meeting.day,
        meetingTime: meeting.time,
        location,
        calendarEventId,
        notificationId,
        reminderMinutes,
        isRecurring
      });
      
      // Close modal
      setIsReminderModalVisible(false);
      setSelectedMeeting(null);
      
      // Show success message
      Alert.alert(
        'Reminder Set',
        `A ${isRecurring ? 'weekly ' : ''}reminder has been added to your calendar for ${meeting.name}.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error adding meeting reminder:', error);
      Alert.alert(
        'Error',
        'An error occurred while adding the meeting reminder. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setAddingReminder(false);
    }
  };
  
  // Render a meeting item
  const renderMeetingItem = (meeting) => {
    // Format meeting data for display - handle potential missing fields
    const name = meeting.name || 'Unnamed Meeting';
    const loc = meeting.location || meeting.city || 'Location not specified';
    const day = meeting.day || 'Day not specified';
    const time = meeting.time || 'Time not specified';
    const types = meeting.types || ['AA Meeting'];
    const address = meeting.address || (meeting.location ? `${meeting.location}, ${meeting.city || ''}` : 'Address not available');
    
    return (
      <View key={meeting.id || `meeting-${Math.random()}`} style={styles.meetingItem}>
        <Text style={styles.meetingName}>{name}</Text>
        
        <View style={styles.meetingDetails}>
          <View style={styles.meetingDetailItem}>
            <Ionicons name="location-outline" size={16} color="#6b7280" />
            <Text style={styles.meetingDetailText}>{loc}</Text>
          </View>
          
          <View style={styles.meetingDetailItem}>
            <Ionicons name="calendar-outline" size={16} color="#6b7280" />
            <Text style={styles.meetingDetailText}>{day}</Text>
          </View>
          
          <View style={styles.meetingDetailItem}>
            <Ionicons name="time-outline" size={16} color="#6b7280" />
            <Text style={styles.meetingDetailText}>{time}</Text>
          </View>
        </View>
        
        <View style={styles.meetingTags}>
          {types.map((type, index) => (
            <View key={index} style={styles.meetingTag}>
              <Text style={styles.meetingTagText}>{type}</Text>
            </View>
          ))}
        </View>
        
        {address ? (
          <Text style={styles.meetingAddress}>{address}</Text>
        ) : null}
        
        <View style={styles.meetingActions}>
          {address ? (
            <TouchableOpacity 
              style={styles.meetingActionButton}
              onPress={() => openMaps(address)}
            >
              <Ionicons name="map-outline" size={16} color="#3b82f6" />
              <Text style={styles.meetingActionText}>View on Map</Text>
            </TouchableOpacity>
          ) : null}
          
          <TouchableOpacity 
            style={styles.meetingActionButton}
            onPress={() => showReminderModal(meeting)}
          >
            <Ionicons name="calendar-outline" size={16} color="#3b82f6" />
            <Text style={styles.meetingActionText}>Add to Calendar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.meetingActionButton}
            onPress={() => logMeeting(meeting)}
          >
            <Ionicons name="add-circle-outline" size={16} color="#3b82f6" />
            <Text style={styles.meetingActionText}>Log Meeting</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AA Meetings</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <Text style={styles.searchTitle}>Find Meetings Near You</Text>
        
        <TextInput
          style={styles.searchInput}
          placeholder="Enter city or location"
          value={searchLocation}
          onChangeText={setSearchLocation}
        />
        
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => {
              // Toggle through day options on press
              const currentIndex = dayOptions.findIndex(option => option.id === searchDay);
              const nextIndex = (currentIndex + 1) % dayOptions.length;
              setSearchDay(dayOptions[nextIndex].id);
            }}
          >
            <Text style={styles.filterButtonText}>
              {dayOptions.find(d => d.id === searchDay)?.label || 'Any day'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => {
              // Toggle through time options on press
              const currentIndex = timeOptions.findIndex(option => option.id === searchTime);
              const nextIndex = (currentIndex + 1) % timeOptions.length;
              setSearchTime(timeOptions[nextIndex].id);
            }}
          >
            <Text style={styles.filterButtonText}>
              {timeOptions.find(t => t.id === searchTime)?.label || 'Any time'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => {
              // Toggle through type options on press
              const currentIndex = typeOptions.findIndex(option => option.id === searchType);
              const nextIndex = (currentIndex + 1) % typeOptions.length;
              setSearchType(typeOptions[nextIndex].id);
            }}
          >
            <Text style={styles.filterButtonText}>
              {typeOptions.find(t => t.id === searchType)?.label || 'Any type'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.searchButtonText}>Search Meetings</Text>
          )}
        </TouchableOpacity>
      </View>
      
      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={24} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {meetings.length > 0 ? (
          <>
            <Text style={styles.resultsCount}>
              Found {meetings.length} meetings near {searchLocation}
            </Text>
            {meetings.map(meeting => renderMeetingItem(meeting))}
          </>
        ) : !loading && !error && searchLocation ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={48} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No Meetings Found</Text>
            <Text style={styles.emptySubtitle}>
              Try broadening your search or changing location.
            </Text>
          </View>
        ) : !loading && !searchLocation ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people" size={48} color="#d1d5db" />
            <Text style={styles.emptyTitle}>Find AA Meetings</Text>
            <Text style={styles.emptySubtitle}>
              Enter a location above to search for meetings in your area.
            </Text>
          </View>
        ) : null}
      </ScrollView>
      
      {/* Calendar Reminder Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isReminderModalVisible}
        onRequestClose={() => setIsReminderModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Calendar Reminder</Text>
              <TouchableOpacity 
                onPress={() => setIsReminderModalVisible(false)}
                disabled={addingReminder}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              {selectedMeeting && (
                <>
                  <Text style={styles.meetingInfoTitle}>{selectedMeeting.name || 'AA Meeting'}</Text>
                  
                  <View style={styles.meetingInfoRow}>
                    <Ionicons name="calendar-outline" size={18} color="#4b5563" />
                    <Text style={styles.meetingInfoText}>
                      {selectedMeeting.day ? selectedMeeting.day.charAt(0).toUpperCase() + selectedMeeting.day.slice(1) : 'Day not specified'}
                    </Text>
                  </View>
                  
                  <View style={styles.meetingInfoRow}>
                    <Ionicons name="time-outline" size={18} color="#4b5563" />
                    <Text style={styles.meetingInfoText}>
                      {selectedMeeting.time || 'Time not specified'}
                    </Text>
                  </View>
                  
                  {(selectedMeeting.location || selectedMeeting.address) && (
                    <View style={styles.meetingInfoRow}>
                      <Ionicons name="location-outline" size={18} color="#4b5563" />
                      <Text style={styles.meetingInfoText}>
                        {[selectedMeeting.location, selectedMeeting.address, selectedMeeting.city].filter(Boolean).join(', ')}
                      </Text>
                    </View>
                  )}
                  
                  <View style={styles.divider} />
                  
                  <Text style={styles.sectionTitle}>Reminder Settings</Text>
                  
                  <Text style={styles.settingLabel}>Remind me before meeting</Text>
                  <View style={styles.reminderTimeContainer}>
                    {[15, 30, 60, 120].map(minutes => (
                      <TouchableOpacity
                        key={minutes}
                        style={[
                          styles.reminderTimeButton,
                          reminderMinutes === minutes && styles.reminderTimeButtonActive
                        ]}
                        onPress={() => setReminderMinutes(minutes)}
                      >
                        <Text 
                          style={[
                            styles.reminderTimeText,
                            reminderMinutes === minutes && styles.reminderTimeTextActive
                          ]}
                        >
                          {minutes} min
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  
                  <View style={styles.recurringContainer}>
                    <View style={styles.recurringTextContainer}>
                      <Text style={styles.settingLabel}>Repeat weekly</Text>
                      <Text style={styles.settingDescription}>
                        Add this meeting to your calendar every week
                      </Text>
                    </View>
                    <Switch
                      value={isRecurring}
                      onValueChange={setIsRecurring}
                      trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
                      thumbColor={isRecurring ? '#3b82f6' : '#f3f4f6'}
                    />
                  </View>
                </>
              )}
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setIsReminderModalVisible(false)}
                disabled={addingReminder}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={addMeetingReminder}
                disabled={addingReminder}
              >
                {addingReminder ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.addButtonText}>Add to Calendar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  filterButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#4b5563',
  },
  searchButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#b91c1c',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  resultsCount: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  meetingItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  meetingName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  meetingDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  meetingDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  meetingDetailText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  meetingTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  meetingTag: {
    backgroundColor: '#ebf5ff',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  meetingTagText: {
    fontSize: 12,
    color: '#3b82f6',
  },
  meetingAddress: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 12,
  },
  meetingActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  meetingActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  meetingActionText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
    marginLeft: 4,
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalBody: {
    padding: 16,
    maxHeight: '60%',
  },
  meetingInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  meetingInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  meetingInfoText: {
    fontSize: 16,
    color: '#4b5563',
    marginLeft: 8,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 8,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  reminderTimeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  reminderTimeButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  reminderTimeButtonActive: {
    backgroundColor: '#3b82f6',
  },
  reminderTimeText: {
    color: '#4b5563',
    fontWeight: '500',
  },
  reminderTimeTextActive: {
    color: '#fff',
  },
  recurringContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  recurringTextContainer: {
    flex: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  addButton: {
    flex: 2,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default MeetingsScreen;