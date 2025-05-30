/**
 * Ultra-simple server for Spiritual Condition Tracker
 * Using only built-in Node.js modules
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = 5000;

// Create a simple HTML page with the app interface
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Spiritual Condition Tracker</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
      color: #333;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .title {
      font-size: 28px;
      color: #2c3e50;
      margin-bottom: 8px;
    }
    .subtitle {
      font-size: 16px;
      color: #7f8c8d;
    }
    .card {
      background-color: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .content {
      margin-bottom: 15px;
    }
    h2 {
      color: #34495e;
      margin-top: 0;
    }
    .feature-list {
      list-style-type: none;
      padding-left: 0;
    }
    .feature-list li {
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }
    .feature-list li:last-child {
      border-bottom: none;
    }
    .feature-list li:before {
      content: "✓";
      color: #27ae60;
      margin-right: 10px;
    }
    .button {
      display: inline-block;
      background-color: #3498db;
      color: white;
      padding: 10px 20px;
      border-radius: 4px;
      text-decoration: none;
      margin-right: 10px;
      font-weight: bold;
    }
    .counter {
      text-align: center;
      margin: 20px 0;
    }
    .counter-value {
      font-size: 24px;
      font-weight: bold;
      color: #2c3e50;
      margin: 10px 0;
    }
    .counter-button {
      background-color: #3498db;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }
    .counter-button:hover {
      background-color: #2980b9;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">Spiritual Condition Tracker</h1>
      <p class="subtitle">Your partner on the journey to spiritual fitness</p>
    </div>
    
    <div class="card">
      <h2>Welcome to the App</h2>
      <div class="content">
        <p>This application helps individuals in AA recovery track their spiritual condition and growth. Keep track of meetings, prayer time, literature reading, and interactions with sponsors.</p>
      </div>
    </div>
    
    <div class="card">
      <h2>Interactive Counter</h2>
      <div class="counter">
        <p>Track your daily meditation minutes:</p>
        <div class="counter-value" id="counter-value">0</div>
        <button class="counter-button" id="increment-button">Add 5 Minutes</button>
        <button class="counter-button" id="decrement-button" style="background-color: #e74c3c;">Subtract 5 Minutes</button>
      </div>
    </div>
    
    <div class="card">
      <h2>Key Features</h2>
      <ul class="feature-list">
        <li>Track meetings attended</li>
        <li>Log prayer and meditation time</li>
        <li>Record reading of AA literature</li>
        <li>Monitor interactions with sponsors and sponsees</li>
        <li>Calculate your "Spiritual Fitness" score</li>
      </ul>
    </div>
  </div>
  
  <script>
    // Simple counter functionality
    let counterValue = 0;
    const counterValueElement = document.getElementById('counter-value');
    const incrementButton = document.getElementById('increment-button');
    const decrementButton = document.getElementById('decrement-button');
    
    incrementButton.addEventListener('click', () => {
      counterValue += 5;
      updateCounter();
    });
    
    decrementButton.addEventListener('click', () => {
      counterValue = Math.max(0, counterValue - 5);
      updateCounter();
    });
    
    function updateCounter() {
      counterValueElement.textContent = counterValue;
    }
  </script>
</body>
</html>
`;

// Write the HTML file
fs.writeFileSync('app.html', htmlContent);

// Create HTTP server
const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  // Set CORS headers
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
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(htmlContent);
  } 
  // Status API endpoint
  else if (req.url === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      features: [
        'Track meetings attended',
        'Log prayer and meditation time',
        'Record reading of AA literature',
        'Monitor interactions with sponsors and sponsees',
        'Calculate "Spiritual Fitness" score'
      ],
      version: '1.0',
      timestamp: new Date().toISOString()
    }));
  }
  // Not found
  else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});