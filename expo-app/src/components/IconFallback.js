import React from 'react';
import { View, StyleSheet } from 'react-native';

/**
 * IconFallback component - Completely simplified to fix bundling issues
 * This is just a placeholder that doesn't do anything
 */
export const IconFallback = () => {
  // Return empty component to avoid any bundling issues
  return null;
};

const styles = StyleSheet.create({
  container: {
    display: 'none',
  },
});

export default IconFallback;