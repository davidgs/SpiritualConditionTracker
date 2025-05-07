/**
 * Landing Page Generator for Spiritual Condition Tracker
 * 
 * This script creates a new landing page (index.html) that correctly links to your app.
 * It also copies your logo to the public directory.
 * 
 * Run with: node create-landing-page.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration - adjust these paths as needed
const SITE_ROOT = '/var/www/vhosts/spiritual-condition.com/httpdocs';
const APP_PATH = ''; // Empty string for root, or '/app' for a subpath
const APP_URL = `/${APP_PATH}`; // URL where the app should be served
const INDEX_HTML_PATH = path.join(SITE_ROOT, 'index.html');
const LOGO_PATH = path.join(__dirname, 'logo.jpg'); // Path to your logo file
const PUBLIC_DIR = path.join(SITE_ROOT, 'public');

// Utility function for logging
function log(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${type}] ${message}`);
}

// Create public directory if it doesn't exist
function ensurePublicDir() {
  if (!fs.existsSync(PUBLIC_DIR)) {
    try {
      fs.mkdirSync(PUBLIC_DIR, { recursive: true });
      log(`Created public directory: ${PUBLIC_DIR}`, 'SUCCESS');
    } catch (error) {
      log(`Failed to create public directory: ${error.message}`, 'ERROR');
      return false;
    }
  }
  return true;
}

// Copy logo to public directory
function copyLogo() {
  if (!fs.existsSync(LOGO_PATH)) {
    log(`Logo not found at ${LOGO_PATH}`, 'ERROR');
    return false;
  }
  
  const publicLogoPath = path.join(PUBLIC_DIR, 'logo.jpg');
  
  try {
    fs.copyFileSync(LOGO_PATH, publicLogoPath);
    log(`Logo copied to ${publicLogoPath}`, 'SUCCESS');
    return true;
  } catch (error) {
    log(`Failed to copy logo: ${error.message}`, 'ERROR');
    return false;
  }
}

// Get current version
function getCurrentVersion() {
  try {
    // Check if package.json exists and get the version
    const packagePath = path.join(__dirname, 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      return packageJson.version || '1.0.0';
    }
    
    // Fallback to app.json
    const appJsonPath = path.join(__dirname, 'app.json');
    if (fs.existsSync(appJsonPath)) {
      const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
      return appJson.expo?.version || '1.0.0';
    }
    
    return '1.0.0';
  } catch (error) {
    log(`Error getting version: ${error.message}`, 'ERROR');
    return '1.0.0';
  }
}

// Create the landing page
function createLandingPage() {
  const version = getCurrentVersion();
  const timestamp = new Date().toISOString();
  
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Spiritual Condition Tracker - Recovery Support for AA Members</title>
  <link rel="icon" href="/public/logo.jpg">
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f8f8f8;
    }
    
    .hero {
      background-color: #fff;
      border-radius: 8px;
      padding: 40px;
      margin-bottom: 40px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      text-align: center;
    }
    
    .logo {
      width: 200px;
      height: auto;
      margin-bottom: 20px;
    }
    
    h1 {
      font-size: 2.5rem;
      margin-bottom: 20px;
      color: #2c3e50;
    }
    
    p {
      font-size: 1.1rem;
      margin-bottom: 20px;
      max-width: 800px;
      margin-left: auto;
      margin-right: auto;
    }
    
    .cta-button {
      display: inline-block;
      background-color: #3498db;
      color: white;
      font-size: 1.2rem;
      font-weight: bold;
      padding: 15px 40px;
      border-radius: 5px;
      text-decoration: none;
      margin-top: 20px;
      transition: background-color 0.3s ease;
    }
    
    .cta-button:hover {
      background-color: #2980b9;
    }
    
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 30px;
      margin-bottom: 40px;
    }
    
    .feature {
      background-color: #fff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .feature h2 {
      font-size: 1.5rem;
      margin-bottom: 15px;
      color: #2c3e50;
    }
    
    footer {
      text-align: center;
      margin-top: 60px;
      color: #7f8c8d;
      font-size: 0.9rem;
    }
    
    @media (max-width: 768px) {
      .hero {
        padding: 30px 20px;
      }
      
      h1 {
        font-size: 2rem;
      }
      
      .features {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="hero">
    <img src="/public/logo.jpg" alt="Spiritual Condition Tracker Logo" class="logo">
    <h1>Spiritual Condition Tracker</h1>
    <p>A comprehensive tool designed specifically for members of Alcoholics Anonymous to track their recovery journey, monitor spiritual condition, and connect with others in the program.</p>
    <a href="${APP_URL}" class="cta-button">Get Started</a>
  </div>
  
  <div class="features">
    <div class="feature">
      <h2>Track Your Recovery</h2>
      <p>Log meetings, prayer and meditation time, literature reading, and interactions with sponsors and sponsees to monitor your spiritual fitness.</p>
    </div>
    
    <div class="feature">
      <h2>Connect Securely</h2>
      <p>Discover nearby members and connect through our step-by-step proximity wizard while maintaining your privacy and anonymity.</p>
    </div>
    
    <div class="feature">
      <h2>Manage Meetings</h2>
      <p>Create and manage your personal list of meetings with calendar integration for reminders and sharing capabilities.</p>
    </div>
  </div>
  
  <footer>
    <p>Spiritual Condition Tracker v${version} | Last updated: ${timestamp}</p>
    <p>This app respects your privacy. All data is stored locally on your device.</p>
  </footer>
  
  <!-- Cache busting script -->
  <script>
    // Force reload if the app version changes
    function checkVersion() {
      const currentVersion = "${version}";
      const storedVersion = localStorage.getItem('app_version');
      
      if (storedVersion && storedVersion !== currentVersion) {
        console.log('App version changed. Clearing cache and reloading.');
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload(true);
      }
      
      localStorage.setItem('app_version', currentVersion);
    }
    
    // Run on page load
    checkVersion();
  </script>
</body>
</html>`;
  
  try {
    // Backup existing file if it exists
    if (fs.existsSync(INDEX_HTML_PATH)) {
      const backupPath = `${INDEX_HTML_PATH}.backup.${Date.now()}`;
      fs.copyFileSync(INDEX_HTML_PATH, backupPath);
      log(`Backed up existing index.html to ${backupPath}`, 'INFO');
    }
    
    // Write new file
    fs.writeFileSync(INDEX_HTML_PATH, htmlContent, 'utf8');
    log(`Created new landing page at ${INDEX_HTML_PATH}`, 'SUCCESS');
    return true;
  } catch (error) {
    log(`Failed to create landing page: ${error.message}`, 'ERROR');
    return false;
  }
}

// Main function to execute all steps
async function main() {
  log('Starting landing page generator...');
  
  // Step 1: Ensure public directory exists
  if (!ensurePublicDir()) {
    log('Failed to create public directory. Exiting.', 'ERROR');
    return;
  }
  
  // Step 2: Copy logo
  copyLogo();
  
  // Step 3: Create landing page
  createLandingPage();
  
  log('Landing page generation completed. Check for any warnings or errors above.', 'SUCCESS');
  log('To view your new landing page, visit: https://spiritual-condition.com', 'INFO');
}

// Run the script
main().catch(error => {
  log(`Unhandled error: ${error.message}`, 'ERROR');
  process.exit(1);
});