/**
 * Extremely aggressive cache busting script
 * Add this to your HTML file to force browsers to reload when version changes
 * Even works through service workers and browser back/forward cache
 */

(function() {
  // Current version - change this when you update the app
  const APP_VERSION = "1.0.2-FORCE-REFRESH";
  
  // Get stored version from localStorage
  const storedVersion = localStorage.getItem('app_version');
  
  // Function to clear all available browser caches
  const clearAllCaches = async () => {
    console.log(`[Cache Buster] Clearing all caches...`);
    
    // Clear localStorage except for the version
    const versionKey = 'app_version';
    const versionValue = localStorage.getItem(versionKey);
    for (let key in localStorage) {
      if (key !== versionKey) {
        localStorage.removeItem(key);
      }
    }
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear indexedDB databases
    if (window.indexedDB) {
      const dbs = await window.indexedDB.databases();
      dbs.forEach(db => {
        window.indexedDB.deleteDatabase(db.name);
      });
    }
    
    // Clear Cache API caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(name => caches.delete(name))
      );
    }
    
    // Clear application cache (deprecated but might still exist)
    if (window.applicationCache) {
      try {
        window.applicationCache.swapCache();
      } catch(e) {
        // Ignore errors
      }
    }
    
    // Reset service worker
    if (navigator.serviceWorker) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(reg => reg.unregister())
      );
    }
    
    // Store the new version
    localStorage.setItem(versionKey, versionValue || APP_VERSION);
    
    return true;
  };
  
  // Check if version is different or missing
  if (storedVersion !== APP_VERSION) {
    console.log(`[Cache Buster] Version changed: ${storedVersion} -> ${APP_VERSION}`);
    
    // Store new version right away to prevent loops
    localStorage.setItem('app_version', APP_VERSION);
    
    // Add visible indicator that refresh is happening
    const div = document.createElement('div');
    div.style.position = 'fixed';
    div.style.top = '0';
    div.style.left = '0';
    div.style.width = '100%';
    div.style.padding = '10px';
    div.style.backgroundColor = '#f0ad4e';
    div.style.color = 'black';
    div.style.textAlign = 'center';
    div.style.zIndex = '9999';
    div.textContent = 'Updating to new version... Please wait.';
    document.body.appendChild(div);
    
    // Clear caches and reload page
    clearAllCaches().then(() => {
      console.log(`[Cache Buster] Caches cleared, reloading page...`);
      
      // Force page reload bypassing cache
      window.location.reload(true);
    });
  } else {
    console.log(`[Cache Buster] Running version: ${APP_VERSION}`);
  }
  
  // Create a global helper function to force refresh
  window.forceAppRefresh = function() {
    console.log('[Cache Buster] Manual refresh triggered');
    clearAllCaches().then(() => {
      window.location.reload(true);
    });
  };
  
  // Add visible refresh button in development mode
  if (window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.includes('.repl.co')) {
    const btn = document.createElement('button');
    btn.style.position = 'fixed';
    btn.style.bottom = '10px';
    btn.style.right = '10px';
    btn.style.zIndex = '9999';
    btn.style.padding = '8px 12px';
    btn.style.backgroundColor = '#d9534f';
    btn.style.color = 'white';
    btn.style.border = 'none';
    btn.style.borderRadius = '4px';
    btn.style.cursor = 'pointer';
    btn.textContent = 'Force Refresh';
    btn.onclick = window.forceAppRefresh;
    
    // Delay to ensure body is loaded
    setTimeout(() => {
      document.body.appendChild(btn);
    }, 1000);
  }
})();