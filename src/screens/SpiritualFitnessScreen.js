import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from 'react-native-vector-icons';
import { useUser } from '../contexts/UserContext';
import { useActivities } from '../contexts/ActivitiesContext';
import { spiritualFitnessOperations } from '../utils/database';
import { calculateStreaks } from '../utils/calculations';

const SpiritualFitnessScreen = ({ navigation }) => {
  const { user } = useUser();
  const { activities, loading: activitiesLoading } = useActivities();
  const [spiritualFitness, setSpiritualFitness] = useState(null);
  const [streaks, setStreaks] = useState({});
  const [timeframe, setTimeframe] = useState(30); // Default to 30 days
  const [loading, setLoading] = useState(true);
  
  // Load spiritual fitness data
  useEffect(() => {
    if (!user || !user.id) return;
    
    const loadData = async () => {
      try {
        setLoading(true);
        const fitnessData = await spiritualFitnessOperations.getSpiritualFitness(user.id, timeframe);
        setSpiritualFitness(fitnessData);
        
        // Calculate streaks
        if (activities.length > 0) {
          const streakData = calculateStreaks(activities);
          setStreaks(streakData);
        }
      } catch (error) {
        console.error('Error loading spiritual fitness:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user, activities, timeframe]);
  
  // Change timeframe
  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
  };
  
  // Get activity type label
  const getActivityTypeLabel = (type) => {
    switch (type) {
      case 'meeting':
        return 'Meetings';
      case 'meditation':
        return 'Meditation';
      case 'reading':
        return 'Reading';
      case 'service':
        return 'Service';
      case 'stepwork':
        return 'Step Work';
      case 'sponsorship':
        return 'Sponsorship';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };
  
  // Get activity type icon
  const getActivityTypeIcon = (type) => {
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
  
  // Render score card
  const renderScoreCard = () => {
    if (!spiritualFitness) {
      return (
        <View style={styles.scoreCard}>
          <Text style={styles.scoreCardTitle}>Your Spiritual Fitness</Text>
          <Text style={styles.scoreCardSubtitle}>
            Log activities to begin calculating your spiritual fitness score
          </Text>
        </View>
      );
    }
    
    return (
      <View style={styles.scoreCard}>
        <Text style={styles.scoreCardTitle}>Your Spiritual Fitness</Text>
        <View style={styles.scoreContainer}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreText}>{spiritualFitness.score}</Text>
            <Text style={styles.scoreLabel}>SCORE</Text>
          </View>
          <View style={styles.scoreDetails}>
            <Text style={styles.scoreDetail}>
              {spiritualFitness.activityCount} activities
            </Text>
            <Text style={styles.scoreDetail}>
              {spiritualFitness.activityTypes} different types
            </Text>
            <Text style={styles.scoreDetail}>
              Last {timeframe} days
            </Text>
          </View>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${spiritualFitness.score}%` }]} />
        </View>
      </View>
    );
  };
  
  // Render timeframe selector
  const renderTimeframeSelector = () => {
    return (
      <View style={styles.timeframeSelector}>
        <Text style={styles.timeframeTitle}>Timeframe</Text>
        <View style={styles.timeframeButtons}>
          <TouchableOpacity
            style={[
              styles.timeframeButton,
              timeframe === 7 && styles.timeframeButtonActive
            ]}
            onPress={() => handleTimeframeChange(7)}
          >
            <Text 
              style={[
                styles.timeframeButtonText,
                timeframe === 7 && styles.timeframeButtonTextActive
              ]}
            >
              7 days
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.timeframeButton,
              timeframe === 30 && styles.timeframeButtonActive
            ]}
            onPress={() => handleTimeframeChange(30)}
          >
            <Text 
              style={[
                styles.timeframeButtonText,
                timeframe === 30 && styles.timeframeButtonTextActive
              ]}
            >
              30 days
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.timeframeButton,
              timeframe === 90 && styles.timeframeButtonActive
            ]}
            onPress={() => handleTimeframeChange(90)}
          >
            <Text 
              style={[
                styles.timeframeButtonText,
                timeframe === 90 && styles.timeframeButtonTextActive
              ]}
            >
              90 days
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  // Render activity breakdown
  const renderActivityBreakdown = () => {
    if (!spiritualFitness || !spiritualFitness.breakdown) {
      return null;
    }
    
    const breakdownItems = Object.keys(spiritualFitness.breakdown).map(type => ({
      type,
      ...spiritualFitness.breakdown[type]
    }));
    
    if (breakdownItems.length === 0) {
      return null;
    }
    
    return (
      <View style={styles.breakdownCard}>
        <Text style={styles.breakdownTitle}>Activity Breakdown</Text>
        
        {breakdownItems.map(item => (
          <View key={item.type} style={styles.breakdownItem}>
            <View style={styles.breakdownIconContainer}>
              <Ionicons name={getActivityTypeIcon(item.type)} size={20} color="#3b82f6" />
            </View>
            <View style={styles.breakdownContent}>
              <View style={styles.breakdownHeader}>
                <Text style={styles.breakdownType}>{getActivityTypeLabel(item.type)}</Text>
                <Text style={styles.breakdownCount}>{item.count} activities</Text>
              </View>
              <View style={styles.breakdownBarContainer}>
                <View 
                  style={[
                    styles.breakdownBar, 
                    { width: `${(item.score / Math.max(...breakdownItems.map(i => i.score))) * 100}%` }
                  ]} 
                />
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };
  
  // Render current streaks
  const renderStreaks = () => {
    const streakItems = Object.keys(streaks).map(type => ({
      type,
      current: streaks[type].current,
      longest: streaks[type].longest
    })).filter(item => item.current > 0);
    
    if (streakItems.length === 0) {
      return null;
    }
    
    return (
      <View style={styles.streaksCard}>
        <Text style={styles.streaksTitle}>Current Streaks</Text>
        
        {streakItems.map(item => (
          <View key={item.type} style={styles.streakItem}>
            <View style={styles.streakIconContainer}>
              <Ionicons name={getActivityTypeIcon(item.type)} size={20} color="#3b82f6" />
            </View>
            <View style={styles.streakContent}>
              <Text style={styles.streakType}>{getActivityTypeLabel(item.type)}</Text>
              <Text style={styles.streakCount}>{item.current} day streak</Text>
            </View>
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={16} color="#ef4444" />
            </View>
          </View>
        ))}
      </View>
    );
  };
  
  // Render activity suggestions
  const renderSuggestions = () => {
    // Only show suggestions if score is below 80
    if (spiritualFitness && spiritualFitness.score >= 80) {
      return null;
    }
    
    return (
      <View style={styles.suggestionsCard}>
        <Text style={styles.suggestionsTitle}>Suggestions to Improve</Text>
        
        <TouchableOpacity 
          style={styles.suggestionItem}
          onPress={() => navigation.navigate('Activities')}
        >
          <View style={styles.suggestionIconContainer}>
            <Ionicons name="people" size={20} color="#3b82f6" />
          </View>
          <View style={styles.suggestionContent}>
            <Text style={styles.suggestionText}>Attend an AA meeting</Text>
            <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.suggestionItem}
          onPress={() => navigation.navigate('Activities')}
        >
          <View style={styles.suggestionIconContainer}>
            <Ionicons name="leaf" size={20} color="#3b82f6" />
          </View>
          <View style={styles.suggestionContent}>
            <Text style={styles.suggestionText}>Log meditation time</Text>
            <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.suggestionItem}
          onPress={() => navigation.navigate('Activities')}
        >
          <View style={styles.suggestionIconContainer}>
            <Ionicons name="book" size={20} color="#3b82f6" />
          </View>
          <View style={styles.suggestionContent}>
            <Text style={styles.suggestionText}>Read AA literature</Text>
            <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
          </View>
        </TouchableOpacity>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Spiritual Fitness</Text>
      </View>
      
      {loading || activitiesLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading spiritual fitness data...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {renderTimeframeSelector()}
          {renderScoreCard()}
          {renderActivityBreakdown()}
          {renderStreaks()}
          {renderSuggestions()}
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Activities')}
          >
            <Text style={styles.actionButtonText}>Log New Activity</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  timeframeSelector: {
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
  timeframeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  timeframeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeframeButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  timeframeButtonActive: {
    backgroundColor: '#3b82f6',
  },
  timeframeButtonText: {
    color: '#4b5563',
    fontWeight: '500',
  },
  timeframeButtonTextActive: {
    color: '#fff',
  },
  scoreCard: {
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
  scoreCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  scoreCardSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#ebf5ff',
    marginTop: 4,
  },
  scoreDetails: {
    flex: 1,
  },
  scoreDetail: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  breakdownCard: {
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
  breakdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  breakdownItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  breakdownIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ebf5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  breakdownContent: {
    flex: 1,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  breakdownType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  breakdownCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  breakdownBarContainer: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  breakdownBar: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  streaksCard: {
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
  streaksTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  streakItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  streakIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ebf5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  streakContent: {
    flex: 1,
  },
  streakType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  streakCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  streakBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionsCard: {
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
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  suggestionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ebf5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  suggestionContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  suggestionText: {
    fontSize: 14,
    color: '#1f2937',
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default SpiritualFitnessScreen;