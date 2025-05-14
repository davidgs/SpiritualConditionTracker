/**
 * Create a simple static app bundle for the React Native app
 */
const fs = require('fs');
const path = require('path');

// Output directory
const OUTPUT_DIR = path.join(__dirname, 'static-bundle');

// Clean and recreate output directory
console.log('Cleaning output directory...');
if (fs.existsSync(OUTPUT_DIR)) {
  fs.rmSync(OUTPUT_DIR, { recursive: true });
}
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Create assets directory
const assetsDir = path.join(OUTPUT_DIR, 'assets');
fs.mkdirSync(assetsDir, { recursive: true });

// Create HTML file
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
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
    #app {
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
    .logo {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      margin: 0 auto 20px;
      display: block;
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
  <div id="app">
    <header>
      <h1>Spiritual Condition Tracker</h1>
      <p class="subtitle">Your AA Recovery Dashboard</p>
    </header>
    
    <div class="content">
      <div class="card">
        <h2>Welcome to Your Recovery Journey</h2>
        <p>
          This app helps you track your spiritual condition and recovery progress.
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
  
  <script src="app.js"></script>
</body>
</html>`;

// Create JavaScript file that represents app functionality
const jsContent = `// Spiritual Condition Tracker App

document.addEventListener('DOMContentLoaded', function() {
  console.log('Spiritual Condition Tracker App loaded');
  
  // Get current date
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Add date to header
  const header = document.querySelector('header');
  const dateElement = document.createElement('p');
  dateElement.textContent = dateStr;
  dateElement.style.fontSize = '14px';
  dateElement.style.opacity = '0.7';
  dateElement.style.marginTop = '10px';
  header.appendChild(dateElement);
  
  // Setup basic interactions
  document.getElementById('prayerBtn').addEventListener('click', function() {
    alert('Prayer session logged: 20 minutes');
  });
  
  document.getElementById('meetingBtn').addEventListener('click', function() {
    alert('Meeting attendance logged: AA Big Book Study');
  });
  
  document.getElementById('readingBtn').addEventListener('click', function() {
    alert('Reading session logged: 30 minutes');
  });
  
  // Simulate data from our app
  let localData = {
    sobrietyDays: 894, // 2.45 years
    meetingsAttended: 128,
    spiritualFitness: 85,
    activities: [
      { type: 'prayer', date: '2025-05-13', duration: 20 },
      { type: 'meeting', date: '2025-05-12', name: 'Big Book Study' },
      { type: 'reading', date: '2025-05-11', duration: 30 }
    ]
  };
  
  // Store the data in localStorage (for web)
  localStorage.setItem('spiritualTrackerData', JSON.stringify(localData));
  
  console.log('App data initialized');
});`;

// Write files to output directory
fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), htmlContent);
console.log('Created index.html');

fs.writeFileSync(path.join(OUTPUT_DIR, 'app.js'), jsContent);
console.log('Created app.js');

// Copy logo if exists
const logoPath = path.join(__dirname, 'logo.jpg');
if (fs.existsSync(logoPath)) {
  fs.copyFileSync(logoPath, path.join(assetsDir, 'logo.jpg'));
  console.log('Copied logo.jpg to assets directory');
}

console.log('✅ Static bundle created successfully!');
console.log(`Bundle is available at: ${OUTPUT_DIR}`);