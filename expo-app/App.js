import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens
import DashboardScreen from './src/screens/DashboardScreen';
import ActivityLogScreen from './src/screens/ActivityLogScreen';
import NearbyMembersScreen from './src/screens/NearbyMembersScreen';
import MeetingsScreen from './src/screens/MeetingsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Import contexts
import { UserProvider } from './src/contexts/UserContext';
import { ActivitiesProvider } from './src/contexts/ActivitiesContext';

// Import database functions
import { initDatabase } from './src/database/database';

const Tab = createBottomTabNavigator();

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    async function setupDatabase() {
      try {
        await initDatabase();
        setDbInitialized(true);
      } catch (error) {
        console.error('Database initialization error:', error);
      }
    }
    
    setupDatabase();
  }, []);

  if (!dbInitialized) {
    // You could return a loading screen here
    return null;
  }

  return (
    <SafeAreaProvider>
      <ActivitiesProvider>
        <UserProvider>
          <NavigationContainer>
            <Tab.Navigator
              screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                  let iconName;

                  if (route.name === 'Dashboard') {
                    iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
                  } else if (route.name === 'Activities') {
                    iconName = focused ? 'notebook' : 'notebook-outline';
                  } else if (route.name === 'Nearby') {
                    iconName = focused ? 'account-group' : 'account-group-outline';
                  } else if (route.name === 'Meetings') {
                    iconName = focused ? 'calendar-check' : 'calendar-check-outline';
                  } else if (route.name === 'Settings') {
                    iconName = focused ? 'cog' : 'cog-outline';
                  }

                  return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#4a86e8',
                tabBarInactiveTintColor: 'gray',
              })}
            >
              <Tab.Screen name="Dashboard" component={DashboardScreen} />
              <Tab.Screen name="Activities" component={ActivityLogScreen} />
              <Tab.Screen name="Nearby" component={NearbyMembersScreen} />
              <Tab.Screen name="Meetings" component={MeetingsScreen} />
              <Tab.Screen name="Settings" component={SettingsScreen} />
            </Tab.Navigator>
            <StatusBar style="auto" />
          </NavigationContainer>
        </UserProvider>
      </ActivitiesProvider>
    </SafeAreaProvider>
  );
}
