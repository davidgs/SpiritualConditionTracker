import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, Platform, Dimensions } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enGB, registerTranslation } from 'react-native-paper-dates';

// Register locale for react-native-paper-dates
registerTranslation('en-GB', enGB);
// Also register as default locale to prevent warnings
registerTranslation('en', enGB);
registerTranslation('undefined', enGB);

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

// Import simplified icon fallback for web that doesn't use DOM manipulation
import SimpleIconFallback from './src/components/SimpleIconFallback';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Simple device detection
const isMobile = () => {
  // Always treat native apps as mobile
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return true;
  }
  
  // For web, check screen size
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.innerWidth < 768;
  }
  
  // Default to true if we can't detect
  return true;
};

// Navigation for the Messages stack
const MessagesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MessagesList" component={MessagingScreen} />
    <Stack.Screen name="Conversation" component={ConversationScreen} />
  </Stack.Navigator>
);

// Tab Navigator (for desktop)
const TabNavigator = () => {
  const { theme } = useTheme();
  
  return (
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
        headerStyle: {
          backgroundColor: theme.card,
        },
        headerTintColor: theme.text,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Activities" component={ActivityLogScreen} />
      <Tab.Screen name="Nearby" component={NearbyMembersScreen} />
      <Tab.Screen name="Meetings" component={MeetingsScreen} />
      <Tab.Screen 
        name="Messages" 
        component={MessagesStack} 
        options={{ headerShown: false }}
      />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

// Drawer Navigator (for mobile)
const DrawerNavigator = () => {
  const { theme } = useTheme();
  
  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.card,
        },
        headerTintColor: theme.text,
        drawerActiveTintColor: theme.primary,
        drawerInactiveTintColor: theme.text,
      }}
    >
      <Drawer.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{
          drawerIcon: ({color, size}) => (
            <MaterialCommunityIcons name="view-dashboard-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Activities" 
        component={ActivityLogScreen}
        options={{
          drawerIcon: ({color, size}) => (
            <MaterialCommunityIcons name="notebook-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Nearby" 
        component={NearbyMembersScreen}
        options={{
          drawerIcon: ({color, size}) => (
            <MaterialCommunityIcons name="account-group-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Meetings" 
        component={MeetingsScreen}
        options={{
          drawerIcon: ({color, size}) => (
            <MaterialCommunityIcons name="calendar-check-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Messages" 
        component={MessagesStack}
        options={{
          drawerIcon: ({color, size}) => (
            <MaterialCommunityIcons name="message-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          drawerIcon: ({color, size}) => (
            <MaterialCommunityIcons name="cog-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

// App version - update with every change
const APP_VERSION = "1.0.6 - May 8, 2025, 01:45 AM - BUILD-1746668755094";

function Main() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [useMobileNav, setUseMobileNav] = useState(isMobile());
  const { theme, isDark } = useTheme();
  
  // Initialize database
  useEffect(() => {
    const setupDb = async () => {
      try {
        await initDatabase();
        setDbInitialized(true);
      } catch (error) {
        console.error('Database initialization error:', error);
      }
    };
    
    setupDb();
  }, []);
  
  // Set up responsive layout
  useEffect(() => {
    setUseMobileNav(isMobile());
    
    // Set up window resize listener for web
    if (Platform.OS === 'web') {
      const handleResize = () => {
        setUseMobileNav(isMobile());
      };
      
      window.addEventListener('resize', handleResize);
      
      // Expose toggle for testing
      window.toggleNav = () => {
        setUseMobileNav(prev => !prev);
      };
      
      return () => window.removeEventListener('resize', handleResize);
    }
    
    // For native, use Dimensions API
    const subscription = Dimensions.addEventListener('change', () => {
      setUseMobileNav(isMobile());
    });
    
    return () => subscription.remove();
  }, []);
  
  // Create custom theme for navigation
  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: theme.primary,
      background: theme.background,
      card: theme.card,
      text: theme.text,
    },
  };
  
  // Show loading state while database initializes
  if (!dbInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <Text style={{ color: theme.text }}>Loading...</Text>
      </View>
    );
  }
  
  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer theme={navTheme}>
        {useMobileNav ? <DrawerNavigator /> : <TabNavigator />}
      </NavigationContainer>
      
      {/* Version footer */}
      <View style={{ 
        padding: 5, 
        backgroundColor: theme.card,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: theme.border
      }}>
        <Text style={{ 
          color: theme.textSecondary,
          fontSize: 10
        }}>
          Version: {APP_VERSION}
        </Text>
      </View>
      
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ActivitiesProvider>
          <UserProvider>
            <MessagingProvider>
              <SimpleIconFallback />
              <Main />
            </MessagingProvider>
          </UserProvider>
        </ActivitiesProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}