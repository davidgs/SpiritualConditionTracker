import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useUser } from '../contexts/UserContext';
import { formatNumberWithCommas, calculateSobrietyDays } from '../utils/calculations';

function DashboardScreen() {
  const { user, spiritualFitness, loadSpiritualFitness } = useUser();
  const [sobrietyDays, setSobrietyDays] = useState(0);

  useEffect(() => {
    loadSpiritualFitness();
    
    if (user && user.sobrietyDate) {
      setSobrietyDays(calculateSobrietyDays(user.sobrietyDate));
    }
  }, [user]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.firstName || 'Friend'}</Text>
        <Text style={styles.sobrietyDays}>
          {sobrietyDays > 0 
            ? `${formatNumberWithCommas(sobrietyDays)} days of sobriety` 
            : 'Set your sobriety date in Profile'}
        </Text>
      </View>

      <View style={styles.fitnessCard}>
        <Text style={styles.cardTitle}>Spiritual Fitness</Text>
        <Text style={styles.fitnessScore}>
          {spiritualFitness?.overall.toFixed(2) || '0.00'}
        </Text>
        
        {spiritualFitness && (
          <View style={styles.breakdownContainer}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Prayer & Meditation</Text>
              <Text style={styles.breakdownValue}>{spiritualFitness.prayer.toFixed(2)}</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Meetings</Text>
              <Text style={styles.breakdownValue}>{spiritualFitness.meetings.toFixed(2)}</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Literature</Text>
              <Text style={styles.breakdownValue}>{spiritualFitness.literature.toFixed(2)}</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Service</Text>
              <Text style={styles.breakdownValue}>{spiritualFitness.service.toFixed(2)}</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Sponsorship</Text>
              <Text style={styles.breakdownValue}>{spiritualFitness.sponsorship.toFixed(2)}</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.recentActivitiesCard}>
        <Text style={styles.cardTitle}>Recent Activities</Text>
        {user?.recentActivities?.length > 0 ? (
          user.recentActivities.map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <Text style={styles.activityType}>{activity.type}</Text>
              <Text style={styles.activityDate}>{new Date(activity.date).toLocaleDateString()}</Text>
              <Text style={styles.activityNotes}>{activity.notes}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No recent activities. Log your first activity!</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#4a86e8',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  sobrietyDays: {
    fontSize: 16,
    color: 'white',
    marginTop: 5,
  },
  fitnessCard: {
    margin: 15,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  fitnessScore: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4a86e8',
    textAlign: 'center',
    marginVertical: 10,
  },
  breakdownContainer: {
    marginTop: 15,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#666',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  recentActivitiesCard: {
    margin: 15,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  activityItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  activityDate: {
    fontSize: 14,
    color: '#666',
    marginVertical: 3,
  },
  activityNotes: {
    fontSize: 14,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 20,
  },
});

export default DashboardScreen;