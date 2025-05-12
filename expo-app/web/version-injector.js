
// Force version refresh - created at 2025-05-12T00:10:35.065Z
// Also contains icon loading fixes
window.FORCE_APP_VERSION = "1.0.6 - May 12, 2025, 12:10 AM - BUILD-1747008635035";
window.BUILD_ID = "build-1747008635035";
console.log("[Version Injector] Running version: " + window.FORCE_APP_VERSION);

// Add icon loading support
document.addEventListener('DOMContentLoaded', function() {
  console.log("[Icon Helper] Adding icon support...");
  
  // Function to inject CSS for vector icons
  function injectVectorIconsCSS() {
    // Create style element for icon fonts
    const style = document.createElement('style');
    style.id = 'vector-icons-css';
    style.textContent = 
      "/* Vector icon font definitions */" +
      "@font-face {" +
      "  font-family: 'MaterialCommunityIcons';" +
      "  src: url('./fonts/MaterialCommunityIcons.ttf') format('truetype');" +
      "  font-weight: normal;" +
      "  font-style: normal;" +
      "}" +
      
      "@font-face {" +
      "  font-family: 'FontAwesome';" +
      "  src: url('./fonts/FontAwesome.ttf') format('truetype');" +
      "  font-weight: normal;" +
      "  font-style: normal;" +
      "}" +
      
      "@font-face {" +
      "  font-family: 'Ionicons';" +
      "  src: url('./fonts/Ionicons.ttf') format('truetype');" +
      "  font-weight: normal;" +
      "  font-style: normal;" +
      "}" +
      
      "@font-face {" +
      "  font-family: 'MaterialIcons';" +
      "  src: url('./fonts/MaterialIcons.ttf') format('truetype');" +
      "  font-weight: normal;" +
      "  font-style: normal;" +
      "}" +
      
      "/* Fix any broken SVG icons */" +
      "svg[width='0'], svg[height='0'] {" +
      "  width: 24px !important;" +
      "  height: 24px !important;" +
      "}" +
      
      "/* Target the navigation menu button specifically */" +
      "button[aria-label='Show navigation menu'] {" +
      "  position: relative;" +
      "}" +
      
      "/* Add hamburger icon content to empty navigation buttons */" +
      "button[aria-label='Show navigation menu'] .css-g5y9jx.r-1mlwlqe:empty::before {" +
      "  content: '';" +
      "  position: absolute;" +
      "  top: 0;" +
      "  left: 0;" +
      "  right: 0;" +
      "  bottom: 0;" +
      "  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z' fill='%23000000'/%3E%3C/svg%3E");" +
      "  background-size: 24px 24px;" +
      "  background-position: center;" +
      "  background-repeat: no-repeat;" +
      "}" +
      
      "/* Target specifically the hamburger icon based on common attributes */" +
      "[class*='menu-icon'], [class*='hamburger'], [class*='navbar-toggle'] {" +
      "  font-family: 'MaterialIcons', 'MaterialCommunityIcons', sans-serif !important;" +
      "}";
    document.head.appendChild(style);
    console.log("[Icon Helper] Added vector icons CSS");
  }
  
  // Function to create font preload links
  function createFontPreloads() {
    const fonts = [
      'MaterialCommunityIcons.ttf',
      'FontAwesome.ttf',
      'Ionicons.ttf',
      'MaterialIcons.ttf'
    ];
    
    fonts.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = './fonts/' + font;
      link.as = 'font';
      link.type = 'font/ttf';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
    console.log("[Icon Helper] Added font preloads");
  }
  
  // Run our fixes with a slight delay to let other scripts initialize
  setTimeout(function() {
    injectVectorIconsCSS();
    createFontPreloads();
    
    // Force SVG rendering in icon components by simulating a resize
    setTimeout(function() {
      try {
        window.dispatchEvent(new Event('resize'));
        console.log("[Icon Helper] Dispatched resize event");
      } catch(e) {
        console.error("[Icon Helper] Error dispatching resize event:", e);
      }
    }, 1000);
    
    // Simple function to add a basic hamburger menu icon CSS
    try {
      const iconStyle = document.createElement('style');
      iconStyle.innerHTML = 
        'button[aria-label="Show navigation menu"] svg:empty { ' +
        '  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z' fill='currentColor'/%3E%3C/svg%3E"); ' +
        '  background-repeat: no-repeat; ' +
        '  background-position: center; ' +
        '  width: 24px !important; ' +
        '  height: 24px !important; ' +
        '  display: block; ' +
        '}';
      
      if (document.head) {
        document.head.appendChild(iconStyle);
        console.log("[Icon Helper] Added hamburger icon fix via CSS");
      } else {
        console.log("[Icon Helper] Document head not ready, will retry later");
        setTimeout(function() {
          if (document.head) {
            document.head.appendChild(iconStyle);
            console.log("[Icon Helper] Added hamburger icon fix via CSS (delayed)");
          }
        }, 2000);
      }
    } catch(e) {
      console.error("[Icon Helper] Error adding icon style:", e);
    }
  }, 500);
});

// Enforce version checking
(function() {
  // Create a tiny version indicator that's visible in case of emergency
  function createVersionIndicator() {
    const div = document.createElement('div');
    div.style.position = 'fixed';
    div.style.bottom = '0';
    div.style.right = '0';
    div.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    div.style.color = 'white';
    div.style.padding = '3px 6px';
    div.style.fontSize = '9px';
    div.style.zIndex = '999999';
    div.style.opacity = '0.5';
    div.textContent = 'v' + window.FORCE_APP_VERSION.split(' ')[0];
    return div;
  }

  // Force clear all caches
  function clearAllStorage() {
    try {
      // Clear localStorage except version info
      const versionBackup = localStorage.getItem('app_version');
      localStorage.clear();
      localStorage.setItem('app_version', window.FORCE_APP_VERSION);
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear application cache (if exists)
      if (window.applicationCache && window.applicationCache.swapCache) {
        try { window.applicationCache.swapCache(); } catch(e) {}
      }
      
      // Try unregistering service workers
      if (navigator.serviceWorker) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(reg => reg.unregister());
        });
      }
      
      // For deployments with specific paths, ensure path prefix is correct
      if (window.location.pathname.indexOf('/app') !== 0 && 
          !window.location.pathname.includes('localhost')) {
        console.log("[Version Injector] Path correction - redirecting to /app path");
        window.location.href = '/app' + window.location.search;
        return false;
      }
      
      console.log("[Version Injector] All storage cleared");
      return true;
    } catch(e) {
      console.error("[Version Injector] Error clearing storage:", e);
      return false;
    }
  }
  
  // Force refresh function - available globally for debugging
  window.forceAppVersionRefresh = function() {
    clearAllStorage();
    window.location.reload(true);
  };
  
  // Version check on load with improved DOM readiness handling
  const CHECK_DELAY = 5000; // 5 seconds
  
  // Function to safely check if DOM is ready and perform version checks
  function safelyCheckVersion() {
    console.log("[Version Injector] Running version check...");
    
    // Only proceed if document.body is available
    if (typeof document === 'undefined' || !document || !document.body) {
      console.log("[Version Injector] Document body not available yet, will retry");
      // Retry after a delay
      setTimeout(safelyCheckVersion, 1000);
      return;
    }
    
    try {
      // Add version indicator on dev environments only after DOM is fully loaded
      function addVersionIndicator() {
        if (window.location.hostname.includes('localhost') || 
            window.location.hostname.includes('127.0.0.1') ||
            window.location.hostname.includes('.repl.co')) {
          try {
            // Only manipulate DOM if document.body exists
            if (document.body) {
              document.body.appendChild(createVersionIndicator());
              console.log("[Version Injector] Version indicator added");
            } else {
              console.log("[Version Injector] Document body not available yet");
              // Retry in 100ms
              setTimeout(addVersionIndicator, 100);
            }
          } catch (err) {
            console.log("[Version Injector] Could not append version indicator:", err.message);
          }
        }
      }
      
      // Check if displaying old version - safely check only if body exists
      function checkVersionMismatch() {
        if (document.body && !document.body.innerHTML.includes(window.FORCE_APP_VERSION)) {
          console.log("[Version Injector] Version mismatch detected! Refreshing...");
          clearAllStorage();
        }
      }
      
      // Wait for DOM to be ready before manipulating
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
          addVersionIndicator();
          checkVersionMismatch();
        });
      } else {
        // DOM already loaded
        addVersionIndicator();
        checkVersionMismatch();
        
        // Safely check version and reload if needed
        if (document.body && !document.body.innerHTML.includes(window.FORCE_APP_VERSION)) {
          console.log("[Version Injector] Version mismatch detected! Refreshing...");
          window.location.reload(true);
        } else {
          console.log("[Version Injector] Version matched, no refresh needed");
        }
      }
    } catch (err) {
      console.log("[Version Injector] Error during version check:", err.message);
    }
  }
  
  // Start the version check process after initial delay
  setTimeout(safelyCheckVersion, CHECK_DELAY);
  
  // Periodic version check every 5 minutes
  setInterval(function() {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        const match = this.responseText.match(/FORCE_APP_VERSION = "([^"]*)"/);
        if (match && match[1] && match[1] !== window.FORCE_APP_VERSION) {
          console.log("[Version Injector] New version detected:", match[1]);
          clearAllStorage();
          window.location.reload(true);
        }
      }
    };
    // Ensure we're using the correct path for the version check
    const basePath = window.location.pathname.startsWith('/app') ? '/app/' : '/';
    xhttp.open("GET", basePath + "version-injector.js?nocache=" + Date.now(), true);
    xhttp.send();
  }, 300000); // Check every 5 minutes
})();
