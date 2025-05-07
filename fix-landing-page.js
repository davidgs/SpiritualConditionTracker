/**
 * Landing Page Fix Script for Spiritual Condition Tracker
 * 
 * This script:
 * 1. Finds and removes any static index.bundle files
 * 2. Updates the landing page to point to the correct location
 * 3. Verifies that nginx is configured correctly
 * 
 * Run with: node fix-landing-page.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration - adjust these paths as needed
const SITE_ROOT = '/var/www/vhosts/spiritual-condition.com/httpdocs';
const APP_PATH = ''; // Empty string for root, or '/app' for a subpath
const CORRECT_APP_URL = `/${APP_PATH}`; // URL where the app should be served
const INDEX_HTML_PATH = path.join(SITE_ROOT, 'index.html');

// Utility function for logging
function log(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${type}] ${message}`);
}

// Step 1: Find and remove any static index.bundle files
function removeStaticBundles() {
  log('Looking for static bundle files...');
  
  try {
    // Use find command to locate any index.bundle files
    const findCmd = `find ${SITE_ROOT} -name "index.bundle" -type f`;
    const foundFiles = execSync(findCmd).toString().trim().split('\n').filter(Boolean);
    
    if (foundFiles.length === 0) {
      log('No static bundle files found.');
      return;
    }
    
    log(`Found ${foundFiles.length} static bundle files. Removing...`);
    
    // Remove each found file
    foundFiles.forEach(file => {
      try {
        fs.unlinkSync(file);
        log(`Removed: ${file}`, 'SUCCESS');
      } catch (error) {
        log(`Failed to remove ${file}: ${error.message}`, 'ERROR');
      }
    });
  } catch (error) {
    log(`Error searching for bundle files: ${error.message}`, 'ERROR');
  }
}

// Step 2: Update the landing page to point to the correct URL
function updateLandingPage() {
  log(`Checking landing page at ${INDEX_HTML_PATH}...`);
  
  if (!fs.existsSync(INDEX_HTML_PATH)) {
    log(`Landing page not found at ${INDEX_HTML_PATH}`, 'ERROR');
    return false;
  }
  
  try {
    // Read the current content
    let htmlContent = fs.readFileSync(INDEX_HTML_PATH, 'utf8');
    
    // Check for the Get Started button
    const buttonRegex = /<a[^>]*href=["']([^"']*)["'][^>]*>([^<]*Get Started[^<]*)<\/a>/i;
    const match = htmlContent.match(buttonRegex);
    
    if (!match) {
      log('No "Get Started" button found in the landing page.', 'WARNING');
      // Try to find any links that might be app links
      const anyLinkRegex = /<a[^>]*href=["']([^"']*)["'][^>]*>/gi;
      const links = [];
      let linkMatch;
      
      while ((linkMatch = anyLinkRegex.exec(htmlContent)) !== null) {
        links.push(linkMatch[1]);
      }
      
      if (links.length > 0) {
        log(`Found ${links.length} links in the page: ${links.join(', ')}`, 'INFO');
      }
      
      return false;
    }
    
    const currentUrl = match[1];
    log(`Current button URL: ${currentUrl}`);
    
    if (currentUrl === CORRECT_APP_URL) {
      log('Button already points to the correct URL.', 'SUCCESS');
      return true;
    }
    
    // Update the URL
    const updatedHtml = htmlContent.replace(
      buttonRegex,
      (fullMatch, url, text) => fullMatch.replace(url, CORRECT_APP_URL)
    );
    
    // Save the updated content
    fs.writeFileSync(INDEX_HTML_PATH, updatedHtml, 'utf8');
    log(`Updated button URL from ${currentUrl} to ${CORRECT_APP_URL}`, 'SUCCESS');
    
    return true;
  } catch (error) {
    log(`Error updating landing page: ${error.message}`, 'ERROR');
    return false;
  }
}

// Step 3: Check nginx configuration
function checkNginxConfig() {
  log('Checking nginx configuration...');
  
  try {
    // Try to get the nginx config for this site
    let nginxConfig = '';
    
    try {
      // First try the sites-available location
      nginxConfig = execSync(`cat /etc/nginx/sites-available/spiritual-condition.com 2>/dev/null`).toString();
    } catch (error) {
      // If that fails, try Plesk's vhost.conf location
      try {
        nginxConfig = execSync(`cat /var/www/vhosts/spiritual-condition.com/conf/vhost.conf 2>/dev/null`).toString();
      } catch (innerError) {
        log('Could not find nginx configuration file.', 'WARNING');
        return;
      }
    }
    
    // Check for cache control headers
    const hasCacheControl = nginxConfig.includes('Cache-Control');
    const hasExpires = nginxConfig.includes('expires');
    const hasEtagOff = nginxConfig.includes('etag off');
    
    if (!hasCacheControl || !hasExpires || !hasEtagOff) {
      log('Nginx configuration might not have proper cache control directives.', 'WARNING');
      log('Consider adding these to your nginx configuration:', 'INFO');
      log(`
location / {
  expires -1;
  add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
  add_header Pragma "no-cache";
  add_header Expires "0";
  etag off;
  if_modified_since off;
  
  # Your existing proxy_pass directive should be here
  proxy_pass http://localhost:3243;
}`, 'INFO');
    } else {
      log('Nginx has cache control directives.', 'SUCCESS');
    }
    
  } catch (error) {
    log(`Error checking nginx configuration: ${error.message}`, 'ERROR');
  }
}

// Step 4: Create a minimal test file to verify cache control
function createTestFile() {
  const testFilePath = path.join(SITE_ROOT, 'cache-test.html');
  const timestamp = new Date().toISOString();
  
  const testContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Cache Test</title>
</head>
<body>
  <h1>Cache Test File</h1>
  <p>This file was generated at: ${timestamp}</p>
  <p>If you refresh the page and this timestamp changes, caching is disabled.</p>
  <p>If the timestamp stays the same after refresh, nginx is still caching content.</p>
</body>
</html>
  `;
  
  try {
    fs.writeFileSync(testFilePath, testContent, 'utf8');
    log(`Created test file at ${testFilePath}`, 'SUCCESS');
    log(`Visit https://spiritual-condition.com/cache-test.html to verify caching is disabled.`, 'INFO');
  } catch (error) {
    log(`Error creating test file: ${error.message}`, 'ERROR');
  }
}

// Main function to execute all steps
async function main() {
  log('Starting landing page fix script...');
  
  // Step 1: Remove static bundles
  removeStaticBundles();
  
  // Step 2: Update landing page
  updateLandingPage();
  
  // Step 3: Check nginx config
  checkNginxConfig();
  
  // Step 4: Create test file
  createTestFile();
  
  log('Script completed. Please check the logs above for any warnings or errors.', 'SUCCESS');
  log('To access your app, visit: https://spiritual-condition.com' + CORRECT_APP_URL, 'INFO');
}

// Run the script
main().catch(error => {
  log(`Unhandled error: ${error.message}`, 'ERROR');
  process.exit(1);
});