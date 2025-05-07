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
  
  // Function to fix the hamburger menu icon specifically
  const fixHamburgerMenuIcon = () => {
    if (Platform.OS !== 'web') return;
    
    console.log('[IconFallback] Looking for hamburger menu to fix...');
    
    // Find the hamburger menu button (has aria-label="Open drawer" or aria-label="Show navigation menu")
    const hamburgerButton = 
      document.querySelector('button[aria-label="Open drawer"]') || 
      document.querySelector('button[aria-label="Show navigation menu"]');
    
    if (hamburgerButton) {
      console.log('[IconFallback] Found hamburger menu button');
      
      // Check if it's empty or has invisible content
      const svgElement = hamburgerButton.querySelector('svg');
      
      if (!svgElement || 
          svgElement.getAttribute('width') === '0' || 
          svgElement.getAttribute('height') === '0' ||
          !svgElement.innerHTML.includes('path')) {
        
        console.log('[IconFallback] Fixing hamburger menu icon');
        
        // Create a direct hamburger icon
        const hamburgerIcon = document.createElement('div');
        hamburgerIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path></svg>';
        
        // Style appropriately
        hamburgerIcon.style.width = '24px';
        hamburgerIcon.style.height = '24px';
        hamburgerIcon.style.display = 'flex';
        hamburgerIcon.style.alignItems = 'center';
        hamburgerIcon.style.justifyContent = 'center';
        
        // Add to button (empty it first if needed)
        if (svgElement) {
          svgElement.parentNode.replaceChild(hamburgerIcon, svgElement);
        } else {
          hamburgerButton.innerHTML = '';
          hamburgerButton.appendChild(hamburgerIcon);
        }
        
        hamburgerButton.classList.add('fixed-hamburger-icon');
        console.log('[IconFallback] Hamburger menu icon fixed');
      }
    } else {
      console.log('[IconFallback] Hamburger menu button not found, will retry');
      // Button might not be ready yet, retry later
      setTimeout(fixHamburgerMenuIcon, 500);
    }
  };
  
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
          
          @font-face {
            font-family: 'MaterialIcons';
            src: url('${window.EXPO_PUBLIC_PATH || ''}/fonts/MaterialIcons.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
            font-display: block;
          }
          
          /* Fix for broken SVGs */
          svg[width="0"], svg[height="0"] {
            width: 24px !important;
            height: 24px !important;
          }
          
          /* Fix for hamburger menu */
          button[aria-label="Open drawer"], button[aria-label="Show navigation menu"] {
            position: relative;
          }
          
          /* Add a CSS-based fallback for the hamburger icon */
          button[aria-label="Open drawer"]:empty::after,
          button[aria-label="Show navigation menu"]:empty::after,
          button[aria-label="Open drawer"] svg[width="0"]::after,
          button[aria-label="Show navigation menu"] svg[width="0"]::after {
            content: "";
            width: 24px;
            height: 24px;
            background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>');
            background-repeat: no-repeat;
            background-position: center;
            display: block;
          }
        `;
        document.head.appendChild(style);
      }
      
      // Fix hamburger menu icon with several attempts for timing 
      fixHamburgerMenuIcon();
      
      // Retry with increasing delays to ensure we catch the icon
      // after the navigation is fully rendered
      const retryTimes = [500, 1000, 2000, 3000];
      retryTimes.forEach(delay => {
        setTimeout(fixHamburgerMenuIcon, delay);
      });
      
      // Set up a mutation observer to watch for DOM changes
      // This will help capture the hamburger icon if it's added dynamically
      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.addedNodes.length > 0) {
            fixHamburgerMenuIcon();
          }
        });
      });
      
      // Start observing the document body for DOM changes
      observer.observe(document.body, { 
        childList: true, 
        subtree: true 
      });
      
      // Cleanup observer on unmount
      return () => observer.disconnect();
    }
  }, []);
  
  return (
    <View style={styles.container} accessibilityElementsHidden={true}>
      {/* These invisible icons ensure the fonts are loaded */}
      <MaterialCommunityIcons name="home" size={1} color="transparent" />
      <MaterialCommunityIcons name="menu" size={1} color="transparent" />
      <MaterialCommunityIcons name="hamburger" size={1} color="transparent" />
      <MaterialCommunityIcons name="menu-open" size={1} color="transparent" />
      <MaterialCommunityIcons name="menu-down" size={1} color="transparent" />
      <MaterialCommunityIcons name="menu-up" size={1} color="transparent" />
      <MaterialCommunityIcons name="cog" size={1} color="transparent" />
      <FontAwesome name="home" size={1} color="transparent" />
      <FontAwesome name="bars" size={1} color="transparent" />
      <FontAwesome name="navicon" size={1} color="transparent" />
      <FontAwesome name="reorder" size={1} color="transparent" />
      <Ionicons name="ios-home" size={1} color="transparent" />
      <Ionicons name="ios-menu" size={1} color="transparent" />
      <Ionicons name="md-menu" size={1} color="transparent" />
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