/**
 * Script to export a static bundle of our React Native app
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Destination directory for the bundle
const OUTPUT_DIR = path.join(__dirname, 'static-bundle');

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`Created output directory: ${OUTPUT_DIR}`);
}

try {
  console.log('Creating static bundle of the React Native app...');
  console.log('Running expo export...');
  
  // Run the Expo export command to create a static web build
  execSync('npx expo export --platform web --output-dir ./static-bundle --public-url /app/', {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production'
    }
  });
  
  console.log('\n✅ Static bundle of the React Native app created successfully!');
  console.log(`Output directory: ${OUTPUT_DIR}`);
} catch (error) {
  console.error('❌ Error creating static bundle:', error.message);
  process.exit(1);
}