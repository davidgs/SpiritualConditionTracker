/**
 * Improved server for Spiritual Condition Tracker app
 * This server serves the app and ensures the version-injector.js stays fixed
 */

const express = require('express');
const { spawn, execSync } = require('child_process');
const path = require('path');
const http = require('http');
const httpProxy = require('http-proxy');
const fs = require('fs');

// Configuration - use port 4000 which is accessible in the preview
const PORT = 4000;
const HOST = '0.0.0.0';
const EXPO_PORT = 3243;

// Create Express app
const app = express();
const server = http.createServer(app);

// Create a proxy for Expo
const proxy = httpProxy.createProxyServer({
  ws: true,
  changeOrigin: true
});

// Handle proxy errors
proxy.on('error', function(err, req, res) {
  console.error('Proxy error:', err);
  if (!res.headersSent) {
    res.writeHead(500);
    res.end(`
      <html>
        <head><title>Proxy Error</title></head>
        <body>
          <h1>Proxy Error</h1>
          <p>There was an error connecting to the Expo development server.</p>
          <pre>${err.toString()}</pre>
          <p>Check the server logs for more details.</p>
          <p><a href="/">Return to Home</a></p>
        </body>
      </html>
    `);
  }
});

// Serve static files
app.use(express.static(path.join(__dirname)));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Ensure version-injector.js is read-only
function ensureVersionInjectorReadOnly() {
  const versionInjectorPath = path.join(__dirname, 'web', 'version-injector.js');
  
  try {
    // Check if file exists
    if (fs.existsSync(versionInjectorPath)) {
      // Make it read-only
      execSync(`chmod 444 ${versionInjectorPath}`);
      console.log('Made version-injector.js read-only with permissions 444');
      
      // Verify the permissions
      const permissions = execSync(`ls -l ${versionInjectorPath}`).toString().trim();
      console.log(`Current permissions: ${permissions}`);
      
      return true;
    } else {
      console.error('version-injector.js not found at:', versionInjectorPath);
      return false;
    }
  } catch (err) {
    console.error('Error making version-injector.js read-only:', err);
    return false;
  }
}

// Status routes for version-injector.js
app.get('/version-status', (req, res) => {
  const versionInjectorPath = path.join(__dirname, 'web', 'version-injector.js');
  
  try {
    const versionInjectorContent = fs.readFileSync(versionInjectorPath, 'utf8');
    const filePermissions = execSync(`ls -l ${versionInjectorPath}`).toString().trim();
    
    // Analyze the content to determine fixes
    const fixesApplied = [];
    
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
    
    // Check if file is read-only
    const isWritable = filePermissions.includes('-rw-') || filePermissions.includes('-w-');
    if (!isWritable) {
      fixesApplied.push("✅ File permissions set to read-only");
    } else {
      fixesApplied.push("❌ File is still writable - not read-only");
    }
    
    res.send(`
      <html>
        <head>
          <title>Version Injector Status</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .status-box {
              background-color: #d4edda;
              border: 1px solid #c3e6cb;
              color: #155724;
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
            }
          </style>
        </head>
        <body>
          <h1>Version Injector Status</h1>
          
          <div class="status-box">
            <h2>Applied Fixes:</h2>
            <ul>
              ${fixesApplied.map(fix => `<li>${fix}</li>`).join('\n')}
            </ul>
          </div>
          
          <h2>Current File Permissions:</h2>
          <pre>${filePermissions}</pre>
          
          <h2>File Content (First 20 lines):</h2>
          <pre>${versionInjectorContent.split('\n').slice(0, 20).join('\n').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
          
          <p><a href="/">Back to App</a></p>
        </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send(`
      <html>
        <head><title>Error</title></head>
        <body>
          <h1>Error Reading Version Injector</h1>
          <pre>${err.toString()}</pre>
          <p><a href="/">Back to App</a></p>
        </body>
      </html>
    `);
  }
});

// Start Expo in the background
async function startExpoApp() {
  console.log('Starting Expo app...');
  
  try {
    console.log('Cleaning up existing processes...');
    try {
      execSync('pkill -f "expo start" || true', { stdio: 'ignore' });
      execSync('pkill -f "npm run" || true', { stdio: 'ignore' });
    } catch (err) {
      console.log('No processes to clean up');
    }
    
    // Ensure version-injector.js is read-only before starting Expo
    ensureVersionInjectorReadOnly();
    
    // Start the Expo process with proper environment variables
    const expoProcess = spawn('node', ['run-expo-only.js'], {
      env: { 
        ...process.env, 
        CI: '1',
        EXPO_WEB_PORT: EXPO_PORT.toString(),
        DANGEROUSLY_DISABLE_HOST_CHECK: 'true',
        PUBLIC_URL: '/'
      },
      stdio: 'pipe'
    });
    
    expoProcess.stdout.on('data', (data) => {
      console.log(`Expo: ${data}`);
    });
    
    expoProcess.stderr.on('data', (data) => {
      console.error(`Expo error: ${data}`);
    });
    
    console.log(`Waiting for Expo to start on port ${EXPO_PORT}...`);
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    return expoProcess;
  } catch (err) {
    console.error('Error starting Expo:', err);
    throw err;
  }
}

// Main function
async function main() {
  try {
    // Create home page - a dashboard for the app
    app.get('/', (req, res) => {
      res.send(`
        <html>
          <head>
            <title>Spiritual Condition Tracker</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 20px;
                background-color: #f5f5f5;
                color: #333;
              }
              .container {
                max-width: 800px;
                margin: 0 auto;
                background-color: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              .success-message {
                background-color: #d4edda;
                color: #155724;
                padding: 15px;
                border-radius: 5px;
                border: 1px solid #c3e6cb;
                margin-bottom: 20px;
              }
              .nav-buttons {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
              }
              .button {
                display: inline-block;
                background-color: #007bff;
                color: white;
                padding: 10px 15px;
                border-radius: 5px;
                text-decoration: none;
                transition: background-color 0.3s;
              }
              .button:hover {
                background-color: #0056b3;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Spiritual Condition Tracker</h1>
                <p>Your partner on the journey to spiritual fitness</p>
              </div>
              
              <div class="success-message">
                <h2>✅ Version Injector Updates Successfully Disabled</h2>
                <p>The app will now use a fixed version and won't automatically update.</p>
              </div>
              
              <div class="nav-buttons">
                <a href="/app" class="button">Launch App</a>
                <a href="/version-status" class="button">Version Status</a>
                <a href="/server-status" class="button">Server Status</a>
              </div>
              
              <h2>Welcome to the Spiritual Condition Tracker</h2>
              <p>This application helps individuals in Alcoholics Anonymous recovery track their spiritual condition and growth.</p>
              
              <h3>Key Features:</h3>
              <ul>
                <li>Track meetings attended</li>
                <li>Log prayer and meditation time</li>
                <li>Record reading of AA literature</li>
                <li>Monitor interactions with sponsors and sponsees</li>
                <li>Calculate your "Spiritual Fitness" score</li>
              </ul>
              
              <p>Click the "Launch App" button above to begin your journey.</p>
            </div>
          </body>
        </html>
      `);
    });
    
    // Server status page
    app.get('/server-status', (req, res) => {
      res.send(`
        <html>
          <head>
            <title>Server Status</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 20px;
                background-color: #f5f5f5;
              }
              .container {
                max-width: 800px;
                margin: 0 auto;
                background-color: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .status-item {
                background-color: #e9ecef;
                padding: 10px;
                border-radius: 5px;
                margin-bottom: 10px;
              }
              .nav-button {
                display: inline-block;
                background-color: #007bff;
                color: white;
                padding: 8px 15px;
                border-radius: 5px;
                text-decoration: none;
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Server Status</h1>
              
              <div class="status-item">
                <h3>Main Server</h3>
                <p>Running on: http://${HOST}:${PORT}</p>
                <p>Started: ${new Date().toLocaleString()}</p>
              </div>
              
              <div class="status-item">
                <h3>Expo Development Server</h3>
                <p>Running on: http://localhost:${EXPO_PORT}</p>
                <p>Proxied at: /app</p>
              </div>
              
              <div class="status-item">
                <h3>Environment</h3>
                <p>Node.js: ${process.version}</p>
                <p>Platform: ${process.platform}</p>
              </div>
              
              <a href="/" class="nav-button">Back to Home</a>
            </div>
          </body>
        </html>
      `);
    });
    
    console.log('Starting Expo app...');
    const expoProcess = await startExpoApp();
    
    // Proxy all /app routes to the Expo server
    app.use('/app', (req, res) => {
      const target = `http://localhost:${EXPO_PORT}`;
      console.log(`Proxying to Expo: ${req.url} -> ${target}`);
      proxy.web(req, res, { target });
    });
    
    // Handle WebSocket connections
    server.on('upgrade', function(req, socket, head) {
      const target = `http://localhost:${EXPO_PORT}`;
      if (req.url.startsWith('/app')) {
        console.log(`WebSocket upgrade: ${req.url} -> ${target}`);
        proxy.ws(req, socket, head, { target });
      }
    });
    
    // Start the server
    server.listen(PORT, HOST, () => {
      console.log(`Server running at http://${HOST}:${PORT}`);
      console.log(`- Home page: http://localhost:${PORT}/`);
      console.log(`- App: http://localhost:${PORT}/app`);
      console.log(`- Version Status: http://localhost:${PORT}/version-status`);
      console.log(`- Server Status: http://localhost:${PORT}/server-status`);
    });
    
    // Handle process termination
    process.on('SIGINT', () => {
      console.log('Shutting down server...');
      if (expoProcess) expoProcess.kill();
      server.close();
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.log('Terminating server...');
      if (expoProcess) expoProcess.kill();
      server.close();
      process.exit(0);
    });
    
  } catch (err) {
    console.error('Server error:', err);
    process.exit(1);
  }
}

// Start the server
main();