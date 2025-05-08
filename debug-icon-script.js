/**
 * This script can be copied and pasted into the browser console
 * to identify and fix IconFallback issues
 */

(function() {
  console.log('Starting IconFallback debug script...');
  
  // Override console.log to intercept IconFallback logs
  const originalLog = console.log;
  console.log = function(...args) {
    // Check if this is an IconFallback log
    if (args[0] && typeof args[0] === 'string' && args[0].includes('[IconFallback]')) {
      console.warn('INTERCEPTED LOG:', ...args);
      
      // Try to find the source of the log
      const stack = new Error().stack;
      console.warn('Log source:', stack);
      
      // Return without logging the original message
      return;
    }
    
    // Otherwise, call the original console.log
    return originalLog.apply(console, args);
  };
  
  // Find all script elements in the page
  const scripts = document.querySelectorAll('script');
  console.log(`Found ${scripts.length} scripts on the page`);
  
  // Examine each script for IconFallback references
  scripts.forEach((script, index) => {
    if (script.src) {
      console.log(`Script ${index + 1}: ${script.src}`);
    } else {
      const content = script.textContent;
      if (content.includes('IconFallback') || content.includes('hamburger menu')) {
        console.warn(`Found inline script ${index + 1} with IconFallback reference`);
        // Log a snippet of the content
        console.warn(content.substring(0, 200) + '...');
      }
    }
  });
  
  // Find functions that might be causing the logs
  if (window.fixHamburgerMenuIcon) {
    console.warn('Found fixHamburgerMenuIcon function in window scope');
    // Disable it
    window.fixHamburgerMenuIcon = function() {
      console.warn('fixHamburgerMenuIcon called - DISABLED');
    };
  }
  
  // Check for event listeners that might be calling IconFallback functions
  const possibleContainers = ['document', 'window', 'document.body', 'document.documentElement'];
  
  possibleContainers.forEach(containerName => {
    try {
      const container = eval(containerName);
      console.log(`Checking event listeners on ${containerName}...`);
      
      // Unfortunately, we can't easily inspect attached event listeners
      // but we can try to override some common events
      
      if (container.addEventListener) {
        const originalAddEventListener = container.addEventListener;
        container.addEventListener = function(event, listener, options) {
          console.log(`Event listener added to ${containerName}: ${event}`);
          originalAddEventListener.call(this, event, function(...args) {
            console.log(`Event fired: ${event} on ${containerName}`);
            return listener.apply(this, args);
          }, options);
        };
      }
    } catch (e) {
      console.log(`Error checking ${containerName}:`, e);
    }
  });
  
  console.log('IconFallback debug script finished');
})();