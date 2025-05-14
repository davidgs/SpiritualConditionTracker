
// Temporary script to build web bundle
const { execSync } = require('child_process');
const path = require('path');

// Run the Expo build process
console.log('Building Expo web bundle...');
execSync('npx expo build:web --no-pwa', { 
  stdio: 'inherit',
  env: {
    ...process.env,
    // Force build mode
    NODE_ENV: 'production',
    // Prevent browser opening
    BROWSER: 'none'
  }
});

// Export completed
console.log('Expo web build completed!');
    