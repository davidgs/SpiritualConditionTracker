/**
 * iOS Compatibility Script
 * This script helps ensure proper loading of the app in iOS environments
 */

// Check if we're running in an iOS environment
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
              (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

// If in iOS, apply specific fixes
if (isIOS) {
  console.log("iOS environment detected, applying compatibility fixes");
  
  // Fix for blank screen in iOS WebView
  window.addEventListener('DOMContentLoaded', () => {
    // Force redraw of the page
    document.body.style.display = 'none';
    setTimeout(() => {
      document.body.style.display = '';
      console.log("iOS compatibility fixes applied");
    }, 50);
    
    // Check if the app root element exists
    const appRoot = document.getElementById('app');
    if (appRoot) {
      console.log("App root element found");
    } else {
      console.error("App root element not found");
    }
    
    // Force React to re-render
    const event = new Event('resize');
    window.dispatchEvent(event);
  });
  
  // iOS WebView may have issues with certain APIs, provide fallbacks
  if (!window.indexedDB) {
    console.warn("IndexedDB not available in this iOS WebView");
  }
  
  // Log that we've completed iOS setup
  console.log("iOS environment setup complete");
}