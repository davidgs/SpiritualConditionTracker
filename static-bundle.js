// Static bundle for Spiritual Condition Tracker
// Enhanced compatibility bundle for Hermes engine & Nginx
(function() {
  console.log('[Bundle] Loading compatibility bundle...');
  
  // Provide minimal mocks for expected Hermes APIs
  if (typeof global !== 'undefined' && !global.HermesInternal) {
    global.HermesInternal = {
      getRuntimeProperties: function() {
        return { 
          "OSS Release Version": "hermes-2023-08-07-RNv0.72.4-node-v18.17.1",
          "Build Mode": "Release", 
          "Bytecode Version": 99 
        };
      },
      hasToStringBug: function() { return false; },
      enablePromiseRejectionTracker: function() {},
      enterCriticalSection: function() {},
      exitCriticalSection: function() {},
      handleMemoryPressure: function() {},
      initializeHermesIfNeeded: function() {},
      shouldEnableTurboModule: function() { return false; }
    };
  }
  
  // Setup minimal React environment
  if (typeof window !== 'undefined') {
    // Redirect to root after a short delay if this gets loaded directly
    setTimeout(function() {
      console.log('[Bundle] Redirecting to app root...');
      if (window.location.pathname.includes('index.bundle')) {
        try {
          // Try to use the standard app URL
          window.location.href = '/';
        } catch (e) {
          console.error('[Bundle] Redirect failed:', e);
        }
      }
    }, 500);
  }
  
  // Let the user know this is a compatibility bundle
  console.warn('[Bundle] Running in compatibility mode - this is not the full app bundle');
  console.log('[Bundle] If you see this message in the browser console, you should reload the page or navigate to the app root');
  
  // Export expected modules to prevent errors
  return {
    __esModule: true,
    default: {
      name: 'SpiritualConditionTracker',
      displayName: 'Spiritual Condition Tracker',
      expo: {
        name: 'Spiritual Condition Tracker'
      }
    }
  };
})();