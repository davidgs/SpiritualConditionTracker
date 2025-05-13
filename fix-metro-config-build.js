/**
 * This script fixes the ExpoMetroConfig.loadAsync issue at build output level
 */

const fs = require('fs');
const path = require('path');

// Path to the built ExpoMetroConfig.js
const metroConfigPath = path.join(__dirname, 'node_modules', '@expo', 'metro-config', 'build', 'ExpoMetroConfig.js');

if (fs.existsSync(metroConfigPath)) {
  console.log('Found ExpoMetroConfig.js build output file');
  
  // Instead of creating a separate patch file, directly modify the ExpoMetroConfig.js file
  let content = fs.readFileSync(metroConfigPath, 'utf8');
  
  // Check if loadAsync is properly exported
  if (content.includes('exports.loadAsync = loadAsync;')) {
    console.log('loadAsync is already properly exported');
  } else {
    console.log('Adding loadAsync to exports...');
    
    // Add the export for loadAsync
    content = content.replace(
      'exports.getDefaultConfig = getDefaultConfig;', 
      'exports.getDefaultConfig = getDefaultConfig;\nexports.loadAsync = loadAsync;'
    );
    
    fs.writeFileSync(metroConfigPath, content);
    console.log('Successfully added loadAsync to exports');
  }
  
  // Create a simple index.js to re-export everything from ExpoMetroConfig.js
  const indexPath = path.join(__dirname, 'node_modules', '@expo', 'metro-config', 'build', 'index.js');
  
  const indexContent = `
// This file re-exports everything from ExpoMetroConfig.js
// This ensures the loadAsync function is accessible through the standard import path
const ExpoMetroConfig = require('./ExpoMetroConfig');
module.exports = ExpoMetroConfig;
`;

  fs.writeFileSync(indexPath, indexContent);
  console.log('Created index.js to re-export ExpoMetroConfig');
  
  // Update package.json to use index.js as the entry point
  const pkgJsonPath = path.join(__dirname, 'node_modules', '@expo', 'metro-config', 'package.json');
  if (fs.existsSync(pkgJsonPath)) {
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
    if (pkgJson.main === 'build/ExpoMetroConfig.js') {
      pkgJson.main = 'build/index.js';
      fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
      console.log('Updated package.json to use build/index.js as main entry point');
    }
  }
} else {
  console.error('Cannot find ExpoMetroConfig.js build output');
}

console.log('Metro config patch completed');