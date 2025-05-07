import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons, FontAwesome, Ionicons } from '@expo/vector-icons';

/**
 * IconFallback component
 * This is a workaround for web to ensure icons are loaded
 * It renders invisible icons to trigger font loading
 */
export const IconFallback = () => {
  // Only needed on web platform
  if (Platform.OS !== 'web') {
    return null;
  }
  
  useEffect(() => {
    // Fix for web platform - ensure icons are injected in the DOM
    if (Platform.OS === 'web') {
      // Add class to help diagnose icon issues
      document.body.classList.add('has-icon-fallback');
      
      // Create a style element for icon fixes if it doesn't exist
      if (!document.getElementById('material-icons-fix')) {
        const style = document.createElement('style');
        style.id = 'material-icons-fix';
        style.textContent = `
          @font-face {
            font-family: 'MaterialCommunityIcons';
            src: url('${window.EXPO_PUBLIC_PATH || ''}/fonts/MaterialCommunityIcons.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
            font-display: block;
          }
          
          @font-face {
            font-family: 'FontAwesome';
            src: url('${window.EXPO_PUBLIC_PATH || ''}/fonts/FontAwesome.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
            font-display: block;
          }
          
          @font-face {
            font-family: 'Ionicons';
            src: url('${window.EXPO_PUBLIC_PATH || ''}/fonts/Ionicons.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
            font-display: block;
          }
          
          /* Fix for broken SVGs */
          svg[width="0"], svg[height="0"] {
            width: 24px !important;
            height: 24px !important;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);
  
  return (
    <View style={styles.container} accessibilityElementsHidden={true}>
      {/* These invisible icons ensure the fonts are loaded */}
      <MaterialCommunityIcons name="home" size={1} color="transparent" />
      <MaterialCommunityIcons name="menu" size={1} color="transparent" />
      <MaterialCommunityIcons name="cog" size={1} color="transparent" />
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
    overflow: 'hidden',
  },
});

export default IconFallback;