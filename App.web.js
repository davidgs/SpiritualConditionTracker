import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Button, SafeAreaView, ActivityIndicator, Platform } from 'react-native';

// Web-specific mock database implementation
const database = {
  initDatabase: () => Promise.resolve(true),
  closeDatabase: () => Promise.resolve(true),
  userOperations: {
    createUser: () => Promise.resolve('web_user_1'),
    getUserById: () => Promise.resolve({ name: 'Web Test User', sobriety_date: '2022-01-01' })
  },
  activityOperations: {
    createActivity: () => Promise.resolve('web_activity_1'),
    getUserActivities: () => Promise.resolve([])
  },
  spiritualFitnessOperations: {
    calculateSpiritualFitness: () => Promise.resolve({
      score: 75.25,
      details: { prayer: 8, meditation: 7, reading: 6, meeting: 9, service: 8 }
    })
  },
  meetingOperations: {
    createMeeting: () => Promise.resolve('web_meeting_1'),
    getSharedMeetings: () => Promise.resolve([])
  }
};

export default function App() {
  const [dbStatus, setDbStatus] = useState('Not initialized');
  const [testUserId, setTestUserId] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Using Web-specific App implementation");
    initDb();
  }, []);

  const initDb = async () => {
    try {
      console.log("Starting web database initialization...");
      await database.initDatabase();
      console.log("Web database initialized successfully!");
      setDbStatus('Initialized');
      log('Database initialized successfully on web');
      setLoading(false);
    } catch (error) {
      console.error("Database initialization error:", error);
      setDbStatus(`Error: ${error.message}`);
      log(`Database init error: ${error.message}`);
      setLoading(false);
    }
  };

  const log = (message) => {
    console.log(message);
    setTestResults(prev => [...prev, message]);
  };

  const clearLogs = () => {
    setTestResults([]);
  };

  const createTestUser = async () => {
    try {
      const userId = await database.userOperations.createUser({
        name: 'Test User',
        sobrietyDate: '2020-01-01',
        homeGroup: 'Thursday Night Group',
        phone: '555-123-4567',
        email: 'test@example.com',
        privacySettings: { 
          shareLocation: false, 
          shareActivities: true 
        }
      });
      
      setTestUserId(userId);
      log(`Created test user with ID: ${userId}`);
    } catch (error) {
      log(`Error creating user: ${error.message}`);
    }
  };

  const createTestActivity = async () => {
    if (!testUserId) {
      log('Create a test user first');
      return;
    }

    try {
      const activityId = await database.activityOperations.createActivity({
        userId: testUserId,
        type: 'prayer',
        duration: 15,
        notes: 'Morning prayer'
      });
      
      log(`Created activity with ID: ${activityId}`);
    } catch (error) {
      log(`Error creating activity: ${error.message}`);
    }
  };

  const calculateSpiritualFitness = async () => {
    if (!testUserId) {
      log('Create a test user first');
      return;
    }

    try {
      const fitness = await database.spiritualFitnessOperations.calculateSpiritualFitness(testUserId);
      log(`Spiritual fitness: ${fitness.score.toFixed(2)}`);
      log(`Details: ${JSON.stringify(fitness.details)}`);
    } catch (error) {
      log(`Error calculating spiritual fitness: ${error.message}`);
    }
  };

  const getUserActivities = async () => {
    if (!testUserId) {
      log('Create a test user first');
      return;
    }

    try {
      const activities = await database.activityOperations.getUserActivities(testUserId);
      log(`Found ${activities.length} activities`);
      
      activities.forEach(activity => {
        log(`- ${activity.type}: ${activity.duration} minutes`);
      });
    } catch (error) {
      log(`Error getting activities: ${error.message}`);
    }
  };

  const createTestMeeting = async () => {
    if (!testUserId) {
      log('Create a test user first');
      return;
    }

    try {
      const meetingId = await database.meetingOperations.createMeeting({
        name: 'Thursday Night Beginners',
        day: 'thursday',
        time: '19:00',
        location: 'Community Center',
        address: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zip: '90210',
        type: 'open',
        notes: 'Beginner-friendly meeting',
        shared: true,
        createdBy: testUserId
      });
      
      log(`Created meeting with ID: ${meetingId}`);
    } catch (error) {
      log(`Error creating meeting: ${error.message}`);
    }
  };

  const getMeetings = async () => {
    try {
      const meetings = await database.meetingOperations.getSharedMeetings();
      log(`Found ${meetings.length} shared meetings`);
      
      meetings.forEach(meeting => {
        log(`- ${meeting.name} (${meeting.day}, ${meeting.time})`);
      });
    } catch (error) {
      log(`Error getting meetings: ${error.message}`);
    }
  };

  // Loading screen while database is initializing
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Initializing database...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>AA Recovery Tracker</Text>
      <Text style={styles.subtitle}>Web Version</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Database Status:</Text>
        <Text style={[
          styles.statusValue, 
          dbStatus === 'Initialized' ? styles.statusGood : 
          dbStatus.startsWith('Error') ? styles.statusBad : styles.statusPending
        ]}>
          {dbStatus}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Create Test User" onPress={createTestUser} />
        <Button title="Create Activity" onPress={createTestActivity} />
        <Button title="Create Meeting" onPress={createTestMeeting} />
        <Button title="Calculate Spiritual Fitness" onPress={calculateSpiritualFitness} />
        <Button title="Get Activities" onPress={getUserActivities} />
        <Button title="Get Meetings" onPress={getMeetings} />
        <Button title="Clear Logs" onPress={clearLogs} color="#999" />
      </View>
      
      <Text style={styles.logsTitle}>Test Results:</Text>
      <ScrollView style={styles.logs}>
        {testResults.map((result, index) => (
          <Text key={index} style={styles.logLine}>
            {result}
          </Text>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#7f8c8d',
    marginBottom: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  statusGood: {
    color: 'green',
  },
  statusBad: {
    color: 'red',
  },
  statusPending: {
    color: 'orange',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 15,
  },
  logsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  logs: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  logLine: {
    fontSize: 14,
    marginBottom: 5,
    color: '#34495e',
    fontFamily: 'monospace',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#4b5563',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  errorTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  errorText: {
    marginTop: 8,
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
  },
});