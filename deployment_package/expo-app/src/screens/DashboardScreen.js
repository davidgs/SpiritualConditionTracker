import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Image } from 'react-native';
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
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 8,
      color: theme.text,
    },
    helpText: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 10,
      lineHeight: 20,
    },
    calculationItem: {
      flexDirection: 'row',
      marginBottom: 6,
      paddingLeft: 5,
    },
    calculationLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.text,
      width: 160,
    },
    calculationValue: {
      fontSize: 14,
      color: theme.textSecondary,
      flex: 1,
    },
  };

  return (
    <ScrollView style={themedStyles.container}>
      <View style={themedStyles.header}>
        <View style={styles.headerTop}>
          <View style={styles.textContainer}>
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
          
          <Image 
            source={require('../../assets/icon.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>
      </View>

      <View style={themedStyles.fitnessCard}>
        <Text style={themedStyles.cardTitle}>Spiritual Fitness</Text>
        
        {/* Replace the text score with our gauge component */}
        <View style={styles.gaugeContainer}>
          <SpiritualFitnessGauge 
            value={spiritualFitness?.score || 0} 
            width={Math.min(350, screenWidth - 60)}
            height={120}
            maxValue={100}
          />
        </View>
        
        {spiritualFitness && (
          <>
            <View style={styles.breakdownContainer}>
              <Text style={themedStyles.sectionTitle}>Score Breakdown</Text>
              {spiritualFitness.breakdown && Object.keys(spiritualFitness.breakdown).map((type, index) => (
                <View key={index} style={themedStyles.breakdownItem}>
                  <Text style={themedStyles.breakdownLabel}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                  <Text style={themedStyles.breakdownValue}>{spiritualFitness.breakdown[type].score} pts</Text>
                </View>
              ))}
              {spiritualFitness.varietyBonus > 0 && (
                <View style={themedStyles.breakdownItem}>
                  <Text style={themedStyles.breakdownLabel}>Variety Bonus</Text>
                  <Text style={themedStyles.breakdownValue}>{spiritualFitness.varietyBonus} pts</Text>
                </View>
              )}
              <View style={themedStyles.breakdownItem}>
                <Text style={[themedStyles.breakdownLabel, {fontWeight: 'bold'}]}>Total Score</Text>
                <Text style={[themedStyles.breakdownValue, {fontWeight: 'bold'}]}>{spiritualFitness.score} pts</Text>
              </View>
            </View>
            
            <View style={styles.helpContainer}>
              <Text style={themedStyles.sectionTitle}>How Score Is Calculated</Text>
              <Text style={themedStyles.helpText}>Your Spiritual Fitness score is calculated based on your recovery activities over the past 30 days, with a maximum score of 100. You earn bonus points for variety (5 pts for each different type of activity, up to 20 pts):</Text>
              
              <View style={themedStyles.calculationItem}>
                <Text style={themedStyles.calculationLabel}>• Meetings:</Text>
                <Text style={themedStyles.calculationValue}>5 points per meeting</Text>
              </View>
              
              <View style={themedStyles.calculationItem}>
                <Text style={themedStyles.calculationLabel}>• Meditation:</Text>
                <Text style={themedStyles.calculationValue}>3 points per session</Text>
              </View>
              
              <View style={themedStyles.calculationItem}>
                <Text style={themedStyles.calculationLabel}>• Reading:</Text>
                <Text style={themedStyles.calculationValue}>2 points per reading</Text>
              </View>
              
              <View style={themedStyles.calculationItem}>
                <Text style={themedStyles.calculationLabel}>• Service:</Text>
                <Text style={themedStyles.calculationValue}>4 points per service activity</Text>
              </View>
              
              <View style={themedStyles.calculationItem}>
                <Text style={themedStyles.calculationLabel}>• Stepwork:</Text>
                <Text style={themedStyles.calculationValue}>5 points per activity</Text>
              </View>
              
              <View style={themedStyles.calculationItem}>
                <Text style={themedStyles.calculationLabel}>• Sponsorship:</Text>
                <Text style={themedStyles.calculationValue}>4 points per interaction</Text>
              </View>
            </View>
          </>
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
    backgroundColor: '#01040c',
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
  helpContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  headerLogo: {
    width: 80,
    height: 80,
    marginLeft: 10,
    borderRadius: 40,
  },
});

export default DashboardScreen;