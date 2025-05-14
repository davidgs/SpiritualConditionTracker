import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';

// Minimal version for testing the Expo workflow

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <Text style={styles.title}>Spiritual Condition Tracker</Text>
        <Text style={styles.subtitle}>AA Recovery App</Text>
        <View style={styles.card}>
          <Text style={styles.cardText}>Welcome to your recovery journey</Text>
          <Text style={styles.cardSubText}>This app will help you track your spiritual condition and recovery progress</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 30,
    color: '#34495e',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 10,
    color: '#3498db',
  },
  cardSubText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});

export default App;