/**
 * Minimal deployment server for Spiritual Condition Tracker
 * Designed to work in production environments with minimal dependencies
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

// Configuration
const PORT = 3243;
const PUBLIC_DIR = path.join(__dirname, 'public');
const INDEX_PATH = path.join(PUBLIC_DIR, 'index.html');

// Create Express app
const app = express();

// Serve static files from public directory
app.use(express.static(PUBLIC_DIR));

// Ensure we have a public directory and index.html
function setupPublicFiles() {
  console.log('Setting up public files...');
  
  // Create public directory if it doesn't exist
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    console.log(`Created public directory: ${PUBLIC_DIR}`);
  }
  
  // Copy logo to public directory if needed
  const logoSrc = path.join(__dirname, 'logo.jpg');
  const logoDest = path.join(PUBLIC_DIR, 'logo.jpg');
  
  if (fs.existsSync(logoSrc) && !fs.existsSync(logoDest)) {
    fs.copyFileSync(logoSrc, logoDest);
    console.log('Logo copied to public directory');
  }
  
  // Create a simple index.html if it doesn't exist
  if (!fs.existsSync(INDEX_PATH)) {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Spiritual Condition Tracker</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
          }
          .logo {
            max-width: 250px;
            margin-bottom: 20px;
          }
          .loading {
            margin: 40px 0;
            font-size: 18px;
          }
          .button {
            display: inline-block;
            background: #4A76A8;
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            text-decoration: none;
            font-weight: bold;
            margin: 20px 10px;
          }
        </style>
      </head>
      <body>
        <img src="/logo.jpg" alt="Spiritual Condition Tracker" class="logo">
        <h1>Spiritual Condition Tracker</h1>
        <p>A tool for AA members to monitor their spiritual condition and recovery journey.</p>
        
        <div class="loading">
          <p>The app is currently starting... Please wait.</p>
          <p>If the app doesn't load automatically, click the button below:</p>
          <a href="/app" class="button">Launch App</a>
        </div>
        
        <hr>
        <p>For technical support, please contact your administrator.</p>
      </body>
      </html>
    `;
    
    fs.writeFileSync(INDEX_PATH, htmlContent);
    console.log('Created index.html');
  }
}

// Handle landing page requests and any other routes
app.get('/', (req, res) => {
  res.sendFile(INDEX_PATH);
});

// Redirect all other requests to the Expo app
app.get('/app', (req, res) => {
  res.redirect(`http://localhost:${PORT}/`);
});

// Handle all other routes by returning the index page
app.get('*', (req, res) => {
  res.sendFile(INDEX_PATH);
});

// Set up public files
setupPublicFiles();

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Minimal deployment server running on port ${PORT}`);
});

console.log('Server started successfully');