import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, Image } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
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

// Import utilities
import { isMobileDevice, addDimensionListener } from './src/utils/deviceUtils';

// Import database functions
import { initDatabase } from './src/database/database';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Icon mapping for both tab and drawer navigation
const getIconName = (routeName, focused) => {
  switch (routeName) {
    case 'Dashboard':
      return focused ? 'view-dashboard' : 'view-dashboard-outline';
    case 'Activities':
      return focused ? 'notebook' : 'notebook-outline';
    case 'Nearby':
      return focused ? 'account-group' : 'account-group-outline';
    case 'Meetings':
      return focused ? 'calendar-check' : 'calendar-check-outline';
    case 'Messages':
      return focused ? 'message-text' : 'message-text-outline';
    case 'Settings':
      return focused ? 'cog' : 'cog-outline';
    default:
      return 'help-circle-outline';
  }
};

// Navigation for the Messages
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

// DrawerContent component for the drawer navigation
const CustomDrawerContent = ({ navigation, theme }) => {
  return (
    <View style={{ flex: 1, backgroundColor: theme.background, padding: 20 }}>
      <View style={{ alignItems: 'center', marginVertical: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: theme.text, marginTop: 10 }}>
          Spiritual Condition Tracker
        </Text>
      </View>
      
      {/* Drawer Items */}
      {['Dashboard', 'Activities', 'Nearby', 'Meetings', 'Messages', 'Settings'].map((routeName) => (
        <View 
          key={routeName}
          style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            paddingVertical: 15,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
          }}
        >
          <MaterialCommunityIcons 
            name={getIconName(routeName, false)} 
            size={24} 
            color={theme.primary} 
          />
          <Text 
            style={{ marginLeft: 15, fontSize: 16, color: theme.text }}
            onPress={() => navigation.navigate(routeName)}
          >
            {routeName}
          </Text>
        </View>
      ))}
    </View>
  );
};

// Tab Navigator Component
const AppTabNavigator = () => {
  const { theme } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const iconName = getIconName(route.name, focused);
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
  );
};

// Drawer Navigator Component
const AppDrawerNavigator = () => {
  const { theme } = useTheme();
  
  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.card,
        },
        headerTintColor: theme.text,
        drawerStyle: {
          backgroundColor: theme.background,
          width: 280,
        },
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} theme={theme} />}
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

function Main() {
  const [dbInitialized, setDbInitialized] = useState(false);
  // Force mobile navigation for now
  const [isMobile, setIsMobile] = useState(true);
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

  // Toggle between mobile and desktop navigation
  const toggleNavigationMode = () => {
    setIsMobile(prev => !prev);
  };
  
  // Add toggle function to window for easy access
  useEffect(() => {
    if (Platform.OS === 'web') {
      window.toggleNav = toggleNavigationMode;
      console.log('Navigation toggle available. Call window.toggleNav() to switch between mobile/desktop view');
    }
  }, []);

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
    <NavigationContainer theme={customNavigationTheme}>
      {isMobile ? <AppDrawerNavigator /> : <AppTabNavigator />}
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
