/**
 * Script to create proper symbolic links that Capacitor expects on iOS
 * This solves the "ChunkLoadError" issue without requiring path rewrites
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Main function
async function patchIOS() {
  console.log('Applying iOS Capacitor path patch...');
  
  // Create necessary directories that match Capacitor's expected structure
  const targetDir = path.join(__dirname, 'ios', 'App', 'App', 'public', 'app', 'dist');
  console.log(`Creating Capacitor directory structure: ${targetDir}`);
  
  // Create the nested structure
  fs.mkdirSync(targetDir, { recursive: true });
  
  // Copy all bundle files from the dist directory to the iOS structure
  const sourceDir = path.join(__dirname, 'app', 'dist');
  const files = fs.readdirSync(sourceDir);
  
  // Copy only the bundle.js files
  const bundleFiles = files.filter(file => file.endsWith('.bundle.js'));
  
  console.log(`Copying ${bundleFiles.length} bundle files to iOS structure...`);
  
  // Copy each file
  for (const file of bundleFiles) {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);
    
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`Copied: ${file}`);
  }
  
  console.log('iOS Capacitor path patch completed successfully!');
}

// Run the patch
patchIOS().catch(err => {
  console.error('Error applying iOS patch:', err);
  process.exit(1);
});