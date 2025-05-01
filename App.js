import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from 'react-native-vector-icons';

// Import database initialization
import { initDatabase } from './src/utils/database';

// Import context providers
import { UserProvider } from './src/contexts/UserContext';
import { ActivitiesProvider } from './src/contexts/ActivitiesContext';

// Import screens
import DashboardScreen from './src/screens/DashboardScreen';
import ActivityLogScreen from './src/screens/ActivityLogScreen';
import MeetingsScreen from './src/screens/MeetingsScreen';
import SpiritualFitnessScreen from './src/screens/SpiritualFitnessScreen';
import NearbyMembersScreen from './src/screens/NearbyMembersScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Create bottom tab navigator
const Tab = createBottomTabNavigator();

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Initialize database on app startup
  useEffect(() => {
    const setupDb = async () => {
      try {
        await initDatabase();
        setDbInitialized(true);
      } catch (error) {
        console.error('Error initializing database:', error);
      } finally {
        setLoading(false);
      }
    };
    
    setupDb();
  }, []);
  
  // Loading screen while database is initializing
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Initializing app...</Text>
      </View>
    );
  }
  
  // Error screen if database failed to initialize
  if (!dbInitialized) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#ef4444" />
        <Text style={styles.errorTitle}>Error Initializing App</Text>
        <Text style={styles.errorText}>
          Failed to initialize the database. Please restart the app.
        </Text>
      </View>
    );
  }
  
  return (
    <SafeAreaProvider>
      <UserProvider>
        <ActivitiesProvider>
          <NavigationContainer>
            <Tab.Navigator
              screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                  let iconName;
                  
                  if (route.name === 'Dashboard') {
                    iconName = focused ? 'home' : 'home-outline';
                  } else if (route.name === 'Activities') {
                    iconName = focused ? 'list' : 'list-outline';
                  } else if (route.name === 'Meetings') {
                    iconName = focused ? 'people' : 'people-outline';
                  } else if (route.name === 'Fitness') {
                    iconName = focused ? 'fitness' : 'fitness-outline';
                  } else if (route.name === 'Nearby') {
                    iconName = focused ? 'location' : 'location-outline';
                  } else if (route.name === 'Settings') {
                    iconName = focused ? 'settings' : 'settings-outline';
                  }
                  
                  return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#3b82f6',
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
              })}
            >
              <Tab.Screen name="Dashboard" component={DashboardScreen} />
              <Tab.Screen name="Activities" component={ActivityLogScreen} />
              <Tab.Screen name="Meetings" component={MeetingsScreen} />
              <Tab.Screen name="Fitness" component={SpiritualFitnessScreen} />
              <Tab.Screen name="Nearby" component={NearbyMembersScreen} />
              <Tab.Screen name="Settings" component={SettingsScreen} />
            </Tab.Navigator>
          </NavigationContainer>
          <StatusBar style="auto" />
        </ActivitiesProvider>
      </UserProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
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