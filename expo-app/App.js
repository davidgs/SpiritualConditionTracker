import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens
import DashboardScreen from './src/screens/DashboardScreen';
import ActivityLogScreen from './src/screens/ActivityLogScreen';
import NearbyMembersScreen from './src/screens/NearbyMembersScreen';
import MeetingsScreen from './src/screens/MeetingsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import MessagingScreen from './src/screens/MessagingScreen';
import ConversationScreen from './src/screens/ConversationScreen';

// Import contexts
import { UserProvider } from './src/contexts/UserContext';
import { ActivitiesProvider } from './src/contexts/ActivitiesContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { MessagingProvider } from './src/contexts/MessagingContext';

// Import database functions
import { initDatabase } from './src/database/database';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Main() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const { theme, isDark } = useTheme();

  // Create custom navigation theme
  const customNavigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: theme.primary,
      background: theme.background,
      card: theme.card,
      text: theme.text,
    },
  };

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

  // Navigation for the Messages tab
  const MessagesStack = () => (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MessagesList" component={MessagingScreen} />
      <Stack.Screen name="Conversation" component={ConversationScreen} />
    </Stack.Navigator>
  );

  return (
    <NavigationContainer theme={customNavigationTheme}>
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
            } else if (route.name === 'Messages') {
              iconName = focused ? 'message-text' : 'message-text-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'cog' : 'cog-outline';
            }

            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textSecondary,
          headerShown: true,
          tabBarStyle: { 
            height: 60,
            paddingTop: 5,
            paddingBottom: 10,
            backgroundColor: theme.tabBarBackground,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500'
          },
          headerStyle: {
            backgroundColor: theme.card,
          },
          headerTitleStyle: {
            color: theme.text,
          },
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Activities" component={ActivityLogScreen} />
        <Tab.Screen name="Nearby" component={NearbyMembersScreen} />
        <Tab.Screen name="Meetings" component={MeetingsScreen} />
        <Tab.Screen 
          name="Messages" 
          component={MessagesStack}
          options={{ 
            headerShown: false,
          }}
        />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
      <StatusBar style={theme.statusBar} />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ActivitiesProvider>
          <UserProvider>
            <MessagingProvider>
              <Main />
            </MessagingProvider>
          </UserProvider>
        </ActivitiesProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
