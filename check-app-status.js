/**
 * Simple status check server for Spiritual Condition Tracker
 * 
 * This script:
 * 1. Creates a simple HTTP server to check the status of the Expo app
 * 2. No dependencies on external modules - uses only Node.js core modules
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Port for our status check server
const PORT = 5000;

// Function to check if the Expo server is running
function checkExpoServer(callback) {
  // Try connecting to hosts in sequence
  function tryConnect(host, hostsToTry) {
    console.log(`Checking if Expo server is running at ${host}:3243...`);
    
    // Try a direct HTTP request first - simpler and more reliable
    const options = {
      hostname: host,
      port: 3243,
      path: '/',
      method: 'GET',
      timeout: 10000
    };
    
    const req = http.request(options, (res) => {
      // If we get a response, the server is running
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      
      res.on('end', () => {
        // Success! Update the last working host
        lastWorkingHost = host;
        console.log(`Successfully connected to Expo at ${host}:3243`);
        
        callback({
          status: 'ok',
          statusCode: res.statusCode,
          dataLength: data.length,
          hostname: host,
          message: `Expo server is running at ${host}:3243`
        });
      });
    });
    
    req.on('error', (err) => {
      console.log(`HTTP request to ${host}:3243 failed: ${err.message}`);
      tryNextHost();
    });
    
    req.on('timeout', () => {
      console.log(`HTTP request to ${host}:3243 timed out`);
      req.destroy();
      tryNextHost();
    });
    
    req.end();
    
    // Function to try the next host in the list
    function tryNextHost() {
      if (hostsToTry.length > 0) {
        const nextHost = hostsToTry.shift();
        console.log(`Could not connect to Expo on ${host}, trying ${nextHost}...`);
        tryConnect(nextHost, hostsToTry);
      } else {
        console.log(`All hosts failed, last attempt was ${host}`);
        callback({
          status: 'error',
          message: `Error connecting to Expo: connect ECONNREFUSED ${host}:3243`
        });
      }
    }
  }
  
  // Use last known working host first if available, then try others
  const hostsToTry = ['localhost', '127.0.0.1', '0.0.0.0'].filter(h => h !== lastWorkingHost);
  tryConnect(lastWorkingHost, hostsToTry);
}

// Global variable to track the last known working host
let lastWorkingHost = 'localhost';

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  console.log(`Request received: ${pathname} from ${req.socket.remoteAddress}`);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  // Serve our status page
  if (pathname === '/status') {
    try {
      const statusHtml = fs.readFileSync(path.join(__dirname, 'app-status.html'), 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(statusHtml);
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Error reading status page: ${error.message}`);
    }
    return;
  }
  
  // Check if the Expo server is running
  if (pathname === '/check-expo') {
    checkExpoServer((result) => {
      res.writeHead(result.status === 'ok' ? 200 : 500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result, null, 2));
    });
    return;
  }
  
  // Redirect to the Expo server for /app requests
  if (pathname.startsWith('/app')) {
    // Use our last known working host and prepare alternative hosts
    const primaryHost = lastWorkingHost;
    const alternativeHosts = ['localhost', '127.0.0.1', '0.0.0.0'].filter(h => h !== primaryHost);
    
    console.log(`Using primary host for iframe: ${primaryHost} (alternatives: ${alternativeHosts.join(', ')})`);
    
    // Create a robust iframe that will try multiple hosts
    const iframeHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Spiritual Condition Tracker App</title>
        <style>
          body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
          iframe { width: 100%; height: 100%; border: none; }
          #error-message { 
            display: none; 
            position: fixed; 
            top: 50%; 
            left: 50%; 
            transform: translate(-50%, -50%);
            padding: 20px; 
            background-color: #f8d7da; 
            border: 1px solid #f5c6cb; 
            border-radius: 5px;
            color: #721c24; 
            text-align: center;
            max-width: 80%;
          }
          #loading { 
            position: fixed; 
            top: 50%; 
            left: 50%; 
            transform: translate(-50%, -50%);
            font-family: sans-serif;
            text-align: center;
          }
          .spinner {
            width: 40px;
            height: 40px;
            margin: 20px auto;
            border: 4px solid rgba(0,0,0,0.1);
            border-radius: 50%;
            border-top: 4px solid #3498db;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
        <script>
          // Array of hosts to try
          const hosts = ${JSON.stringify([primaryHost, ...alternativeHosts])};
          let currentHostIndex = 0;
          let loadAttempts = 0;
          const maxLoadAttempts = 6;
          
          // Function to try loading the app from different hosts
          function loadAppFromHost(hostIndex) {
            if (hostIndex >= hosts.length) {
              // We've tried all hosts, so start over with the first one
              hostIndex = 0;
              loadAttempts++;
              
              if (loadAttempts >= maxLoadAttempts) {
                // We've tried too many times, show an error
                document.getElementById('loading').style.display = 'none';
                document.getElementById('error-message').style.display = 'block';
                return;
              }
            }
            
            const host = hosts[hostIndex];
            const iframe = document.getElementById('app-iframe');
            
            console.log('Trying to load app from host: ' + host + ' (attempt ' + loadAttempts + ')');
            document.getElementById('host-name').textContent = host;
            
            // Set a timeout to try the next host if this one doesn't load
            const loadTimeout = setTimeout(() => {
              console.log('Load timeout for host: ' + host);
              loadAppFromHost(hostIndex + 1);
            }, 3000);
            
            // Update iframe src
            iframe.onload = function() {
              // Clear the timeout since the iframe loaded successfully
              clearTimeout(loadTimeout);
              console.log('Successfully loaded app from host: ' + host);
              
              // Hide the loading indicator
              document.getElementById('loading').style.display = 'none';
              
              // Store this successful host in sessionStorage for future use
              try {
                sessionStorage.setItem('last_working_host', host);
              } catch(e) {
                console.error('Failed to save host to sessionStorage:', e);
              }
            };
            
            iframe.onerror = function() {
              // Clear the timeout and immediately try the next host
              clearTimeout(loadTimeout);
              console.log('Error loading from host: ' + host);
              loadAppFromHost(hostIndex + 1);
            };
            
            iframe.src = 'http://' + host + ':3243${pathname}';
          }
          
          // Start loading when the page is ready
          document.addEventListener('DOMContentLoaded', function() {
            // Check if we have a previously working host in sessionStorage
            let startHostIndex = 0;
            try {
              const savedHost = sessionStorage.getItem('last_working_host');
              if (savedHost) {
                const savedIndex = hosts.indexOf(savedHost);
                if (savedIndex !== -1) {
                  startHostIndex = savedIndex;
                  console.log('Using previously successful host: ' + savedHost);
                }
              }
            } catch(e) {
              console.error('Failed to retrieve host from sessionStorage:', e);
            }
            
            // Start the loading process
            loadAppFromHost(startHostIndex);
          });
          
          // Function to retry loading if the user clicks the retry button
          function retryLoading() {
            document.getElementById('error-message').style.display = 'none';
            document.getElementById('loading').style.display = 'block';
            loadAttempts = 0;
            loadAppFromHost(0);
          }
        </script>
      </head>
      <body>
        <div id="loading">
          <div class="spinner"></div>
          <p>Loading app from <span id="host-name">${primaryHost}</span>...</p>
        </div>
        
        <div id="error-message">
          <h3>Unable to Connect</h3>
          <p>We couldn't connect to the app server after multiple attempts.</p>
          <p>Please check if the server is running and try again.</p>
          <button onclick="retryLoading()">Retry</button>
        </div>
        
        <iframe 
          id="app-iframe"
          style="display:block;"
          allow="geolocation; microphone; camera; midi; encrypted-media; fullscreen"
        ></iframe>
      </body>
      </html>
    `;
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(iframeHtml);
    return;
  }
  
  // Serve the main index.html
  if (pathname === '/') {
    try {
      const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(indexHtml);
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Error reading index page: ${error.message}`);
    }
    return;
  }
  
  // Default response for other paths
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

// Start the server
server.listen(PORT, () => {
  console.log(`Status check server running on port ${PORT}`);
  console.log(`Access the status page at: http://localhost:${PORT}/status`);
  console.log(`Access the app at: http://localhost:${PORT}/app`);
  
  // Immediately check if the Expo server is running
  checkExpoServer((result) => {
    console.log(`Initial Expo server check: ${result.status}`);
    if (result.status === 'ok') {
      console.log(`Expo server is running with status code: ${result.statusCode}`);
    } else {
      console.log(`Expo server check failed: ${result.message}`);
    }
  });
});