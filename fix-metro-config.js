/**
 * This script fixes the ExpoMetroConfig.loadAsync issue
 */

const fs = require('fs');
const path = require('path');

// Check if ExpoMetroConfig exists
const metroConfigPath = path.join(__dirname, 'node_modules', '@expo', 'metro-config', 'src', 'ExpoMetroConfig.js');

if (fs.existsSync(metroConfigPath)) {
  console.log('Found ExpoMetroConfig.js');
  let content = fs.readFileSync(metroConfigPath, 'utf8');
  
  // Check if loadAsync function is missing
  if (!content.includes('loadAsync')) {
    console.log('Adding loadAsync function...');
    
    // Add a simple implementation
    const newFunction = `
// Added by fix script to resolve loadAsync() issue
export async function loadAsync(projectRoot, options) {
  return getDefaultConfig(projectRoot, options);
}
`;
    
    // Insert the new function before the existing exports
    content = content.replace('export {', newFunction + 'export {');
    
    // Write back the modified file
    fs.writeFileSync(metroConfigPath, content);
    console.log('Successfully added loadAsync function');
  } else {
    console.log('loadAsync function already exists');
  }
} else {
  console.error('Cannot find ExpoMetroConfig.js');
}