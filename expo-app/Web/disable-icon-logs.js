/**
 * This script removes all references to IconFallback and disables related logging
 * It's included directly in the HTML head section
 */

// Run immediately when loaded
(function() {
  // Override window.console.log to intercept IconFallback logs
  const originalLog = window.console.log;
  window.console.log = function(...args) {
    // Check if this is an IconFallback log and suppress it
    if (args.length > 0 && 
        typeof args[0] === 'string' && 
        (args[0].includes('[IconFallback]') || args[0].includes('hamburger menu'))) {
      // Don't log anything for IconFallback messages
      return;
    }
    
    // For all other logs, use the original console.log
    return originalLog.apply(window.console, args);
  };
  
  // Also intercept console.error for the same purpose
  const originalError = window.console.error;
  window.console.error = function(...args) {
    // Check if this is an IconFallback error and suppress it
    if (args.length > 0 && 
        typeof args[0] === 'string' && 
        (args[0].includes('[IconFallback]') || args[0].includes('hamburger menu'))) {
      // Don't log anything for IconFallback errors
      return;
    }
    
    // For all other errors, use the original console.error
    return originalError.apply(window.console, args);
  };
  
  // Disable common problematic functions that might be causing the issue
  window.fixHamburgerMenuIcon = function() {
    // Do nothing, function disabled
  };
  
  // Prevent further modifications
  Object.defineProperty(window, 'fixHamburgerMenuIcon', {
    configurable: false,
    writable: false
  });
  
  // Disable all IconFallback functionality before it can run
  window.ICON_FALLBACK_DISABLED = true;
  
  console.log('IconFallback and related logging disabled');
})();