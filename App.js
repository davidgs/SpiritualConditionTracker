import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from 'react-native-vector-icons';

// Import database initialization
import { initDatabase } from './src/utils/database';

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
  
  // Initialize database on app startup
  useEffect(() => {
    const setupDb = async () => {
      await initDatabase();
      setDbInitialized(true);
    };
    
    setupDb();
  }, []);
  
  // Wait for database initialization before rendering the app
  if (!dbInitialized) {
    return null; // Or a loading screen
  }
  
  return (
    <SafeAreaProvider>
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
    </SafeAreaProvider>
  );
}