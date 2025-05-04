import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import SpiritualFitnessGauge from '../components/SpiritualFitnessGauge';
import { formatNumberWithCommas, calculateSobrietyDays, calculateSobrietyYears } from '../utils/calculations';

function DashboardScreen() {
  const { user, spiritualFitness, loadSpiritualFitness } = useUser();
  const { theme } = useTheme();
  const [sobrietyDays, setSobrietyDays] = useState(0);
  const [sobrietyYears, setSobrietyYears] = useState(0);
  const { width: screenWidth } = Dimensions.get('window');

  useEffect(() => {
    loadSpiritualFitness();
    
    if (user && user.sobrietyDate) {
      setSobrietyDays(calculateSobrietyDays(user.sobrietyDate));
      setSobrietyYears(calculateSobrietyYears(user.sobrietyDate, 2));
    }
  }, [user]);

  // Create themed styles
  const themedStyles = {
    container: {
      ...styles.container,
      backgroundColor: theme.background,
    },
    header: {
      ...styles.header,
      backgroundColor: theme.primary,
    },
    fitnessCard: {
      ...styles.fitnessCard,
      backgroundColor: theme.card,
      ...theme.shadow,
    },
    recentActivitiesCard: {
      ...styles.recentActivitiesCard,
      backgroundColor: theme.card,
      ...theme.shadow,
    },
    cardTitle: {
      ...styles.cardTitle,
      color: theme.text,
    },
    breakdownItem: {
      ...styles.breakdownItem,
      borderBottomColor: theme.divider,
    },
    breakdownLabel: {
      ...styles.breakdownLabel,
      color: theme.textSecondary,
    },
    breakdownValue: {
      ...styles.breakdownValue,
      color: theme.text,
    },
    activityItem: {
      ...styles.activityItem,
      borderBottomColor: theme.divider,
    },
    activityType: {
      ...styles.activityType,
      color: theme.text,
    },
    activityDate: {
      ...styles.activityDate,
      color: theme.textSecondary,
    },
    activityNotes: {
      ...styles.activityNotes,
      color: theme.text,
    },
    emptyText: {
      ...styles.emptyText,
      color: theme.textSecondary,
    },
  };

  return (
    <ScrollView style={themedStyles.container}>
      <View style={themedStyles.header}>
        <Text style={styles.greeting}>Hello, {user?.firstName || 'Friend'}</Text>
        
        {sobrietyDays > 0 ? (
          <View style={styles.sobrietyContainer}>
            <Text style={styles.sobrietyYears}>
              {sobrietyYears.toFixed(2)} Years
            </Text>
            <Text style={styles.sobrietyDays}>
              {formatNumberWithCommas(sobrietyDays)} Days
            </Text>
          </View>
        ) : (
          <Text style={styles.sobrietyDays}>
            Set your sobriety date in Profile
          </Text>
        )}
      </View>

      <View style={themedStyles.fitnessCard}>
        <Text style={themedStyles.cardTitle}>Spiritual Fitness</Text>
        
        {/* Replace the text score with our gauge component */}
        <View style={styles.gaugeContainer}>
          <SpiritualFitnessGauge 
            value={spiritualFitness?.overall || 0} 
            width={Math.min(350, screenWidth - 60)}
            height={160}
            maxValue={10}
          />
        </View>
        
        {spiritualFitness && (
          <View style={styles.breakdownContainer}>
            <View style={themedStyles.breakdownItem}>
              <Text style={themedStyles.breakdownLabel}>Prayer & Meditation</Text>
              <Text style={themedStyles.breakdownValue}>{spiritualFitness.prayer.toFixed(2)}</Text>
            </View>
            <View style={themedStyles.breakdownItem}>
              <Text style={themedStyles.breakdownLabel}>Meetings</Text>
              <Text style={themedStyles.breakdownValue}>{spiritualFitness.meetings.toFixed(2)}</Text>
            </View>
            <View style={themedStyles.breakdownItem}>
              <Text style={themedStyles.breakdownLabel}>Literature</Text>
              <Text style={themedStyles.breakdownValue}>{spiritualFitness.literature.toFixed(2)}</Text>
            </View>
            <View style={themedStyles.breakdownItem}>
              <Text style={themedStyles.breakdownLabel}>Service</Text>
              <Text style={themedStyles.breakdownValue}>{spiritualFitness.service.toFixed(2)}</Text>
            </View>
            <View style={themedStyles.breakdownItem}>
              <Text style={themedStyles.breakdownLabel}>Sponsorship</Text>
              <Text style={themedStyles.breakdownValue}>{spiritualFitness.sponsorship.toFixed(2)}</Text>
            </View>
          </View>
        )}
      </View>

      <View style={themedStyles.recentActivitiesCard}>
        <Text style={themedStyles.cardTitle}>Recent Activities</Text>
        {user?.recentActivities?.length > 0 ? (
          user.recentActivities.map((activity, index) => (
            <View key={index} style={themedStyles.activityItem}>
              <Text style={themedStyles.activityType}>{activity.type}</Text>
              <Text style={themedStyles.activityDate}>{new Date(activity.date).toLocaleDateString()}</Text>
              <Text style={themedStyles.activityNotes}>{activity.notes}</Text>
            </View>
          ))
        ) : (
          <Text style={themedStyles.emptyText}>No recent activities. Log your first activity!</Text>
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
  sobrietyContainer: {
    marginTop: 10,
  },
  sobrietyYears: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 5,
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
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
});

export default DashboardScreen;