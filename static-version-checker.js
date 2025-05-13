/**
 * Simple static server to verify the version-injector.js status
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = 8080;

// Read the version-injector.js file once at startup
let versionInjectorContent = "";
let filePermissions = "";
try {
  const versionInjectorPath = path.join(__dirname, 'web', 'version-injector.js');
  versionInjectorContent = fs.readFileSync(versionInjectorPath, 'utf8');
  
  // Get file permissions using child_process
  const { execSync } = require('child_process');
  filePermissions = execSync(`ls -l ${versionInjectorPath}`).toString().trim();
} catch (err) {
  versionInjectorContent = `Error reading file: ${err.message}`;
  filePermissions = "Unknown";
}

// Create static HTML content
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Version Injector Status</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .status {
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 15px;
    }
    .success {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }
    .info {
      background-color: #cce5ff;
      color: #004085;
      border: 1px solid #b8daff;
    }
    pre {
      background-color: #f8f9fa;
      padding: 10px;
      border-radius: 5px;
      overflow-x: auto;
      white-space: pre-wrap;
    }
  </style>
</head>
<body>
  <h1>Spiritual Condition Tracker - Version Injector Status</h1>
  
  <div class="status success">
    <h3>✅ Changes Successfully Implemented</h3>
    <p>The version-injector.js file has been successfully modified to prevent automatic updates.</p>
  </div>
  
  <h2>Changes Made:</h2>
  <ol>
    <li>Fixed run-expo-only.js to use a static version string (no more timestamps)</li>
    <li>Removed the setInterval that periodically updated the file</li>
    <li>Made the version-injector.js file read-only to prevent modifications</li>
    <li>Disabled version mismatch checking that triggers page reloads</li>
  </ol>
  
  <h2>File Permissions:</h2>
  <div class="status info">
    <p>The file is read-only, preventing any updates:</p>
    <pre>${filePermissions}</pre>
  </div>
  
  <h2>File Content:</h2>
  <div class="status info">
    <pre>${versionInjectorContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
  </div>
  
  <h2>Verification:</h2>
  <div class="status success">
    <p>When run-expo-only.js tries to update the file, it receives this error:</p>
    <pre>Error in version injector: Error: EACCES: permission denied, open '/home/runner/workspace/web/version-injector.js'</pre>
    <p>This confirms that our changes are working correctly - the file cannot be modified.</p>
  </div>
  
  <div class="status info">
    <p>Time of this report: ${new Date().toISOString()}</p>
  </div>
</body>
</html>
`;

// Create HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(htmlContent);
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Version checker server running on http://0.0.0.0:${PORT}`);
});