/**
 * Ultra-simple script to create a static bundle without Metro or webpack
 * This creates a very basic HTML/JS app that can be served at the /app route
 */
const fs = require('fs');
const path = require('path');

// Configuration
const OUTPUT_DIR = path.join(__dirname, 'static-bundle');

// Ensure output directory exists
function ensureDirExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

// Clean output directory
function cleanOutputDir() {
  if (fs.existsSync(OUTPUT_DIR)) {
    console.log(`Cleaning output directory: ${OUTPUT_DIR}`);
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  }
  
  ensureDirExists(OUTPUT_DIR);
}

// Create static assets directory
function createAssetsDir() {
  const assetsDir = path.join(OUTPUT_DIR, 'assets');
  ensureDirExists(assetsDir);
  return assetsDir;
}

// Copy logo to static assets
function copyLogo(assetsDir) {
  if (fs.existsSync(path.join(__dirname, 'logo.jpg'))) {
    fs.copyFileSync(
      path.join(__dirname, 'logo.jpg'),
      path.join(assetsDir, 'logo.jpg')
    );
    console.log('Copied logo.jpg to assets directory');
    return true;
  }
  return false;
}

// Create HTML file
function createHtmlFile() {
  const htmlPath = path.join(OUTPUT_DIR, 'index.html');
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1" />
  <meta name="theme-color" content="#000000" />
  <title>Spiritual Condition Tracker</title>
  <style>
    html, body {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f5f5f5;
    }
    #app {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .header {
      padding: 20px;
      background-color: #3498db;
      color: white;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .header p {
      margin: 5px 0 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .content {
      padding: 30px;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .card {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      padding: 20px;
      margin-bottom: 20px;
      width: 100%;
      max-width: 500px;
    }
    .card h2 {
      margin-top: 0;
      color: #2c3e50;
      font-size: 18px;
    }
    .card p {
      color: #7f8c8d;
      line-height: 1.5;
    }
    .stats-container {
      display: flex;
      justify-content: space-between;
    }
    .stat {
      text-align: center;
      padding: 10px;
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
    .footer {
      padding: 20px;
      background-color: #f8f9fa;
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
  </style>
</head>
<body>
  <div id="app">
    <div class="header">
      <h1>Spiritual Condition Tracker</h1>
      <p>Your AA Recovery Dashboard</p>
    </div>
    
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
        <div class="stats-container">
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
    </div>
    
    <div class="footer">
      Spiritual Condition Tracker - AA Recovery App
    </div>
  </div>
  
  <script src="./app.js"></script>
</body>
</html>`;
  
  fs.writeFileSync(htmlPath, htmlContent);
  console.log(`Created index.html at ${htmlPath}`);
}

// Create JavaScript file
function createJsFile() {
  const jsPath = path.join(OUTPUT_DIR, 'app.js');
  const jsContent = `// Simple JavaScript for the Spiritual Condition Tracker

document.addEventListener('DOMContentLoaded', function() {
  console.log('Spiritual Condition Tracker app loaded');
  
  // You could add interactive functionality here
  // For now, just display the current date
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Add a date element
  const header = document.querySelector('.header');
  const dateElement = document.createElement('p');
  dateElement.textContent = dateStr;
  dateElement.style.fontSize = '14px';
  dateElement.style.opacity = '0.7';
  dateElement.style.marginTop = '10px';
  header.appendChild(dateElement);
  
  // Add click handlers to cards
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.addEventListener('click', function() {
      this.style.transform = 'scale(1.02)';
      this.style.transition = 'transform 0.2s';
      
      setTimeout(() => {
        this.style.transform = 'scale(1)';
      }, 200);
    });
  });
});`;
  
  fs.writeFileSync(jsPath, jsContent);
  console.log(`Created app.js at ${jsPath}`);
}

// Create a simple landing page
function createAppFilesStruct() {
  // Main HTML file
  createHtmlFile();
  
  // JavaScript file
  createJsFile();
  
  // Assets directory and logo
  const assetsDir = createAssetsDir();
  copyLogo(assetsDir);
}

// Main function
function createSimpleBundle() {
  console.log('=== Creating Simple Static Bundle ===');
  
  // Step 1: Prepare directory
  cleanOutputDir();
  
  // Step 2: Create files
  createAppFilesStruct();
  
  console.log('\n✅ Simple static bundle created successfully!');
  console.log(`Output directory: ${OUTPUT_DIR}`);
}

// Run the main function
createSimpleBundle();