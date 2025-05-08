/**
 * SimpleIconFallback Component
 * 
 * This is a simplified version of IconFallback that doesn't try to
 * manipulate the DOM directly, preventing Metro bundler hanging issues.
 */

import React from 'react';
import { View, Text } from 'react-native';

// Simple fallback that just returns a fixed-size colored box
export default function SimpleIconFallback({ name, size = 24, color = '#333', style }) {
  // Disable all logging to prevent console spam
  React.useEffect(() => {
    // Nothing to do here - no DOM manipulation
    return () => {
      // No cleanup needed
    };
  }, []);
  
  // Simply return a basic square as a visual fallback
  return (
    <View 
      style={[
        {
          width: size,
          height: size,
          backgroundColor: 'transparent',
          alignItems: 'center',
          justifyContent: 'center'
        },
        style
      ]}
    >
      <Text style={{ color, fontSize: size * 0.5, fontWeight: 'bold' }}>
        {/* Use first character of name as fallback */}
        {name ? name.charAt(0).toUpperCase() : '•'}
      </Text>
    </View>
  );
}