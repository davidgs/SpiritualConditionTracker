import React from 'react';
import { SafeAreaView, StyleSheet, StatusBar, View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/FontAwesome5';

// Contexts
import { UserProvider, useUser } from './contexts/UserContext';
import { ActivitiesProvider } from './contexts/ActivitiesContext';

// Import screens
import DashboardScreen from './screens/DashboardScreen';
import ActivityLogScreen from './screens/ActivityLogScreen';
import SpiritualFitnessScreen from './screens/SpiritualFitnessScreen';
import MeetingsScreen from './screens/MeetingsScreen';
import ProximityWizardScreen from './screens/ProximityWizardScreen';
import NearbyMembersScreen from './screens/NearbyMembersScreen';
import SettingsScreen from './screens/SettingsScreen';

// Initialize navigation
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Loading screen while database initializes
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#0000ff" />
    <Text style={styles.loadingText}>Loading AA Recovery Tracker...</Text>
  </View>
);

// Main tab navigation
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Dashboard') {
            iconName = 'home';
          } else if (route.name === 'Activities') {
            iconName = 'list-alt';
          } else if (route.name === 'Spiritual') {
            iconName = 'heart';
          } else if (route.name === 'Meetings') {
            iconName = 'users';
          } else if (route.name === 'Nearby') {
            iconName = 'map-marker-alt';
          } else if (route.name === 'Settings') {
            iconName = 'cog';
          }
          
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: 'gray',
        headerShown: false
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Activities" component={ActivityLogScreen} />
      <Tab.Screen name="Spiritual" component={SpiritualFitnessScreen} />
      <Tab.Screen name="Meetings" component={MeetingsScreen} />
      <Tab.Screen name="Nearby" component={NearbyStackNavigator} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

// Nested stack navigator for nearby screens
const NearbyStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="NearbyMembers" component={NearbyMembersScreen} />
      <Stack.Screen name="ProximityWizard" component={ProximityWizardScreen} />
    </Stack.Navigator>
  );
};

// App container with context providers
const AppContainer = () => {
  const { isLoading } = useUser();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  return (
    <NavigationContainer>
      <MainTabNavigator />
    </NavigationContainer>
  );
};

// Root component with providers
const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <UserProvider>
        <ActivitiesProvider>
          <AppContainer />
        </ActivitiesProvider>
      </UserProvider>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5'
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#333'
  }
});

export default App;