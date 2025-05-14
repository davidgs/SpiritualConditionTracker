import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useActivities } from '../contexts/ActivitiesContext';
import Icon from 'react-native-vector-icons/FontAwesome';
import ActivityForm from './ActivityForm';

/**
 * ActivityLog component displays the activity form and manages
 * the success state after logging an activity
 */
function ActivityLog({ navigation }) {
  const { theme } = useTheme();
  const [logSuccess, setLogSuccess] = useState(false);
  
  const handleSuccess = () => {
    setLogSuccess(true);
    // Reset success message after 3 seconds
    setTimeout(() => setLogSuccess(false), 3000);
  };
  
  const handleBackToDashboard = () => {
    navigation.navigate('Dashboard');
  };
  
  const themedStyles = {
    container: {
      backgroundColor: theme.background,
    },
    title: {
      color: theme.text,
    },
    backButton: {
      color: theme.textSecondary,
    },
    successContainer: {
      backgroundColor: theme.successBackground,
    },
    successText: {
      color: theme.success,
    }
  };
  
  return (
    <View style={[styles.container, themedStyles.container]}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleBackToDashboard}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={20} style={themedStyles.backButton} />
        </TouchableOpacity>
        <Text style={[styles.title, themedStyles.title]}>Log Activity</Text>
      </View>
      
      {logSuccess && (
        <View style={[styles.successContainer, themedStyles.successContainer]}>
          <Icon name="check-circle" size={20} color={theme.success} style={styles.successIcon} />
          <Text style={[styles.successText, themedStyles.successText]}>
            Activity logged successfully!
          </Text>
        </View>
      )}
      
      <ActivityForm onSuccess={handleSuccess} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
    marginRight: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  successIcon: {
    marginRight: 10,
  },
  successText: {
    fontSize: 16,
    fontWeight: '500',
  }
});

export default ActivityLog;