/**
 * iOS Compatibility Script
 * This script helps ensure proper loading of the app in iOS environments
 */

// Log that this script has loaded
console.log("[ ios-compatibility.js ] iOS compatibility script loaded");

// More aggressive checking for iOS environment
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
              (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
              window.webkit ||
              (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.indexOf('Safari') > -1);

// Always apply fixes regardless of detected platform for testing
console.log("Applying iOS compatibility fixes for all platforms");

// Create a simple debug overlay for iOS
function createDebugOverlay() {
  const overlay = document.createElement('div');
  overlay.style.position = 'absolute';
  overlay.style.top = '10px';
  overlay.style.left = '10px';
  overlay.style.right = '10px';
  overlay.style.backgroundColor = 'rgba(0,0,0,0.7)';
  overlay.style.color = 'white';
  overlay.style.padding = '10px';
  overlay.style.zIndex = '9999';
  overlay.style.fontSize = '12px';
  overlay.style.borderRadius = '5px';
  overlay.id = 'ios-debug-overlay';
  
  // Add message to overlay
  overlay.innerHTML = '<strong>iOS Debug:</strong> Initializing...';
  
  // Add to document when it's ready
  if (document.body) {
    document.body.appendChild(overlay);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      document.body.appendChild(overlay);
    });
  }
  
  return overlay;
}

// Function to log to overlay and console
function debugLog(message) {
  console.log(`[ ios-compatibility.js ] [iOS Debug] ${message}`);
  
  // Log to overlay if it exists
  const overlay = document.getElementById('ios-debug-overlay');
  if (overlay) {
    const timestamp = new Date().toLocaleTimeString();
    overlay.innerHTML += `<br>${timestamp}: ${message}`;
    
    // Trim log if it gets too long
    if (overlay.innerHTML.length > 1000) {
      const lines = overlay.innerHTML.split('<br>');
      if (lines.length > 20) {
        lines.splice(1, lines.length - 20);
        overlay.innerHTML = lines.join('<br>');
      }
    }
  }
  
  // Also try to force the app to render if not already visible
  setTimeout(() => {
    const appElement = document.getElementById('app');
    if (appElement && !appElement.innerHTML.trim()) {
      debugLog('App container empty, attempting to force render');
      // Force layout recalculation
      document.body.style.display = 'none';
      setTimeout(() => document.body.style.display = '', 10);
    }
  }, 500);
}

// Create debug overlay early
const debugOverlay = createDebugOverlay();
debugLog('iOS debug initialized');

// Apply fixes to ensure content renders
document.addEventListener('DOMContentLoaded', () => {
  debugLog('DOM content loaded');
  
  // Check if root element exists
  const appRoot = document.getElementById('app');
  if (appRoot) {
    debugLog('App root element found');
    
    // Add visibility to make sure it's shown
    appRoot.style.display = 'block';
    appRoot.style.visibility = 'visible';
    appRoot.style.opacity = '1';
    
    // Fix for iOS layout issues - force proper positioning
    if (!appRoot.style.position) {
      appRoot.style.position = 'relative';
    }
  } else {
    debugLog('ERROR: App root element NOT found!');
  }
  
  // More aggressive approach to forcing the rendering
  const forceRender = () => {
    // Trigger multiple methods to force repaint
    document.body.style.zoom = '0.99';
    
    setTimeout(() => {
      document.body.style.zoom = '1';
      document.body.style.transform = 'scale(1)';
      debugLog('Forced repaint applied');
      
      // Find React root
      const reactRoots = document.querySelectorAll('[data-reactroot]');
      if (reactRoots.length > 0) {
        debugLog(`Found ${reactRoots.length} React roots`);
        
        // Make sure the root is visible
        reactRoots.forEach(root => {
          root.style.visibility = 'visible';
          root.style.display = 'block';
        });
      } else {
        debugLog('No React roots found - may need to wait for React to initialize');
      }
      
      // Force React to re-render by triggering a resize
      window.dispatchEvent(new Event('resize'));
      window.dispatchEvent(new Event('orientationchange'));
      debugLog('Resize events dispatched');
    }, 50);
  };
  
  // Run immediately and then again after a delay
  forceRender();
  setTimeout(forceRender, 500);
  setTimeout(forceRender, 1000);
});

// Watch for React rendering
const originalCreateElement = document.createElement;
document.createElement = function(tagName) {
  const element = originalCreateElement.apply(document, arguments);
  
  // Watch for creation of specific React elements
  if (tagName === 'div' && !window._reactDetected) {
    element.addEventListener('DOMNodeInserted', function() {
      if (element.dataset && element.dataset.reactroot) {
        window._reactDetected = true;
        debugLog('React root element created and inserted into DOM');
      }
    });
  }
  
  return element;
};

// Override requestAnimationFrame to detect potential rendering issues
const originalRAF = window.requestAnimationFrame;
let rafCounter = 0;
window.requestAnimationFrame = function(callback) {
  rafCounter++;
  if (rafCounter === 100) {
    debugLog('100 animation frames requested - rendering appears active');
  }
  return originalRAF.call(window, callback);
};

// Check if the page is fully loaded
window.addEventListener('load', () => {
  debugLog('Window fully loaded');
  
  // Check content 1 second after load
  setTimeout(() => {
    const appRoot = document.getElementById('app');
    if (appRoot && appRoot.children.length > 0) {
      debugLog('App content appears to be rendered');
    } else {
      debugLog('WARNING: App container is empty after 1s, possible rendering issue');
      
      // Apply emergency fix - force React to render if needed
      if (window.React && window.React.render) {
        debugLog('Attempting emergency React render');
      }
    }
  }, 1000);
});

// iOS WebView may have issues with certain APIs
if (!window.indexedDB) {
  debugLog('WARNING: IndexedDB not available in this WebView');
}

debugLog('iOS compatibility setup complete');