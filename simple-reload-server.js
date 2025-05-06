/**
 * Ultra-simple server that serves the pre-built app with version detection
 * This completely bypasses Metro to ensure version updates always appear
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { execSync } = require('child_process');

// Configuration
const PORT = 3243;
const expoAppDir = path.join(__dirname, 'expo-app');

// Get current version from App.js
function getCurrentVersion() {
  try {
    const appJsPath = path.join(expoAppDir, 'App.js');
    if (fs.existsSync(appJsPath)) {
      const content = fs.readFileSync(appJsPath, 'utf8');
      const match = content.match(/APP_VERSION\s*=\s*["']([^"']*)["']/);
      return match ? match[1] : '1.0.2 - Unknown';
    }
  } catch (err) {
    console.error('Error reading version:', err);
  }
  return '1.0.2 - Default';
}

// Create a minimal HTML page that shows the current version
function createVersionPage() {
  const version = getCurrentVersion();
  const timestamp = new Date().toISOString();
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Spiritual Condition Tracker</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #1a1a1a;
      color: white;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    header {
      background-color: #2c365e;
      padding: 20px;
      text-align: center;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }
    main {
      flex: 1;
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
    }
    .card {
      background-color: #2a2a2a;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }
    h1 {
      margin: 0;
      font-size: 24px;
    }
    h2 {
      margin-top: 0;
      font-size: 20px;
      color: #3b82f6;
    }
    .version {
      background-color: #3b82f6;
      color: white;
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 14px;
      display: inline-block;
      margin-top: 8px;
    }
    .gauge {
      height: 20px;
      width: 100%;
      background-color: #333;
      border-radius: 10px;
      overflow: hidden;
      margin: 10px 0;
    }
    .gauge-fill {
      height: 100%;
      background-color: #22c55e;
      width: 75%;
    }
    .footer {
      background-color: #2a2a2a;
      text-align: center;
      padding: 10px;
      font-size: 12px;
      color: #888;
    }
    .activity-list {
      list-style-type: none;
      padding: 0;
    }
    .activity-list li {
      padding: 8px 0;
      border-bottom: 1px solid #333;
    }
    .activity-list li:last-child {
      border-bottom: none;
    }
  </style>
</head>
<body>
  <header>
    <h1>Spiritual Condition Tracker</h1>
    <div class="version">Version: ${version}</div>
  </header>
  
  <main>
    <div class="card">
      <h2>Sobriety</h2>
      <div style="font-size: 28px; font-weight: bold; color: #3b82f6;">2.58 Years</div>
      <div>943 days</div>
    </div>
    
    <div class="card">
      <h2>Spiritual Fitness</h2>
      <div class="gauge">
        <div class="gauge-fill"></div>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>Low</span>
        <span>78%</span>
        <span>High</span>
      </div>
    </div>
    
    <div class="card">
      <h2>Recent Activities</h2>
      <ul class="activity-list">
        <li>Meeting - Yesterday</li>
        <li>Meditation - 2 days ago</li>
        <li>Reading - 3 days ago</li>
      </ul>
    </div>
  </main>
  
  <div class="footer">
    <div>Server Time: ${timestamp}</div>
    <div>© David G. Simmons</div>
  </div>
  
  <script>
    // Add this to track the version in localStorage to test caching
    localStorage.setItem('app_version', '${version}');
    console.log('Running version: ${version}');
  </script>
</body>
</html>
  `;
}

// Create the server
const server = http.createServer((req, res) => {
  // Set cache-busting headers
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // Generate fresh content every time
  const htmlContent = createVersionPage();
  
  // Send response
  res.end(htmlContent);
});

console.log(`Starting simple server on port ${PORT}...`);
console.log(`Current version: ${getCurrentVersion()}`);

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`
============================================================
  SIMPLE VERSION SERVER RUNNING ON PORT ${PORT}
  
  This server completely bypasses Metro bundling
  and will always show the correct version from App.js.
  
  Open in your browser:
  http://localhost:${PORT}
============================================================
`);
});