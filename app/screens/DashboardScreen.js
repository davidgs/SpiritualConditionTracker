import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

// Contexts
import { useUser } from '../contexts/UserContext';
import { useActivities } from '../contexts/ActivitiesContext';

// Utils
import { 
  calculateSobrietyDays, 
  calculateSobrietyYears, 
  formatNumberWithCommas 
} from '../utils/calculations';

const DashboardScreen = ({ navigation }) => {
  const { user, spiritualFitness } = useUser();
  const { activityStats, activities, loadActivities } = useActivities();
  
  // Load activities on mount
  useEffect(() => {
    loadActivities();
  }, []);
  
  // Format sobriety information
  const sobrietyDays = user?.sobrietyDate 
    ? calculateSobrietyDays(user.sobrietyDate) 
    : 0;
  
  const sobrietyYears = user?.sobrietyDate 
    ? calculateSobrietyYears(user.sobrietyDate) 
    : 0;
    
  // Get recent activity count
  const recentActivitiesCount = activityStats?.totalCount || 0;
  
  // Format spiritual fitness score
  const fitnessScore = spiritualFitness?.score || 0;
  const formattedScore = fitnessScore.toFixed(2);
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {user?.name || 'Friend'}</Text>
          <Text style={styles.subHeading}>Your Recovery Dashboard</Text>
        </View>
        
        {/* Sobriety Counter */}
        <View style={[styles.card, styles.sobrietyCard]}>
          <View style={styles.cardHeader}>
            <Icon name="calendar-check" size={22} color="#27ae60" />
            <Text style={styles.cardTitle}>Sobriety</Text>
          </View>
          <View style={styles.sobrietyInfo}>
            <View style={styles.sobrietyMetric}>
              <Text style={styles.sobrietyValue}>
                {formatNumberWithCommas(sobrietyDays)}
              </Text>
              <Text style={styles.sobrietyLabel}>Days</Text>
            </View>
            <View style={styles.sobrietySeparator} />
            <View style={styles.sobrietyMetric}>
              <Text style={styles.sobrietyValue}>{sobrietyYears}</Text>
              <Text style={styles.sobrietyLabel}>Years</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.cardButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.cardButtonText}>Update Sobriety Date</Text>
          </TouchableOpacity>
        </View>
        
        {/* Spiritual Fitness Score */}
        <View style={[styles.card, styles.fitnessCard]}>
          <View style={styles.cardHeader}>
            <Icon name="heart" size={22} color="#e74c3c" />
            <Text style={styles.cardTitle}>Spiritual Fitness</Text>
          </View>
          <View style={styles.scoreContainer}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreValue}>{formattedScore}</Text>
              <Text style={styles.scoreMax}>/10</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.cardButton}
            onPress={() => navigation.navigate('Spiritual')}
          >
            <Text style={styles.cardButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
        
        {/* Recent Activity */}
        <View style={[styles.card, styles.activityCard]}>
          <View style={styles.cardHeader}>
            <Icon name="list-alt" size={22} color="#3498db" />
            <Text style={styles.cardTitle}>Recovery Activities</Text>
          </View>
          <View style={styles.activitySummary}>
            <Text style={styles.activityText}>
              You've logged <Text style={styles.activityHighlight}>{recentActivitiesCount}</Text> recovery 
              activities in the last 30 days.
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.cardButton}
            onPress={() => navigation.navigate('Activities')}
          >
            <Text style={styles.cardButtonText}>Log New Activity</Text>
          </TouchableOpacity>
        </View>
        
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Meetings')}
            >
              <Icon name="users" size={24} color="#3498db" />
              <Text style={styles.actionButtonText}>Find Meetings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Nearby')}
            >
              <Icon name="map-marker-alt" size={24} color="#e74c3c" />
              <Text style={styles.actionButtonText}>Nearby Members</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Spiritual')}
            >
              <Icon name="chart-line" size={24} color="#27ae60" />
              <Text style={styles.actionButtonText}>Track Progress</Text>
            </TouchableOpacity>
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
    marginBottom: 20,
    marginTop: 10
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  subHeading: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 5
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  sobrietyCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60'
  },
  fitnessCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c'
  },
  activityCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#3498db'
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#2c3e50'
  },
  sobrietyInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 10
  },
  sobrietyMetric: {
    alignItems: 'center'
  },
  sobrietyValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#27ae60'
  },
  sobrietyLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4
  },
  sobrietySeparator: {
    height: 40,
    width: 1,
    backgroundColor: '#ecf0f1'
  },
  scoreContainer: {
    alignItems: 'center',
    marginVertical: 10
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fef9f9',
    borderWidth: 4,
    borderColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e74c3c'
  },
  scoreMax: {
    fontSize: 14,
    color: '#e74c3c',
    alignSelf: 'flex-end',
    marginBottom: 5
  },
  activitySummary: {
    marginVertical: 10,
    alignItems: 'center'
  },
  activityText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#2c3e50',
    lineHeight: 24
  },
  activityHighlight: {
    fontWeight: 'bold',
    color: '#3498db'
  },
  cardButton: {
    backgroundColor: '#f4f6f7',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 10
  },
  cardButtonText: {
    color: '#2c3e50',
    fontWeight: '600'
  },
  quickActions: {
    marginTop: 10,
    marginBottom: 30
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2c3e50'
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  actionButtonText: {
    marginTop: 8,
    fontSize: 12,
    color: '#2c3e50',
    textAlign: 'center'
  }
});

export default DashboardScreen;