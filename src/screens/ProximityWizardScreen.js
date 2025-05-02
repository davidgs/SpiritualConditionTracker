import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import ProximityWizard from '../components/ProximityWizard';

export default function ProximityWizardScreen({ navigation }) {
  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ProximityWizard onClose={handleClose} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
});