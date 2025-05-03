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
  Modal,
  Share
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from 'react-native-vector-icons';
import { useActivities } from '../contexts/ActivitiesContext';
import { 
  requestCalendarPermissions, 
  requestNotificationPermissions,
  addMeetingToCalendar,
  scheduleMeetingNotification
} from '../utils/calendarReminders';
import { calendarReminderOperations, userMeetingOperations } from '../utils/database';

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

const MEETING_TYPES = [
  'Open',
  'Closed',
  'Discussion',
  'Speaker',
  'Big Book',
  'Step Study',
  'Beginner',
  'Men',
  'Women'
];

const MeetingsScreen = ({ navigation }) => {
  const { addActivity } = useActivities();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filter state
  const [filterDay, setFilterDay] = useState('');
  const [filterType, setFilterType] = useState('');
  
  // Meeting modal state
  const [isMeetingModalVisible, setIsMeetingModalVisible] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [meetingForm, setMeetingForm] = useState({
    name: '',
    day: '',
    time: '',
    location: '',
    address: '',
    city: '',
    state: '',
    type: '',
    notes: '',
    isShared: false
  });
  
  // Reminder modal state
  const [isReminderModalVisible, setIsReminderModalVisible] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [reminderMinutes, setReminderMinutes] = useState(30);
  const [isRecurring, setIsRecurring] = useState(true);
  
  // Share modal state
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [shareableContent, setShareableContent] = useState('');
  
  const reminderOptions = [
    { value: 15, label: '15 minutes before' },
    { value: 30, label: '30 minutes before' },
    { value: 60, label: '1 hour before' },
    { value: 120, label: '2 hours before' }
  ];
  
  useEffect(() => {
    loadMeetings();
  }, []);
  
  const loadMeetings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userMeetings = await userMeetingOperations.getAllMeetings();
      setMeetings(userMeetings);
    } catch (err) {
      console.error('Error loading meetings:', err);
      setError('Unable to load your meetings. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCheckIn = (meeting) => {
    // Add this meeting attendance as an activity
    const now = new Date().toISOString();
    const newActivity = {
      type: 'meeting',
      name: meeting.name || 'AA Meeting',
      date: now,
      duration: 60, // Default to 1 hour
      notes: `Attended meeting at ${meeting.location || 'unknown location'}`
    };
    
    addActivity(newActivity)
      .then(() => {
        Alert.alert('Success', 'Meeting check-in recorded successfully!');
      })
      .catch(err => {
        console.error('Error recording meeting check-in:', err);
        Alert.alert('Error', 'Unable to record meeting check-in. Please try again.');
      });
  };
  
  const openAddressInMap = (address) => {
    if (!address) return;
    
    let url;
    if (Platform.OS === 'ios') {
      url = `maps://0,0?q=${encodeURI(address)}`;
    } else {
      url = `geo:0,0?q=${encodeURI(address)}`;
    }
    
    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          const browserUrl = `https://maps.google.com/?q=${encodeURI(address)}`;
          return Linking.openURL(browserUrl);
        }
      })
      .catch(err => {
        console.error('Error opening map:', err);
        Alert.alert('Error', 'Unable to open map application.');
      });
  };
  
  const openMeetingModal = (meeting = null) => {
    if (meeting) {
      setMeetingForm({
        name: meeting.name,
        day: meeting.day,
        time: meeting.time,
        location: meeting.location || '',
        address: meeting.address || '',
        city: meeting.city || '',
        state: meeting.state || '',
        type: meeting.type || '',
        notes: meeting.notes || '',
        isShared: meeting.isShared || false
      });
      setEditingMeeting(meeting);
    } else {
      setMeetingForm({
        name: '',
        day: DAYS_OF_WEEK[new Date().getDay()],
        time: new Date().getHours() + ':00',
        location: '',
        address: '',
        city: '',
        state: '',
        type: '',
        notes: '',
        isShared: false
      });
      setEditingMeeting(null);
    }
    
    setIsMeetingModalVisible(true);
  };
  
  const handleMeetingFormChange = (field, value) => {
    setMeetingForm(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const saveMeeting = async () => {
    // Validate required fields
    if (!meetingForm.name || !meetingForm.day || !meetingForm.time) {
      Alert.alert('Required Fields', 'Please enter a name, day, and time for the meeting.');
      return;
    }
    
    try {
      const meetingToSave = {
        ...meetingForm,
        id: editingMeeting?.id
      };
      
      const savedMeeting = await userMeetingOperations.saveMeeting(meetingToSave);
      
      // Refresh meetings list
      await loadMeetings();
      
      // Close modal
      setIsMeetingModalVisible(false);
      
      // Show success message
      Alert.alert(
        'Success',
        editingMeeting ? 'Meeting updated successfully.' : 'Meeting added successfully.'
      );
    } catch (err) {
      console.error('Error saving meeting:', err);
      Alert.alert('Error', 'Unable to save meeting. Please try again.');
    }
  };
  
  const deleteMeeting = async (meetingId) => {
    Alert.alert(
      'Delete Meeting',
      'Are you sure you want to delete this meeting?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await userMeetingOperations.deleteMeeting(meetingId);
              
              // Check if there's a calendar reminder for this meeting
              const reminder = await calendarReminderOperations.getCalendarReminderByMeetingId(meetingId);
              if (reminder) {
                // Delete the reminder
                await calendarReminderOperations.deleteCalendarReminder(reminder.id);
              }
              
              // Refresh meetings list
              await loadMeetings();
              
              // Close modal if it was open
              if (editingMeeting && editingMeeting.id === meetingId) {
                setIsMeetingModalVisible(false);
              }
              
              Alert.alert('Success', 'Meeting deleted successfully.');
            } catch (err) {
              console.error('Error deleting meeting:', err);
              Alert.alert('Error', 'Unable to delete meeting. Please try again.');
            }
          }
        }
      ]
    );
  };
  
  const showReminderModal = (meeting) => {
    setSelectedMeeting(meeting);
    setIsReminderModalVisible(true);
  };
  
  const saveReminder = async () => {
    if (!selectedMeeting) return;
    
    // Request permissions first
    const calendarPermission = await requestCalendarPermissions();
    const notificationPermission = await requestNotificationPermissions();
    
    if (!calendarPermission || !notificationPermission) {
      Alert.alert(
        'Permission Required',
        'Calendar and notification permissions are required to set reminders.',
        [{ text: 'OK', onPress: () => setIsReminderModalVisible(false) }]
      );
      return;
    }
    
    try {
      // Format the meeting time/day for calendar
      const meetingDate = new Date();
      // Set day of week
      const dayMapping = {
        'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
        'thursday': 4, 'friday': 5, 'saturday': 6
      };
      
      // Adjust to the next occurrence of this day
      const targetDay = dayMapping[selectedMeeting.day.toLowerCase()];
      const currentDay = meetingDate.getDay();
      const daysUntilTarget = (targetDay + 7 - currentDay) % 7;
      meetingDate.setDate(meetingDate.getDate() + daysUntilTarget);
      
      // Set time
      const [hours, minutes] = selectedMeeting.time.split(':').map(Number);
      meetingDate.setHours(hours, minutes, 0, 0);
      
      // Add to calendar
      const calendarEventId = await addMeetingToCalendar(
        {
          title: selectedMeeting.name,
          location: selectedMeeting.location,
          startDate: meetingDate,
          endDate: new Date(meetingDate.getTime() + 60 * 60 * 1000), // 1 hour duration
          notes: `Type: ${selectedMeeting.type || 'Not specified'}`,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          alarms: [{ relativeOffset: -reminderMinutes }]
        },
        { recurrence: isRecurring ? 'weekly' : null }
      );
      
      // Schedule notification
      const notificationId = await scheduleMeetingNotification(
        {
          title: 'AA Meeting Reminder',
          body: `Your meeting "${selectedMeeting.name}" is starting in ${reminderMinutes} minutes`,
          data: { meetingId: selectedMeeting.id },
          trigger: {
            seconds: meetingDate.getTime() / 1000 - (reminderMinutes * 60),
            repeats: isRecurring
          }
        }
      );
      
      // Save to database
      await calendarReminderOperations.saveCalendarReminder({
        meetingId: selectedMeeting.id,
        meetingName: selectedMeeting.name,
        meetingDay: selectedMeeting.day,
        meetingTime: selectedMeeting.time,
        location: selectedMeeting.location,
        calendarEventId,
        notificationId,
        reminderMinutes,
        isRecurring
      });
      
      Alert.alert(
        'Reminder Set',
        `You will be reminded ${reminderMinutes} minutes before the meeting.`,
        [{ text: 'OK', onPress: () => setIsReminderModalVisible(false) }]
      );
    } catch (err) {
      console.error('Error setting reminder:', err);
      Alert.alert(
        'Error',
        'Unable to set reminder. Please check your permissions and try again.',
        [{ text: 'OK', onPress: () => setIsReminderModalVisible(false) }]
      );
    }
  };
  
  const shareAllMeetings = async () => {
    try {
      // Get all shared meetings
      const sharedMeetings = await userMeetingOperations.getSharedMeetings();
      
      if (sharedMeetings.length === 0) {
        Alert.alert(
          'No Shared Meetings',
          'You have not marked any meetings as shareable. Please mark meetings as shareable first.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Format meetings as text
      const meetingsText = sharedMeetings.map(meeting => {
        let text = `${meeting.name}\n`;
        text += `${meeting.day} at ${meeting.time}\n`;
        if (meeting.location) text += `Location: ${meeting.location}\n`;
        if (meeting.address) text += `Address: ${meeting.address}\n`;
        if (meeting.city && meeting.state) text += `${meeting.city}, ${meeting.state}\n`;
        if (meeting.type) text += `Type: ${meeting.type}\n`;
        if (meeting.notes) text += `Notes: ${meeting.notes}\n`;
        return text;
      }).join('\n---\n\n');
      
      const shareMessage = `My AA Meetings:\n\n${meetingsText}\n\nShared via AA Recovery Tracker App`;
      
      // Set shareable content for modal
      setShareableContent(shareMessage);
      setIsShareModalVisible(true);
    } catch (err) {
      console.error('Error preparing meetings to share:', err);
      Alert.alert('Error', 'Unable to prepare meetings for sharing. Please try again.');
    }
  };
  
  const handleShare = async () => {
    try {
      await Share.share({
        message: shareableContent,
        title: 'My AA Meetings'
      });
      setIsShareModalVisible(false);
    } catch (err) {
      console.error('Error sharing meetings:', err);
      Alert.alert('Error', 'Unable to share meetings. Please try again.');
    }
  };
  
  const updateMeetingSharing = async (meetingId, isShared) => {
    try {
      await userMeetingOperations.updateSharingStatus(meetingId, isShared);
      await loadMeetings();
    } catch (err) {
      console.error('Error updating meeting sharing status:', err);
      Alert.alert('Error', 'Unable to update sharing status. Please try again.');
    }
  };
  
  const getFilteredMeetings = () => {
    return meetings.filter(meeting => {
      // Apply day filter
      if (filterDay && meeting.day.toLowerCase() !== filterDay.toLowerCase()) {
        return false;
      }
      
      // Apply type filter
      if (filterType && meeting.type && !meeting.type.toLowerCase().includes(filterType.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  };
  
  const renderMeetingFormModal = () => {
    return (
      <Modal
        visible={isMeetingModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsMeetingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalFormContent}>
            <Text style={styles.modalTitle}>
              {editingMeeting ? 'Edit Meeting' : 'Add New Meeting'}
            </Text>
            
            <ScrollView style={styles.formScrollView}>
              <Text style={styles.formLabel}>Meeting Name *</Text>
              <TextInput
                style={styles.formInput}
                value={meetingForm.name}
                onChangeText={(text) => handleMeetingFormChange('name', text)}
                placeholder="Enter meeting name"
              />
              
              <Text style={styles.formLabel}>Day of Week *</Text>
              <View style={styles.pickerContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {DAYS_OF_WEEK.map(day => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayPicker,
                        meetingForm.day === day && styles.dayPickerSelected
                      ]}
                      onPress={() => handleMeetingFormChange('day', day)}
                    >
                      <Text
                        style={[
                          styles.dayPickerText,
                          meetingForm.day === day && styles.dayPickerTextSelected
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <Text style={styles.formLabel}>Time *</Text>
              <TextInput
                style={styles.formInput}
                value={meetingForm.time}
                onChangeText={(text) => handleMeetingFormChange('time', text)}
                placeholder="Format: HH:MM (e.g. 19:30)"
              />
              
              <Text style={styles.formLabel}>Location</Text>
              <TextInput
                style={styles.formInput}
                value={meetingForm.location}
                onChangeText={(text) => handleMeetingFormChange('location', text)}
                placeholder="e.g. Community Center"
              />
              
              <Text style={styles.formLabel}>Address</Text>
              <TextInput
                style={styles.formInput}
                value={meetingForm.address}
                onChangeText={(text) => handleMeetingFormChange('address', text)}
                placeholder="Street address"
              />
              
              <View style={styles.cityStateRow}>
                <View style={styles.cityContainer}>
                  <Text style={styles.formLabel}>City</Text>
                  <TextInput
                    style={styles.formInput}
                    value={meetingForm.city}
                    onChangeText={(text) => handleMeetingFormChange('city', text)}
                    placeholder="City"
                  />
                </View>
                
                <View style={styles.stateContainer}>
                  <Text style={styles.formLabel}>State</Text>
                  <TextInput
                    style={styles.formInput}
                    value={meetingForm.state}
                    onChangeText={(text) => handleMeetingFormChange('state', text)}
                    placeholder="State"
                  />
                </View>
              </View>
              
              <Text style={styles.formLabel}>Meeting Type</Text>
              <View style={styles.pickerContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {MEETING_TYPES.map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typePicker,
                        meetingForm.type === type && styles.typePickerSelected
                      ]}
                      onPress={() => handleMeetingFormChange('type', type)}
                    >
                      <Text
                        style={[
                          styles.typePickerText,
                          meetingForm.type === type && styles.typePickerTextSelected
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <Text style={styles.formLabel}>Notes</Text>
              <TextInput
                style={[styles.formInput, styles.notesInput]}
                value={meetingForm.notes}
                onChangeText={(text) => handleMeetingFormChange('notes', text)}
                placeholder="Any additional information"
                multiline
                numberOfLines={4}
              />
              
              <View style={styles.shareContainer}>
                <Text style={styles.formLabel}>Share with others</Text>
                <TouchableOpacity 
                  style={styles.shareToggle}
                  onPress={() => handleMeetingFormChange('isShared', !meetingForm.isShared)}
                >
                  <View style={[
                    styles.toggleTrack,
                    meetingForm.isShared && styles.toggleTrackActive
                  ]}>
                    <View style={[
                      styles.toggleThumb,
                      meetingForm.isShared && styles.toggleThumbActive
                    ]} />
                  </View>
                </TouchableOpacity>
              </View>
            </ScrollView>
            
            <View style={styles.modalFormActions}>
              {editingMeeting && (
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalDeleteButton]}
                  onPress={() => deleteMeeting(editingMeeting.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#FFF" />
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setIsMeetingModalVisible(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={saveMeeting}
              >
                <Text style={styles.modalSaveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };
  
  const renderReminderModal = () => {
    if (!selectedMeeting) return null;
    
    return (
      <Modal
        visible={isReminderModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsReminderModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Reminder</Text>
            <Text style={styles.modalSubtitle}>{selectedMeeting.name}</Text>
            
            <Text style={styles.modalLabel}>Remind me:</Text>
            <View style={styles.reminderOptions}>
              {reminderOptions.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.reminderOption,
                    reminderMinutes === option.value && styles.reminderOptionSelected
                  ]}
                  onPress={() => setReminderMinutes(option.value)}
                >
                  <Text
                    style={[
                      styles.reminderOptionText,
                      reminderMinutes === option.value && styles.reminderOptionTextSelected
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.repeatContainer}>
              <Text style={styles.modalLabel}>Repeat weekly:</Text>
              <TouchableOpacity 
                style={styles.repeatToggle}
                onPress={() => setIsRecurring(!isRecurring)}
              >
                <View style={[
                  styles.toggleTrack,
                  isRecurring && styles.toggleTrackActive
                ]}>
                  <View style={[
                    styles.toggleThumb,
                    isRecurring && styles.toggleThumbActive
                  ]} />
                </View>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setIsReminderModalVisible(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={saveReminder}
              >
                <Text style={styles.modalSaveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };
  
  const renderShareModal = () => {
    return (
      <Modal
        visible={isShareModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsShareModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Share Meetings</Text>
            <Text style={styles.modalSubtitle}>The following meetings will be shared:</Text>
            
            <ScrollView style={styles.sharePreviewScroll}>
              <Text style={styles.sharePreviewText}>{shareableContent}</Text>
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setIsShareModalVisible(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleShare}
              >
                <Text style={styles.modalSaveButtonText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };
  
  const renderMeeting = (meeting) => {
    return (
      <View key={meeting.id} style={styles.meetingCard}>
        <View style={styles.meetingHeader}>
          <Text style={styles.meetingName}>{meeting.name}</Text>
          <Text style={styles.meetingTime}>{meeting.day} at {meeting.time}</Text>
        </View>
        
        <View style={styles.meetingBody}>
          {meeting.location && <Text style={styles.meetingLocation}>{meeting.location}</Text>}
          
          {meeting.address && (
            <TouchableOpacity
              style={styles.addressLink}
              onPress={() => openAddressInMap(
                `${meeting.address}, ${meeting.city || ''} ${meeting.state || ''}`
              )}
            >
              <Text style={styles.addressText}>
                {meeting.address}
                {meeting.city && meeting.state ? `, ${meeting.city}, ${meeting.state}` : ''}
              </Text>
              <Ionicons name="navigate-outline" size={16} color="#5C6BC0" />
            </TouchableOpacity>
          )}
          
          {meeting.type && <Text style={styles.meetingType}>Type: {meeting.type}</Text>}
          
          {meeting.notes && <Text style={styles.meetingNotes}>{meeting.notes}</Text>}
          
          <View style={styles.sharingStatus}>
            <Text style={styles.sharingLabel}>
              {meeting.isShared ? 'Shared with others' : 'Private meeting'}
            </Text>
            <TouchableOpacity
              onPress={() => updateMeetingSharing(meeting.id, !meeting.isShared)}
            >
              <Ionicons 
                name={meeting.isShared ? "eye-outline" : "eye-off-outline"} 
                size={22} 
                color={meeting.isShared ? "#5C6BC0" : "#999"}
              />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.meetingActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.checkInButton]}
            onPress={() => handleCheckIn(meeting)}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />
            <Text style={styles.actionButtonText}>Check In</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.reminderButton]}
            onPress={() => showReminderModal(meeting)}
          >
            <Ionicons name="notifications-outline" size={18} color="#FFF" />
            <Text style={styles.actionButtonText}>Reminder</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={() => openMeetingModal(meeting)}
          >
            <Ionicons name="create-outline" size={18} color="#FFF" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  const filteredMeetings = getFilteredMeetings();
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My AA Meetings</Text>
      </View>
      
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => openMeetingModal()}
        >
          <Ionicons name="add-circle-outline" size={20} color="#FFF" />
          <Text style={styles.addButtonText}>Add Meeting</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.shareButton}
          onPress={shareAllMeetings}
        >
          <Ionicons name="share-social-outline" size={20} color="#FFF" />
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.filterContainer}>
        <TextInput
          style={styles.filterInput}
          placeholder="Filter by day (e.g., Monday)"
          value={filterDay}
          onChangeText={setFilterDay}
        />
        
        <TextInput
          style={styles.filterInput}
          placeholder="Filter by type (e.g., Open)"
          value={filterType}
          onChangeText={setFilterType}
        />
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      <ScrollView style={styles.meetingsContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#5C6BC0" />
            <Text style={styles.loadingText}>Loading meetings...</Text>
          </View>
        ) : (
          <>
            {filteredMeetings.length > 0 ? (
              filteredMeetings.map(renderMeeting)
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={64} color="#CCC" />
                <Text style={styles.emptyStateTitle}>No Meetings Found</Text>
                <Text style={styles.emptyStateText}>
                  {meetings.length === 0 
                    ? "You haven't added any meetings yet. Tap 'Add Meeting' to get started."
                    : "No meetings match your current filters. Try adjusting your filters or add more meetings."}
                </Text>
                {meetings.length === 0 && (
                  <TouchableOpacity
                    style={styles.emptyStateButton}
                    onPress={() => openMeetingModal()}
                  >
                    <Text style={styles.emptyStateButtonText}>Add Your First Meeting</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>
      
      {renderMeetingFormModal()}
      {renderReminderModal()}
      {renderShareModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#7E57C2',
    padding: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  actionBar: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  addButton: {
    backgroundColor: '#5C6BC0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 8,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  shareButton: {
    backgroundColor: '#26A69A',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  filterContainer: {
    backgroundColor: '#FFF',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterInput: {
    backgroundColor: '#F0F2F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
  },
  meetingsContainer: {
    padding: 16,
  },
  meetingCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  meetingHeader: {
    padding: 16,
    backgroundColor: '#7E57C2',
  },
  meetingName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  meetingTime: {
    fontSize: 14,
    color: '#E1E1FC',
  },
  meetingBody: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  meetingLocation: {
    fontSize: 16,
    color: '#424242',
    marginBottom: 8,
  },
  addressLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#5C6BC0',
    marginRight: 4,
  },
  meetingType: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  meetingNotes: {
    fontSize: 14,
    color: '#616161',
    fontStyle: 'italic',
    marginTop: 8,
    marginBottom: 8,
  },
  sharingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  sharingLabel: {
    fontSize: 14,
    color: '#757575',
  },
  meetingActions: {
    flexDirection: 'row',
    padding: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    margin: 4,
    borderRadius: 4,
  },
  checkInButton: {
    backgroundColor: '#43A047',
  },
  reminderButton: {
    backgroundColor: '#5C6BC0',
  },
  editButton: {
    backgroundColor: '#FF9800',
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#757575',
  },
  emptyStateText: {
    marginTop: 8,
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
  emptyStateButton: {
    marginTop: 24,
    backgroundColor: '#5C6BC0',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    width: '85%',
    maxHeight: '80%',
    padding: 24,
  },
  modalFormContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    width: '90%',
    maxHeight: '90%',
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#555',
  },
  formScrollView: {
    maxHeight: 400,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#555',
    marginTop: 12,
  },
  formInput: {
    backgroundColor: '#F0F2F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  cityStateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cityContainer: {
    flex: 3,
    marginRight: 8,
  },
  stateContainer: {
    flex: 2,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  dayPicker: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F0F2F5',
    borderRadius: 20,
    marginRight: 8,
  },
  dayPickerSelected: {
    backgroundColor: '#D1C4E9',
    borderColor: '#7E57C2',
    borderWidth: 1,
  },
  dayPickerText: {
    color: '#666',
    fontSize: 14,
  },
  dayPickerTextSelected: {
    color: '#5E35B1',
    fontWeight: 'bold',
  },
  typePicker: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F0F2F5',
    borderRadius: 20,
    marginRight: 8,
  },
  typePickerSelected: {
    backgroundColor: '#D1C4E9',
    borderColor: '#7E57C2',
    borderWidth: 1,
  },
  typePickerText: {
    color: '#666',
    fontSize: 14,
  },
  typePickerTextSelected: {
    color: '#5E35B1',
    fontWeight: 'bold',
  },
  shareContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  shareToggle: {
    padding: 4,
  },
  reminderOptions: {
    marginBottom: 16,
  },
  reminderOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F0F2F5',
  },
  reminderOptionSelected: {
    backgroundColor: '#E8EAF6',
    borderColor: '#5C6BC0',
    borderWidth: 1,
  },
  reminderOptionText: {
    fontSize: 16,
    color: '#666',
  },
  reminderOptionTextSelected: {
    color: '#5C6BC0',
    fontWeight: 'bold',
  },
  repeatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  repeatToggle: {
    padding: 4,
  },
  toggleTrack: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
  },
  toggleTrackActive: {
    backgroundColor: '#D1C4E9',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#BDBDBD',
    margin: 2,
  },
  toggleThumbActive: {
    backgroundColor: '#7E57C2',
    transform: [{ translateX: 20 }],
  },
  modalFormActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDeleteButton: {
    backgroundColor: '#EF5350',
    marginRight: 'auto',
    width: 42,
  },
  modalCancelButton: {
    backgroundColor: '#F0F2F5',
  },
  modalCancelButtonText: {
    fontWeight: 'bold',
    color: '#666',
  },
  modalSaveButton: {
    backgroundColor: '#5C6BC0',
  },
  modalSaveButtonText: {
    fontWeight: 'bold',
    color: '#FFF',
  },
  sharePreviewScroll: {
    maxHeight: 300,
    backgroundColor: '#F0F2F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  sharePreviewText: {
    fontSize: 14,
    color: '#333',
  }
});

export default MeetingsScreen;