import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Modal,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from 'react-native-vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useActivities } from '../contexts/ActivitiesContext';

const ActivityLogScreen = () => {
  const { activities, loading, addActivity, deleteActivity } = useActivities();
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // New activity form state
  const [activityType, setActivityType] = useState('meeting');
  const [activityName, setActivityName] = useState('');
  const [activityDate, setActivityDate] = useState(new Date());
  const [activityDuration, setActivityDuration] = useState('60');
  const [activityNotes, setActivityNotes] = useState('');
  
  // List of activity types
  const activityTypes = [
    { id: 'meeting', label: 'Meeting', icon: 'people' },
    { id: 'meditation', label: 'Meditation', icon: 'leaf' },
    { id: 'reading', label: 'Reading', icon: 'book' },
    { id: 'service', label: 'Service', icon: 'hand-left' },
    { id: 'stepwork', label: 'Step Work', icon: 'list' },
    { id: 'sponsorship', label: 'Sponsorship', icon: 'person' },
  ];
  
  // Handle form submission
  const handleSubmit = async () => {
    const newActivity = {
      type: activityType,
      name: activityName,
      date: activityDate.toISOString(),
      duration: parseInt(activityDuration, 10) || 0,
      notes: activityNotes,
    };
    
    await addActivity(newActivity);
    resetForm();
    setIsAddModalVisible(false);
  };
  
  // Reset form fields
  const resetForm = () => {
    setActivityType('meeting');
    setActivityName('');
    setActivityDate(new Date());
    setActivityDuration('60');
    setActivityNotes('');
  };
  
  // Handle date change
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || activityDate;
    setShowDatePicker(Platform.OS === 'ios');
    setActivityDate(currentDate);
  };
  
  // Render activity item
  const renderActivityItem = (activity) => {
    return (
      <View key={activity.id} style={styles.activityItem}>
        <View style={styles.activityIconContainer}>
          <Ionicons 
            name={getActivityIcon(activity.type)} 
            size={24} 
            color="#3b82f6" 
          />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityName}>{activity.name}</Text>
          <Text style={styles.activityMeta}>
            {new Date(activity.date).toLocaleDateString()} • {activity.duration} min
          </Text>
          {activity.notes ? (
            <Text style={styles.activityNotes} numberOfLines={2}>
              {activity.notes}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => deleteActivity(activity.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    );
  };
  
  // Helper function to get icon for activity type
  const getActivityIcon = (type) => {
    const activityType = activityTypes.find(t => t.id === type);
    return activityType ? activityType.icon : 'checkmark-circle';
  };
  
  // Render add activity modal
  const renderAddActivityModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isAddModalVisible}
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Activity</Text>
              <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <Text style={styles.inputLabel}>Activity Type</Text>
              <View style={styles.typeButtonsContainer}>
                {activityTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeButton,
                      activityType === type.id && styles.typeButtonActive
                    ]}
                    onPress={() => setActivityType(type.id)}
                  >
                    <Ionicons 
                      name={type.icon} 
                      size={20} 
                      color={activityType === type.id ? '#fff' : '#3b82f6'} 
                    />
                    <Text 
                      style={[
                        styles.typeButtonText,
                        activityType === type.id && styles.typeButtonTextActive
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={styles.inputLabel}>Activity Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Name your activity"
                value={activityName}
                onChangeText={setActivityName}
              />
              
              <Text style={styles.inputLabel}>Date</Text>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Text>
                  {activityDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={activityDate}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                />
              )}
              
              <Text style={styles.inputLabel}>Duration (minutes)</Text>
              <TextInput
                style={styles.input}
                placeholder="Duration in minutes"
                keyboardType="numeric"
                value={activityDuration}
                onChangeText={setActivityDuration}
              />
              
              <Text style={styles.inputLabel}>Notes (optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add notes about your activity"
                multiline
                numberOfLines={4}
                value={activityNotes}
                onChangeText={setActivityNotes}
              />
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setIsAddModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSubmit}
              >
                <Text style={styles.saveButtonText}>Save Activity</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity Log</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAddModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading activities...</Text>
          </View>
        ) : activities.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No Activities Yet</Text>
            <Text style={styles.emptySubtitle}>
              Log your recovery activities to build your spiritual fitness.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setIsAddModalVisible(true)}
            >
              <Text style={styles.emptyButtonText}>Add Your First Activity</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.activitiesList}>
            {activities.map(activity => renderActivityItem(activity))}
          </View>
        )}
      </ScrollView>
      
      {renderAddActivityModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    backgroundColor: '#3b82f6',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  activitiesList: {
    padding: 16,
  },
  activityItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ebf5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  activityMeta: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  activityNotes: {
    fontSize: 14,
    color: '#4b5563',
  },
  deleteButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
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
    maxHeight: '70%',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dateInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  typeButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ebf5ff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 4,
  },
  typeButtonActive: {
    backgroundColor: '#3b82f6',
  },
  typeButtonText: {
    color: '#3b82f6',
    fontWeight: '500',
    marginLeft: 4,
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cancelButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#6b7280',
    fontWeight: '500',
    fontSize: 16,
  },
  saveButton: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ActivityLogScreen;