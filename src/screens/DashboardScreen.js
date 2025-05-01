import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from 'react-native-vector-icons';
import { useUser } from '../contexts/UserContext';
import { useActivities } from '../contexts/ActivitiesContext';
import { calculateSobrietyDays, calculateSobrietyYears, formatNumberWithCommas } from '../utils/calculations';
import { spiritualFitnessOperations } from '../utils/database';

const DashboardScreen = ({ navigation }) => {
  const { user } = useUser();
  const { recentActivities, loading, refreshActivities } = useActivities();
  const [spiritualFitness, setSpiritualFitness] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Load spiritual fitness data
  useEffect(() => {
    if (!user || !user.id) return;
    
    const loadSpiritualFitness = async () => {
      try {
        const fitnessData = await spiritualFitnessOperations.getSpiritualFitness(user.id);
        setSpiritualFitness(fitnessData);
      } catch (error) {
        console.error('Error loading spiritual fitness:', error);
      }
    };
    
    loadSpiritualFitness();
  }, [user, recentActivities]);
  
  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshActivities();
      if (user && user.id) {
        const fitnessData = await spiritualFitnessOperations.getSpiritualFitness(user.id);
        setSpiritualFitness(fitnessData);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  // Render sobriety counter
  const renderSobrietyCounter = () => {
    if (!user || !user.sobrietyDate) {
      return (
        <TouchableOpacity 
          style={styles.sobrietyCard}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.sobrietyCardTitle}>Set Your Sobriety Date</Text>
          <Text style={styles.sobrietyCardSubtitle}>
            Tap here to set your sobriety date in settings
          </Text>
        </TouchableOpacity>
      );
    }
    
    const days = calculateSobrietyDays(user.sobrietyDate);
    const years = calculateSobrietyYears(user.sobrietyDate);
    
    return (
      <View style={styles.sobrietyCard}>
        <Text style={styles.sobrietyCardTitle}>Your Sobriety</Text>
        <View style={styles.sobrietyStatsContainer}>
          <View style={styles.sobrieryStatBox}>
            <Text style={styles.sobrietyStatsNumber}>{formatNumberWithCommas(days)}</Text>
            <Text style={styles.sobrietyStatsLabel}>Days</Text>
          </View>
          <View style={styles.sobrieryStatBox}>
            <Text style={styles.sobrietyStatsNumber}>{years.toFixed(2)}</Text>
            <Text style={styles.sobrietyStatsLabel}>Years</Text>
          </View>
        </View>
      </View>
    );
  };
  
  // Render spiritual fitness summary
  const renderSpiritualFitness = () => {
    if (!spiritualFitness) {
      return (
        <TouchableOpacity 
          style={styles.fitnessCard}
          onPress={() => navigation.navigate('Fitness')}
        >
          <Text style={styles.fitnessCardTitle}>Spiritual Fitness</Text>
          <Text style={styles.fitnessCardSubtitle}>
            Log activities to see your spiritual fitness score
          </Text>
        </TouchableOpacity>
      );
    }
    
    return (
      <TouchableOpacity 
        style={styles.fitnessCard}
        onPress={() => navigation.navigate('Fitness')}
      >
        <View style={styles.fitnessHeaderRow}>
          <Text style={styles.fitnessCardTitle}>Spiritual Fitness</Text>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreText}>{spiritualFitness.score}</Text>
          </View>
        </View>
        <Text style={styles.fitnessCardSubtitle}>
          Based on {spiritualFitness.activityCount} activities in the last {spiritualFitness.timeframe} days
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${spiritualFitness.score}%` }]} />
        </View>
      </TouchableOpacity>
    );
  };
  
  // Render recent activities
  const renderRecentActivities = () => {
    if (recentActivities.length === 0) {
      return (
        <TouchableOpacity 
          style={styles.activitiesCard}
          onPress={() => navigation.navigate('Activities')}
        >
          <Text style={styles.activitiesCardTitle}>Recent Activities</Text>
          <Text style={styles.activitiesCardSubtitle}>
            No activities yet. Tap to log your first activity!
          </Text>
        </TouchableOpacity>
      );
    }
    
    return (
      <View style={styles.activitiesCard}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.activitiesCardTitle}>Recent Activities</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Activities')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {recentActivities.map((activity) => (
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
            </View>
          </View>
        ))}
      </View>
    );
  };
  
  // Helper function to get icon for activity type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'meeting':
        return 'people';
      case 'meditation':
        return 'leaf';
      case 'reading':
        return 'book';
      case 'service':
        return 'hand-left';
      case 'stepwork':
        return 'list';
      case 'sponsorship':
        return 'person';
      default:
        return 'checkmark-circle';
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recovery Dashboard</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('Activities')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderSobrietyCounter()}
        {renderSpiritualFitness()}
        {renderRecentActivities()}
        
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => navigation.navigate('Meetings')}
        >
          <Ionicons name="calendar" size={24} color="#3b82f6" />
          <Text style={styles.actionText}>Find AA Meetings</Text>
          <Ionicons name="chevron-forward" size={18} color="#6b7280" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => navigation.navigate('Nearby')}
        >
          <Ionicons name="location" size={24} color="#3b82f6" />
          <Text style={styles.actionText}>Find Nearby Members</Text>
          <Ionicons name="chevron-forward" size={18} color="#6b7280" />
        </TouchableOpacity>
      </ScrollView>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  sobrietyCard: {
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
  sobrietyCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  sobrietyCardSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  sobrietyStatsContainer: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'space-around',
  },
  sobrieryStatBox: {
    alignItems: 'center',
    minWidth: 80,
  },
  sobrietyStatsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  sobrietyStatsLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  fitnessCard: {
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
  fitnessCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  fitnessCardSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  fitnessHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  activitiesCard: {
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
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  activitiesCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  activitiesCardSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  viewAllText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  activityItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
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
    justifyContent: 'center',
  },
  activityName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  activityMeta: {
    fontSize: 13,
    color: '#6b7280',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  actionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginLeft: 12,
  },
});

export default DashboardScreen;