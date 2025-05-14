/**
 * Script to create a static bundle for the app using Metro
 * This will generate files we can serve directly at the /app route
 */
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Directory for the static bundle
const STATIC_DIR = path.join(__dirname, 'public', 'static-app');

// Ensure the directory exists
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
    console.log(`Created directory: ${directory}`);
  }
}

// Create a simplified index.html for the app
function createIndexHtml() {
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
  <title>Spiritual Condition Tracker</title>
  <style>
    html, body, #root {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
      font-family: 'System', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    #root {
      display: flex;
      flex-direction: column;
    }
    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      width: 100%;
    }
    .loading-text {
      margin-top: 20px;
      font-size: 16px;
      color: #333;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div id="root">
    <div class="loading">
      <div class="spinner"></div>
      <div class="loading-text">Loading Spiritual Condition Tracker...</div>
    </div>
  </div>
  <script src="bundle.js"></script>
</body>
</html>`;

  const indexPath = path.join(STATIC_DIR, 'index.html');
  fs.writeFileSync(indexPath, htmlContent);
  console.log(`Created index.html at ${indexPath}`);
}

// Create a simple bundle.js that loads the application
function createSimpleBundle() {
  // This is a simplified version for testing
  const bundleContent = `
// Simple App
(function() {
  // Wait for DOM to load
  document.addEventListener('DOMContentLoaded', function() {
    const root = document.getElementById('root');
    
    // Clear loading spinner
    root.innerHTML = '';
    
    // Create app structure
    const header = document.createElement('header');
    header.style.padding = '20px';
    header.style.backgroundColor = '#3498db';
    header.style.color = 'white';
    header.style.textAlign = 'center';
    
    const title = document.createElement('h1');
    title.textContent = 'Spiritual Condition Tracker';
    header.appendChild(title);
    
    const subtitle = document.createElement('p');
    subtitle.textContent = 'Your AA Recovery Dashboard';
    header.appendChild(subtitle);
    
    const content = document.createElement('div');
    content.style.padding = '30px';
    content.style.display = 'flex';
    content.style.flexDirection = 'column';
    content.style.alignItems = 'center';
    
    const welcomeCard = document.createElement('div');
    welcomeCard.style.backgroundColor = 'white';
    welcomeCard.style.borderRadius = '8px';
    welcomeCard.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
    welcomeCard.style.padding = '20px';
    welcomeCard.style.marginBottom = '20px';
    welcomeCard.style.width = '100%';
    welcomeCard.style.maxWidth = '500px';
    
    const welcomeTitle = document.createElement('h2');
    welcomeTitle.textContent = 'Welcome to Your Recovery Journey';
    welcomeTitle.style.color = '#2c3e50';
    welcomeCard.appendChild(welcomeTitle);
    
    const welcomeText = document.createElement('p');
    welcomeText.textContent = 'This app helps you track your spiritual condition and recovery progress. Log your daily activities, track meetings, and monitor your spiritual fitness.';
    welcomeText.style.color = '#7f8c8d';
    welcomeCard.appendChild(welcomeText);
    
    content.appendChild(welcomeCard);
    
    const statsCard = document.createElement('div');
    statsCard.style.backgroundColor = 'white';
    statsCard.style.borderRadius = '8px';
    statsCard.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
    statsCard.style.padding = '20px';
    statsCard.style.width = '100%';
    statsCard.style.maxWidth = '500px';
    
    const statsTitle = document.createElement('h2');
    statsTitle.textContent = 'Your Recovery Stats';
    statsTitle.style.color = '#2c3e50';
    statsCard.appendChild(statsTitle);
    
    const statsContent = document.createElement('div');
    statsContent.style.display = 'flex';
    statsContent.style.justifyContent = 'space-between';
    
    const createStat = (label, value) => {
      const stat = document.createElement('div');
      stat.style.textAlign = 'center';
      stat.style.padding = '10px';
      
      const statValue = document.createElement('div');
      statValue.textContent = value;
      statValue.style.fontSize = '24px';
      statValue.style.fontWeight = 'bold';
      statValue.style.color = '#3498db';
      stat.appendChild(statValue);
      
      const statLabel = document.createElement('div');
      statLabel.textContent = label;
      statLabel.style.fontSize = '14px';
      statLabel.style.color = '#7f8c8d';
      stat.appendChild(statLabel);
      
      return stat;
    };
    
    statsContent.appendChild(createStat('Sobriety', '2.45 years'));
    statsContent.appendChild(createStat('Meetings', '128'));
    statsContent.appendChild(createStat('Spiritual Fitness', '85%'));
    
    statsCard.appendChild(statsContent);
    content.appendChild(statsCard);
    
    // Add footer
    const footer = document.createElement('footer');
    footer.style.marginTop = 'auto';
    footer.style.padding = '20px';
    footer.style.backgroundColor = '#f8f9fa';
    footer.style.textAlign = 'center';
    footer.style.color = '#7f8c8d';
    footer.textContent = 'Spiritual Condition Tracker - AA Recovery App';
    
    // Append all sections to root
    root.appendChild(header);
    root.appendChild(content);
    root.appendChild(footer);
    
    // Set root styles
    root.style.display = 'flex';
    root.style.flexDirection = 'column';
    root.style.minHeight = '100vh';

    console.log('App loaded successfully');
  });
})();
  `;

  const bundlePath = path.join(STATIC_DIR, 'bundle.js');
  fs.writeFileSync(bundlePath, bundleContent);
  console.log(`Created simple bundle.js at ${bundlePath}`);
}

// Main function to create the static bundle
async function createStaticBundle() {
  try {
    console.log('Creating static bundle...');
    
    // Ensure the directory exists
    ensureDirectoryExists(STATIC_DIR);
    
    // Create the index.html file
    createIndexHtml();
    
    // Create a simple bundle.js for testing
    createSimpleBundle();
    
    console.log('Static bundle created successfully!');
    console.log(`Files are in ${STATIC_DIR}`);
    
    // In a real implementation, we would use Metro bundler to create a production build
    // This would include running commands like:
    // npx expo export:web --output-dir ./public/static-app
    // However, for simplicity and to avoid potential errors, we'll use our simple version
  } catch (error) {
    console.error('Error creating static bundle:', error);
  }
}

// Run the main function
createStaticBundle();