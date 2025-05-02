import React from 'react';
import { StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import NearbyMembers from '../components/NearbyMembers';
import ProximityWizardScreen from './ProximityWizardScreen';

const Stack = createNativeStackNavigator();

export default function NearbyMembersScreen() {
  return (
    <SafeAreaProvider style={styles.container}>
      <Stack.Navigator
        initialRouteName="NearbyMembersList"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#f8f9fa' }
        }}
      >
        <Stack.Screen 
          name="NearbyMembersList" 
          component={NearbyMembersList} 
        />
        <Stack.Screen 
          name="ProximityWizard" 
          component={ProximityWizardScreen} 
        />
      </Stack.Navigator>
    </SafeAreaProvider>
  );
}

// Separate component for the main screen
function NearbyMembersList({ navigation }) {
  return (
    <NearbyMembers 
      navigation={navigation} 
      onStartWizard={() => navigation.navigate('ProximityWizard')} 
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  }
});