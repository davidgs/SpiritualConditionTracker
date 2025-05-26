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

// Contexts
import { useActivities, ACTIVITY_TYPES } from '../contexts/ActivitiesContext';

// Utils
import { formatDate } from '../utils/calculations';

const ActivityLogScreen = () => {
  const { 
    activities, 
    isLoading, 
    addActivity, 
    deleteActivity,
    loadActivities
  } = useActivities();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState('meeting');
  const [duration, setDuration] = useState('60');
  const [notes, setNotes] = useState('');
  const [filterType, setFilterType] = useState(null);
  
  // Load activities on mount
  useEffect(() => {
    loadActivities();
  }, []);
  
  // Filter activities by selected type
  const filteredActivities = filterType 
    ? activities.filter(activity => activity.type === filterType)
    : activities;
  
  // Format activity data for display
  const renderActivity = ({ item }) => {
    const activityType = ACTIVITY_TYPES[item.type] || {
      label: 'Activity',
      icon: 'check',
      color: '#3498db'
    };
    
    return (
      <View style={styles.activityItem}>
        <View style={styles.activityIcon}>
          <Icon 
            name={activityType.icon} 
            size={20} 
            color="#fff" 
            style={{ padding: 10 }}
          />
        </View>
        <View style={styles.activityInfo}>
          <View style={styles.activityHeader}>
            <Text style={styles.activityType}>{activityType.label}</Text>
            <Text style={styles.activityDate}>
              {formatDate(item.date, { format: 'medium', includeTime: true })}
            </Text>
          </View>
          {item.duration > 0 && (
            <Text style={styles.duration}>{item.duration} minutes</Text>
          )}
          {item.notes && (
            <Text style={styles.notes}>{item.notes}</Text>
          )}
        </View>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => deleteActivity(item.id)}
        >
          <Icon name="trash" size={16} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    );
  };
  
  // Type selection button for modal
  const TypeButton = ({ type, label, icon }) => (
    <TouchableOpacity
      style={[
        styles.typeButton,
        selectedType === type && styles.typeButtonSelected
      ]}
      onPress={() => setSelectedType(type)}
    >
      <Icon 
        name={icon} 
        size={20} 
        color={selectedType === type ? '#fff' : '#3498db'} 
      />
      <Text 
        style={[
          styles.typeButtonText,
          selectedType === type && styles.typeButtonTextSelected
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
  
  // Type filter button for list
  const FilterButton = ({ type, label, icon }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filterType === type && styles.filterButtonSelected
      ]}
      onPress={() => setFilterType(filterType === type ? null : type)}
    >
      <Icon 
        name={icon} 
        size={16} 
        color={filterType === type ? '#fff' : '#7f8c8d'} 
      />
      <Text 
        style={[
          styles.filterButtonText,
          filterType === type && styles.filterButtonTextSelected
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
  
  // Handle saving a new activity
  const handleSaveActivity = () => {
    const activityData = {
      type: selectedType,
      date: new Date().toISOString(),
      duration: parseInt(duration) || 0,
      notes: notes
    };
    
    addActivity(activityData);
    
    // Reset form
    setSelectedType('meeting');
    setDuration('60');
    setNotes('');
    setModalVisible(false);
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Recovery Activities</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Icon name="plus" size={16} color="#fff" />
            <Text style={styles.addButtonText}>Add Activity</Text>
          </TouchableOpacity>
        </View>
        
        {/* Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {Object.entries(ACTIVITY_TYPES).map(([type, details]) => (
            <FilterButton 
              key={type}
              type={type}
              label={details.label}
              icon={details.icon}
            />
          ))}
        </ScrollView>
        
        {/* Activities List */}
        {isLoading ? (
          <View style={styles.centered}>
            <Text>Loading activities...</Text>
          </View>
        ) : filteredActivities.length === 0 ? (
          <View style={styles.centered}>
            <Icon name="list-alt" size={50} color="#bdc3c7" />
            <Text style={styles.emptyText}>
              {filterType 
                ? `No ${ACTIVITY_TYPES[filterType]?.label || ''} activities found`
                : 'No activities logged yet'}
            </Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.emptyButtonText}>Log Your First Activity</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredActivities}
            renderItem={renderActivity}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
          />
        )}
        
        {/* Add Activity Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Log Recovery Activity</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Icon name="times" size={20} color="#7f8c8d" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalContent}>
                <Text style={styles.inputLabel}>Activity Type</Text>
                <View style={styles.typeButtons}>
                  {Object.entries(ACTIVITY_TYPES).map(([type, details]) => (
                    <TypeButton 
                      key={type}
                      type={type}
                      label={details.label}
                      icon={details.icon}
                    />
                  ))}
                </View>
                
                <Text style={styles.inputLabel}>Duration (minutes)</Text>
                <TextInput
                  style={styles.input}
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="number-pad"
                  placeholder="Enter duration in minutes"
                />
                
                <Text style={styles.inputLabel}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.notesInput]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add any notes about this activity"
                  multiline
                />
                
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={handleSaveActivity}
                >
                  <Text style={styles.saveButtonText}>Save Activity</Text>
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
    paddingBottom: 12
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8
  },
  filterButtonSelected: {
    backgroundColor: '#3498db'
  },
  filterButtonText: {
    color: '#7f8c8d',
    fontSize: 12,
    marginLeft: 4
  },
  filterButtonTextSelected: {
    color: '#fff'
  },
  list: {
    paddingBottom: 20
  },
  activityItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  activityIcon: {
    width: 40,
    backgroundColor: '#3498db',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  activityInfo: {
    flex: 1,
    padding: 12
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  activityType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50'
  },
  activityDate: {
    fontSize: 12,
    color: '#7f8c8d'
  },
  duration: {
    fontSize: 14,
    color: '#3498db',
    marginBottom: 4
  },
  notes: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic'
  },
  deleteButton: {
    padding: 12,
    justifyContent: 'center'
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
    marginBottom: 20
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
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
    padding: 10,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    width: '48%'
  },
  typeButtonSelected: {
    backgroundColor: '#3498db'
  },
  typeButtonText: {
    color: '#2c3e50',
    marginLeft: 8
  },
  typeButtonTextSelected: {
    color: '#fff'
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

export default ActivityLogScreen;