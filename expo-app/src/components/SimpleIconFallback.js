import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons, FontAwesome, Ionicons } from '@expo/vector-icons';

/**
 * SimpleIconFallback component
 * This is a simplified version that doesn't use DOM manipulation
 * It just renders invisible icons to trigger font loading
 */
export const SimpleIconFallback = () => {
  // Only needed on web platform
  if (Platform.OS !== 'web') {
    return null;
  }
  
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="home" size={1} color="transparent" />
      <MaterialCommunityIcons name="menu" size={1} color="transparent" />
      <MaterialCommunityIcons name="account" size={1} color="transparent" />
      <FontAwesome name="home" size={1} color="transparent" />
      <Ionicons name="ios-home" size={1} color="transparent" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
    left: -1000,
    top: -1000,
  },
});

export default SimpleIconFallback;