import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

import { useUser } from '../contexts/UserContext';
import { useActivities } from '../contexts/ActivitiesContext';

const SpiritualFitnessScreen = () => {
  const { spiritualFitness } = useUser();
  const { activityStats } = useActivities();
  
  // Prepare data from spiritual fitness score
  const score = spiritualFitness?.score || 0;
  const breakdownData = spiritualFitness?.breakdown || {};
  
  // Helper to get icon by activity type
  const getIconForType = (type) => {
    switch (type) {
      case 'meeting': return 'users';
      case 'prayer': return 'hands';
      case 'meditation': return 'spa';
      case 'reading': return 'book-open';
      case 'callSponsor': return 'phone';
      case 'callSponsee': return 'phone-forwarded';
      case 'service': return 'heart';
      case 'stepWork': return 'clipboard';
      default: return 'check';
    }
  };
  
  // Get label by activity type
  const getLabelForType = (type) => {
    switch (type) {
      case 'meeting': return 'AA Meetings';
      case 'prayer': return 'Prayer';
      case 'meditation': return 'Meditation';
      case 'reading': return 'Reading AA Literature';
      case 'callSponsor': return 'Called Sponsor';
      case 'callSponsee': return 'Called Sponsee';
      case 'service': return 'Service Work';
      case 'stepWork': return 'Step Work';
      default: return 'Activity';
    }
  };
  
  // Calculate score color based on value
  const getScoreColor = (score) => {
    if (score >= 8) return '#27ae60'; // Good (green)
    if (score >= 5) return '#f39c12'; // OK (yellow)
    return '#e74c3c'; // Needs work (red)
  };
  
  const scoreColor = getScoreColor(score);
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Spiritual Fitness</Text>
          <Text style={styles.subtitle}>Track your spiritual progress in recovery</Text>
        </View>
        
        {/* Score Overview */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreContainer}>
            <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
              <Text style={[styles.scoreValue, { color: scoreColor }]}>{score.toFixed(2)}</Text>
              <Text style={[styles.scoreMax, { color: scoreColor }]}>/10</Text>
            </View>
          </View>
          
          <Text style={styles.scoreLabel}>Spiritual Fitness Score</Text>
          <Text style={styles.scoreDescription}>
            Based on your recovery activities over the past 30 days
          </Text>
        </View>
        
        {/* Activity Breakdown */}
        <View style={styles.breakdownCard}>
          <Text style={styles.sectionTitle}>Activity Breakdown</Text>
          
          {Object.keys(breakdownData).length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="heart" size={40} color="#bdc3c7" />
              <Text style={styles.emptyText}>
                No recovery activities logged yet. Log activities to see your spiritual fitness breakdown.
              </Text>
            </View>
          ) : (
            <View style={styles.breakdownList}>
              {Object.entries(breakdownData).map(([type, data]) => (
                <View key={type} style={styles.breakdownItem}>
                  <View style={styles.typeIcon}>
                    <Icon name={getIconForType(type)} size={24} color="#fff" />
                  </View>
                  <View style={styles.typeDetails}>
                    <Text style={styles.typeName}>{getLabelForType(type)}</Text>
                    <Text style={styles.typeCount}>
                      {data.count} {data.count === 1 ? 'activity' : 'activities'}
                    </Text>
                  </View>
                  <View style={styles.typeScore}>
                    <Text style={styles.typeScoreValue}>{data.points}</Text>
                    <Text style={styles.typeScoreLabel}>points</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
        
        {/* Recovery Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.sectionTitle}>Recovery Tips</Text>
          
          <View style={styles.tip}>
            <Icon name="lightbulb" size={20} color="#f39c12" style={styles.tipIcon} />
            <Text style={styles.tipText}>
              Regular meeting attendance is the foundation of recovery. Try to attend at least 3-4 meetings per week.
            </Text>
          </View>
          
          <View style={styles.tip}>
            <Icon name="lightbulb" size={20} color="#f39c12" style={styles.tipIcon} />
            <Text style={styles.tipText}>
              Daily prayer and meditation help maintain spiritual connection. Even just 10 minutes can make a difference.
            </Text>
          </View>
          
          <View style={styles.tip}>
            <Icon name="lightbulb" size={20} color="#f39c12" style={styles.tipIcon} />
            <Text style={styles.tipText}>
              Call your sponsor regularly, even when things are going well. This builds the relationship for when challenges arise.
            </Text>
          </View>
          
          <View style={styles.tip}>
            <Icon name="lightbulb" size={20} color="#f39c12" style={styles.tipIcon} />
            <Text style={styles.tipText}>
              Service work helps keep you connected to the program and reminds you of your primary purpose.
            </Text>
          </View>
        </View>
      </ScrollView>
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
    marginBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 4
  },
  scoreCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  scoreContainer: {
    marginVertical: 10
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    borderWidth: 5,
    borderColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3498db'
  },
  scoreMax: {
    fontSize: 16,
    color: '#3498db',
    alignSelf: 'flex-end',
    marginBottom: 6
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 10
  },
  scoreDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 6
  },
  breakdownCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  emptyText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 10
  },
  breakdownList: {
    marginTop: 10
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center'
  },
  typeDetails: {
    flex: 1,
    marginLeft: 10
  },
  typeName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50'
  },
  typeCount: {
    fontSize: 14,
    color: '#7f8c8d'
  },
  typeScore: {
    alignItems: 'center'
  },
  typeScoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60'
  },
  typeScoreLabel: {
    fontSize: 12,
    color: '#7f8c8d'
  },
  tipsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  tip: {
    flexDirection: 'row',
    marginBottom: 16
  },
  tipIcon: {
    marginRight: 10,
    marginTop: 2
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20
  }
});

export default SpiritualFitnessScreen;