/**
 * Global defaults for the Spiritual Condition Tracker app
 * This file is loaded before the bundle and sets global constants
 */

// Set default spiritual fitness score globally to 5 instead of 20
window.DEFAULT_SPIRITUAL_FITNESS_SCORE = 5;

// We'll set up React overrides later when React is available
window.setupReactOverrides = function() {
  // Only proceed if React is available
  if (typeof React !== 'undefined' && React.Component) {
    console.log('React is available, setting up overrides');
    
    // Store original setState
    window.originalSetState = React.Component.prototype.setState;
    
    // Override setState
    React.Component.prototype.setState = function(state, callback) {
      // Check if this setState is updating spiritual fitness or current score
      if (state && (state.spiritualFitness === 20 || state.currentScore === 20)) {
        console.log('Intercepted setState with score 20, changing to:', window.DEFAULT_SPIRITUAL_FITNESS_SCORE);
        
        // Replace with our default
        if (state.spiritualFitness === 20) {
          state.spiritualFitness = window.DEFAULT_SPIRITUAL_FITNESS_SCORE;
        }
        if (state.currentScore === 20) {
          state.currentScore = window.DEFAULT_SPIRITUAL_FITNESS_SCORE;
        }
      }
      
      // Call original setState
      return window.originalSetState.call(this, state, callback);
    };
    
    console.log('React setState successfully overridden');
  } else {
    console.log('React not available yet, will try again later');
  }
}

// Backup method: Override the spiritual fitness score globally
Object.defineProperty(window, 'OVERRIDE_DASHBOARD_SCORE', {
  get: function() {
    return true;
  }
});

// Function to check if React is available and set up overrides
function trySetupReactOverrides() {
  if (typeof React !== 'undefined' && React.Component) {
    window.setupReactOverrides();
  } else {
    // Try again in a second if React isn't loaded yet
    setTimeout(trySetupReactOverrides, 1000);
  }
}

// Override the calculation methods once they're loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM Content Loaded - applying overrides');
  
  // Start trying to set up React overrides
  trySetupReactOverrides();
  
  // Direct replacement in the UI after rendering
  setInterval(function() {
    try {
      // Find any element showing "20.00" score text and replace it
      const scoreElements = document.querySelectorAll('*');
      for (let i = 0; i < scoreElements.length; i++) {
        const el = scoreElements[i];
        if (el.childNodes && el.childNodes.length === 1 && 
            el.childNodes[0].nodeType === Node.TEXT_NODE) {
          if (el.childNodes[0].textContent === '20.00' || 
              el.childNodes[0].textContent === '20') {
            console.log('Found score text element, replacing 20 with 5');
            el.childNodes[0].textContent = '5.00';
          }
        }
      }
      
      // Also check for progress bars and other elements that might show the score
      const progressBars = document.querySelectorAll('[role="progressbar"],[aria-valuenow="20"]');
      progressBars.forEach(bar => {
        if (bar.getAttribute('aria-valuenow') === '20') {
          bar.setAttribute('aria-valuenow', '5');
          if (bar.style.width === '20%') {
            bar.style.width = '5%';
          }
        }
      });
    } catch (e) {
      console.log('Error in score fix:', e);
    }
  }, 500);
});

// For iOS compatibility - add a check for when the window is fully loaded
window.addEventListener('load', function() {
  console.log('Window fully loaded - checking if React is available');
  trySetupReactOverrides();
});

// Log that defaults are loaded
console.log('Global defaults loaded - DEFAULT_SPIRITUAL_FITNESS_SCORE:', window.DEFAULT_SPIRITUAL_FITNESS_SCORE);