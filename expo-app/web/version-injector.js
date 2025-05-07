
// Force version refresh - created at 2025-05-07T16:42:12.001Z
// Also contains icon loading fixes
window.FORCE_APP_VERSION = "1.0.3 - May 7, 2025, 04:35 PM - BUILD-1746635711947";
window.BUILD_ID = "build-1746635711947";
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
      
      "/* Fix any broken SVG icons */" +
      "svg[width='0'][height='0'] {" +
      "  width: 24px !important;" +
      "  height: 24px !important;" +
      "}";
    document.head.appendChild(style);
    console.log("[Icon Helper] Added vector icons CSS");
  }
  
  // Function to create font preload links
  function createFontPreloads() {
    const fonts = [
      'MaterialCommunityIcons.ttf',
      'FontAwesome.ttf',
      'Ionicons.ttf'
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
    setTimeout(() => window.dispatchEvent(new Event('resize')), 1000);
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
  
  // Version check on load
  const CHECK_DELAY = 5000; // 5 seconds
  setTimeout(function() {
    if (document.body) {
      // Add version indicator on dev environments
      if (window.location.hostname.includes('localhost') || 
          window.location.hostname.includes('127.0.0.1') ||
          window.location.hostname.includes('.repl.co')) {
        document.body.appendChild(createVersionIndicator());
      }
      
      // Check if displaying old version
      if (!document.body.innerHTML.includes(window.FORCE_APP_VERSION)) {
        console.log("[Version Injector] Version mismatch detected! Refreshing...");
        clearAllStorage();
        window.location.reload(true);
      }
    }
  }, CHECK_DELAY);
  
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
