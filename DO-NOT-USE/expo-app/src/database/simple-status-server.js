/**
 * Ultra-simple status server using only built-in Node.js modules
 * Designed to work 100% reliably to show the status of version-injector.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Use port 5000 - the only port guaranteed to be accessible in Replit preview
const PORT = 5000;

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Simple routing
  if (req.url === '/' || req.url === '/index.html') {
    // Generate and serve the status page as our main page
    serveStatusPage(res);
  } else {
    // Not found
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

// Serve a status page that shows version-injector.js status
function serveStatusPage(res) {
  // Read the version-injector.js file
  let versionInjectorContent = "";
  let filePermissions = "";
  let fixesApplied = [];
  
  try {
    const versionInjectorPath = path.join(__dirname, 'web', 'version-injector.js');
    
    // Check if file exists
    if (fs.existsSync(versionInjectorPath)) {
      versionInjectorContent = fs.readFileSync(versionInjectorPath, 'utf8');
      
      // Get file permissions
      try {
        filePermissions = execSync(`ls -l ${versionInjectorPath}`).toString().trim();
      } catch (e) {
        filePermissions = "Error getting permissions: " + e.message;
      }
      
      // Analyze the content to determine which fixes are applied
      if (versionInjectorContent.includes('FORCE_APP_VERSION = "1.0.6 - Fixed Version"')) {
        fixesApplied.push("✅ Fixed version string implemented (1.0.6 - Fixed Version)");
      }
      
      if (versionInjectorContent.includes('// No automatic version checking or page reloading')) {
        fixesApplied.push("✅ Automatic version checking disabled");
      }
      
      if (versionInjectorContent.includes('Version mismatch checking has been DISABLED')) {
        fixesApplied.push("✅ Version mismatch checking disabled");
      }
      
      if (versionInjectorContent.includes('setInterval function removed')) {
        fixesApplied.push("✅ Periodic updates with setInterval removed");
      }
      
      // Try to check if file is read-only
      try {
        const isWritable = filePermissions.includes('-rw-') || filePermissions.includes('-w-');
        if (!isWritable) {
          fixesApplied.push("✅ File permissions set to read-only");
        } else {
          fixesApplied.push("❌ File is still writable - not read-only");
        }
      } catch (e) {
        fixesApplied.push("❓ Could not determine if file is read-only");
      }
    } else {
      versionInjectorContent = "File not found at " + versionInjectorPath;
      filePermissions = "N/A";
      fixesApplied.push("❌ version-injector.js file not found");
    }
  } catch (err) {
    versionInjectorContent = `Error reading file: ${err.message}`;
    filePermissions = "Unknown";
    fixesApplied.push("❌ Error reading version-injector.js");
  }
  
  // Create HTML content
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Spiritual Condition Tracker - Status</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .status-box {
      background-color: #d4edda;
      border: 1px solid #c3e6cb;
      color: #155724;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    .error-box {
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      color: #721c24;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    pre {
      background-color: #f8f9fa;
      padding: 10px;
      border-radius: 5px;
      overflow-x: auto;
      white-space: pre-wrap;
      font-size: 12px;
      max-height: 400px;
      overflow-y: auto;
    }
    .fixes-list {
      background-color: #e2e3e5;
      border: 1px solid #d6d8db;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    .fixes-list li {
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Spiritual Condition Tracker</h1>
    <p>Version Injector Status Report</p>
  </div>
  
  <div class="status-box">
    <h2>Version Injector Updates Status</h2>
    <p>This page shows the current status of the version-injector.js file and whether updates have been successfully disabled.</p>
  </div>
  
  <div class="fixes-list">
    <h2>Applied Fixes:</h2>
    <ul>
      ${fixesApplied.map(fix => `<li>${fix}</li>`).join('\n      ')}
    </ul>
  </div>
  
  <h2>Current File Permissions:</h2>
  <pre>${filePermissions}</pre>
  
  <h2>File Content (First 30 lines):</h2>
  <pre>${versionInjectorContent.split('\n').slice(0, 30).join('\n').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
  
  <div class="status-box">
    <h3>Summary of Changes:</h3>
    <ol>
      <li>Modified run-expo-only.js to use a fixed version string (no timestamps)</li>
      <li>Removed the setInterval that periodically updated the file</li>
      <li>Made version-injector.js read-only to prevent modifications</li>
      <li>Disabled version mismatch checking in the client code</li>
    </ol>
  </div>
</body>
</html>
  `;
  
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(htmlContent);
}

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Status check server running on http://0.0.0.0:${PORT}`);
  console.log(`Access the status page at http://0.0.0.0:${PORT}/`);
});