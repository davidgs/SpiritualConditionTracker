/**
 * Simple App Proxy Server
 * 
 * Serves the landing page at root and a simple React app at /app
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = 5000;

// Create server
const server = http.createServer((req, res) => {
  console.log(`Received request: ${req.url}`);

  // Serve landing page at root
  if (req.url === '/' || req.url === '') {
    console.log('Serving landing page');
    const landingPagePath = path.join(__dirname, 'landing-page.html');
    
    fs.readFile(landingPagePath, (err, content) => {
      if (err) {
        console.error(`Error reading landing page: ${err.message}`);
        res.writeHead(500);
        res.end('Error loading landing page');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
    return;
  }

  // Serve app at /app path
  if (req.url === '/app' || req.url === '/app/') {
    console.log('Serving app page');
    const appHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Spiritual Condition Tracker</title>
  <style>
    html, body, #root {
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    body {
      background-color: #f5f5f5;
    }
    .app {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    header {
      background-color: #3498db;
      color: white;
      padding: 20px;
      text-align: center;
    }
    h1 {
      margin: 0;
      font-size: 24px;
    }
    .subtitle {
      margin-top: 5px;
      font-size: 16px;
      opacity: 0.9;
    }
    .content {
      flex: 1;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .card {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      padding: 20px;
      margin-bottom: 20px;
      width: 100%;
      max-width: 500px;
    }
    .card h2 {
      color: #2c3e50;
      margin-top: 0;
      font-size: 18px;
    }
    .card p {
      color: #7f8c8d;
      line-height: 1.5;
    }
    .highlight {
      color: #d35400;
      font-weight: bold;
    }
    .stats {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
    }
    .stat {
      text-align: center;
      padding: 0 10px;
    }
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #3498db;
    }
    .stat-label {
      font-size: 14px;
      color: #7f8c8d;
      margin-top: 5px;
    }
    footer {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      color: #7f8c8d;
    }
    #time-display {
      font-size: 14px;
      opacity: 0.7;
      margin-top: 10px;
    }
    nav {
      margin-top: 20px;
    }
    button {
      background-color: #2980b9;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin: 0 5px;
    }
    button:hover {
      background-color: #3498db;
    }
  </style>
</head>
<body>
  <div id="root">
    <div class="app">
      <header>
        <h1>Spiritual Condition Tracker</h1>
        <p class="subtitle">Your AA Recovery Dashboard</p>
        <div id="time-display"></div>
      </header>
      
      <div class="content">
        <div class="card">
          <h2>Welcome to Your Recovery Journey</h2>
          <p>
            This app helps you track your <span class="highlight">spiritual condition</span> and recovery progress.
            Log your daily activities, track meetings, and monitor your spiritual fitness.
          </p>
        </div>
        
        <div class="card">
          <h2>Your Recovery Stats</h2>
          <div class="stats">
            <div class="stat">
              <div class="stat-value">2.45</div>
              <div class="stat-label">Sobriety (years)</div>
            </div>
            <div class="stat">
              <div class="stat-value">128</div>
              <div class="stat-label">Meetings</div>
            </div>
            <div class="stat">
              <div class="stat-value">85%</div>
              <div class="stat-label">Spiritual Fitness</div>
            </div>
          </div>
        </div>
        
        <div class="card">
          <h2>Daily Check-In</h2>
          <p>Keep track of your daily activities that contribute to your spiritual fitness.</p>
          <nav>
            <button id="prayerBtn">Log Prayer</button>
            <button id="meetingBtn">Log Meeting</button>
            <button id="readingBtn">Log Reading</button>
          </nav>
        </div>
      </div>
      
      <footer>
        Spiritual Condition Tracker - AA Recovery App
      </footer>
    </div>
  </div>

  <script>
    // Simple app functionality
    document.addEventListener('DOMContentLoaded', function() {
      console.log('App loaded');
      
      // Display current time
      const timeDisplay = document.getElementById('time-display');
      const updateTime = () => {
        const now = new Date();
        timeDisplay.textContent = now.toLocaleString();
      };
      updateTime();
      setInterval(updateTime, 1000);
      
      // Setup interactive buttons
      document.getElementById('prayerBtn').addEventListener('click', function() {
        alert('Prayer session logged: 20 minutes');
      });
      
      document.getElementById('meetingBtn').addEventListener('click', function() {
        alert('Meeting attendance logged: AA Big Book Study');
      });
      
      document.getElementById('readingBtn').addEventListener('click', function() {
        alert('Reading session logged: 30 minutes');
      });
      
      // Store some data in localStorage
      localStorage.setItem('sobrietyDays', '894');
      localStorage.setItem('meetingsAttended', '128');
      localStorage.setItem('spiritualFitness', '85');
    });
  </script>
</body>
</html>`;
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(appHtml);
    return;
  }

  // Serve static assets
  if (req.url.endsWith('.jpg') || req.url.endsWith('.png') || req.url.endsWith('.ico')) {
    const filePath = path.join(__dirname, req.url);
    
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        res.writeHead(404);
        res.end('File not found');
        return;
      }
      
      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(500);
          res.end('Error reading file');
          return;
        }
        
        let contentType = 'application/octet-stream';
        if (req.url.endsWith('.jpg') || req.url.endsWith('.jpeg')) contentType = 'image/jpeg';
        if (req.url.endsWith('.png')) contentType = 'image/png';
        if (req.url.endsWith('.ico')) contentType = 'image/x-icon';
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      });
    });
    
    return;
  }

  // Default - 404 Not Found
  res.writeHead(404);
  res.end('Not Found');
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Landing page available at http://localhost:${PORT}/`);
  console.log(`App available at http://localhost:${PORT}/app/`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server stopped');
    process.exit(0);
  });
});