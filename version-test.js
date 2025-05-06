/**
 * Direct version testing script
 * Run this script to verify what version of App.js is being served
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { execSync } = require('child_process');

// Create a simple HTML file with the current time
const timestamp = new Date().toISOString();
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Version Test - ${timestamp}</title>
  <style>
    body { font-family: sans-serif; margin: 20px; }
    .card { border: 1px solid #ccc; padding: 15px; margin-bottom: 15px; border-radius: 5px; }
    .success { background-color: #d4edda; border-color: #c3e6cb; }
    .warning { background-color: #fff3cd; border-color: #ffeeba; }
    .danger { background-color: #f8d7da; border-color: #f5c6cb; }
    code { background-color: #f8f9fa; padding: 2px 4px; border-radius: 4px; }
    pre { background-color: #f8f9fa; padding: 10px; overflow: auto; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>Version Test Results</h1>
  <p>Test run at: ${timestamp}</p>
  <div id="results"></div>
  
  <script>
    // Results will be injected here by the server
  </script>
</body>
</html>
`;

// Port for the test server
const PORT = 8765;

// Get App.js versions
function getAppVersions() {
  const results = { versions: {} };
  
  // Get root App.js version
  try {
    const rootAppPath = path.join(__dirname, 'App.js');
    if (fs.existsSync(rootAppPath)) {
      const content = fs.readFileSync(rootAppPath, 'utf8');
      const match = content.match(/APP_VERSION\s*=\s*["']([^"']*)["']/);
      results.versions.rootApp = match ? match[1] : 'Not found';
    } else {
      results.versions.rootApp = 'File not found';
    }
  } catch (err) {
    results.versions.rootApp = `Error: ${err.message}`;
  }
  
  // Get expo-app/App.js version
  try {
    const expoAppPath = path.join(__dirname, 'expo-app', 'App.js');
    if (fs.existsSync(expoAppPath)) {
      const content = fs.readFileSync(expoAppPath, 'utf8');
      const match = content.match(/APP_VERSION\s*=\s*["']([^"']*)["']/);
      results.versions.expoApp = match ? match[1] : 'Not found';
    } else {
      results.versions.expoApp = 'File not found';
    }
  } catch (err) {
    results.versions.expoApp = `Error: ${err.message}`;
  }
  
  // Try to get version from running app
  try {
    const response = execSync('curl -s http://localhost:3243 | grep -o "Version: [0-9\\.]*"', { encoding: 'utf8' });
    results.versions.running = response.trim();
  } catch (err) {
    results.versions.running = `Error: ${err.message || 'Could not determine running version'}`;
  }
  
  return results;
}

// Create HTTP server
const server = http.createServer((req, res) => {
  console.log(`Request: ${req.url}`);
  
  // Set headers to prevent caching
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // Get version info
  const versionInfo = getAppVersions();
  
  // Add script with results
  const resultsScript = `
    <script>
      const results = ${JSON.stringify(versionInfo, null, 2)};
      
      function addResult(title, content, type = '') {
        const div = document.createElement('div');
        div.className = 'card ' + type;
        div.innerHTML = '<h3>' + title + '</h3>' + content;
        document.getElementById('results').appendChild(div);
      }
      
      // Add version results
      const versions = results.versions;
      addResult('Root App.js Version', '<code>' + versions.rootApp + '</code>', 
                versions.rootApp.includes('1.0.2') ? 'success' : 'warning');
      
      addResult('expo-app/App.js Version', '<code>' + versions.expoApp + '</code>', 
                versions.expoApp.includes('1.0.2') ? 'success' : 'warning');
      
      addResult('Running App Version', '<code>' + versions.running + '</code>', 
                versions.running.includes('1.0.2') ? 'success' : 'danger');
      
      // Test the running app
      addResult('Testing Direct App Access', 'Attempting to fetch from port 3243...', 'warning');
      
      fetch('http://localhost:3243')
        .then(response => response.text())
        .then(html => {
          const versionMatch = html.match(/Version: ([^<]*)/);
          const version = versionMatch ? versionMatch[1].trim() : 'Not found';
          
          let resultHTML = '<p>Successfully connected to app.</p>';
          resultHTML += '<p>Version detected: <code>' + version + '</code></p>';
          
          if (version.includes('1.0.2')) {
            resultHTML += '<p>✅ Correct version detected!</p>';
            addResult('Direct Access Result', resultHTML, 'success');
          } else {
            resultHTML += '<p>❌ Wrong version detected! Expected 1.0.2</p>';
            resultHTML += '<p>This suggests the app is not picking up the latest changes.</p>';
            addResult('Direct Access Result', resultHTML, 'danger');
          }
        })
        .catch(err => {
          addResult('Direct Access Result', 
                   '<p>❌ Error connecting to app: ' + err.message + '</p>' +
                   '<p>This could indicate the app is not running or not accessible.</p>', 
                   'danger');
        });
      
      // Add browser cache info
      addResult('Browser Cache Info', 
               '<p>localStorage version: <code>' + (localStorage.getItem('app_version') || 'Not set') + '</code></p>' +
               '<p>Browser cache mode: <code>' + (navigator.serviceWorker ? 'Service workers enabled' : 'No service workers') + '</code></p>');
    </script>
  `;
  
  // Send response
  const finalHtml = htmlContent.replace('<script>\n    // Results will be injected here by the server\n  </script>', resultsScript);
  res.end(finalHtml);
});

// Start server
server.listen(PORT, () => {
  console.log(`
============================================================
  VERSION TEST SERVER RUNNING
  
  Open in your browser:
  http://localhost:${PORT}
  
  This page will show you exactly what version is being served
  and help diagnose why you might be seeing old versions.
============================================================
`);
});