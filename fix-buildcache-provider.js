/**
 * Fix for the './buildCacheProvider' module error in @expo/config
 * This script creates the missing module file that's causing the error
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function fixBuildCacheProviderError() {
  console.log('Checking for buildCacheProvider error...');
  
  // Add the EXACT path from the error message first
  const exactErrorPath = '/Users/davidgs/github.com/SpiritualConditionTracker/node_modules/@expo/config/build';
  
  // Try multiple potential paths for the @expo/config module
  const potentialPaths = [
    exactErrorPath, // Exact path from error
    path.join(__dirname, 'node_modules', '@expo', 'config', 'build'),
    path.join(__dirname, 'expo-app', 'node_modules', '@expo', 'config', 'build'),
    path.join(process.cwd(), 'node_modules', '@expo', 'config', 'build'),
    path.join(process.cwd(), '..', 'node_modules', '@expo', 'config', 'build')
  ];
  
  let fixApplied = false;
  
  // Try to find and fix all potential instances
  for (const configDir of potentialPaths) {
    // Path to the missing file
    const missingFilePath = path.join(configDir, 'buildCacheProvider.js');
    
    // Check if the directory exists
    if (!fs.existsSync(configDir)) {
      // For the exact error path, try to create the directory if possible
      if (configDir === exactErrorPath) {
        try {
          console.log(`Creating directory structure for: ${configDir}`);
          fs.mkdirSync(configDir, { recursive: true });
        } catch (error) {
          console.log(`Could not create directory: ${error.message}`);
          console.log(`Skipping path: ${configDir}`);
          continue;
        }
      } else {
        console.log(`Skipping path (not found): ${configDir}`);
        continue;
      }
    }
    
    // Check if the file already exists
    if (fs.existsSync(missingFilePath)) {
      console.log(`buildCacheProvider already exists at: ${missingFilePath}`);
      continue;
    }
    
    // Create the missing file
    applyFixToPath(configDir, missingFilePath);
    fixApplied = true;
  }
  
  if (!fixApplied) {
    console.log('Could not find any @expo/config/build directories that need fixing');
    console.log('Trying to find any @expo/config installations in node_modules...');
    
    // Fallback: try to find any expo config installation
    try {
      // Use find to locate any expo config modules in node_modules
      const findCmd = process.platform === 'win32' 
        ? `where /r . @expo\\config\\build` 
        : `find ${process.cwd()} -path "*node_modules/@expo/config/build" -type d`;
        
      const { execSync } = require('child_process');
      const foundPaths = execSync(findCmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] })
        .trim()
        .split('\n')
        .filter(line => line.length > 0);
      
      if (foundPaths.length > 0) {
        console.log(`Found ${foundPaths.length} potential @expo/config paths with find command`);
        
        foundPaths.forEach(configDir => {
          const missingFilePath = path.join(configDir, 'buildCacheProvider.js');
          
          if (!fs.existsSync(missingFilePath)) {
            applyFixToPath(configDir, missingFilePath);
            fixApplied = true;
          }
        });
      }
    } catch (error) {
      console.log('Error searching for @expo/config directories:', error.message);
    }
  }
  
  // If no fix was applied, create a minimal bundle
  if (!fixApplied) {
    console.log('No fix was applied - could not find or fix @expo/config module');
    console.log('Creating a minimal bundle directly as a fallback...');
    createMinimalBundle();
  }
  
  // Check if the bundle reference exists in Xcode project
  checkXcodeProject();
}

function applyFixToPath(configDir, missingFilePath) {
  // Create a simple implementation of the missing module
  const fileContent = `/**
 * This is a placeholder implementation for the missing buildCacheProvider module
 * Created by fix-buildcache-provider.js to resolve module import errors
 */

// Simple cache provider implementation that does nothing
function createCacheProvider() {
  return {
    get: async () => null,
    put: async () => {},
    clear: async () => {},
  };
}

module.exports = {
  createCacheProvider,
};
`;
  
  try {
    // Write the file
    fs.writeFileSync(missingFilePath, fileContent);
    console.log(`Created missing module file: ${missingFilePath}`);
  } catch (error) {
    console.error(`Error creating buildCacheProvider file at ${missingFilePath}: ${error.message}`);
  }
}

// Create a minimal bundle directly as a fallback
function createMinimalBundle() {
  console.log('Creating a minimal bundle file for iOS...');
  
  // Define the bundle directory and path
  const iosDir = path.join(process.cwd(), 'ios');
  const assetsDir = path.join(iosDir, 'assets');
  const bundlePath = path.join(assetsDir, 'main.jsbundle');
  
  // Create directories if they don't exist
  if (!fs.existsSync(iosDir)) {
    console.log(`Creating directory: ${iosDir}`);
    fs.mkdirSync(iosDir, { recursive: true });
  }
  
  if (!fs.existsSync(assetsDir)) {
    console.log(`Creating directory: ${assetsDir}`);
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  
  // Bundle content - minimal bundle that shows an error message
  const bundleContent = `/**
 * Minimal bundle for iOS that displays an error message
 * Created by fix-buildcache-provider.js
 */
__d(function(g,r,i,a,m,e,d){var t=r(d[0]);Object.defineProperty(e,"__esModule",{value:!0}),e.default=function(){return t.createElement("view",{style:{flex:1,justifyContent:"center",alignItems:"center",backgroundColor:"#F8F8F8"}},t.createElement("text",{style:{fontSize:18,color:"#E53935",textAlign:"center",margin:10}},"JavaScript Bundle Loading Error"),t.createElement("text",{style:{fontSize:14,color:"#333333",textAlign:"center",margin:10}},"The JavaScript bundle could not be loaded.\\n\\nPlease check the build configuration."))};var n=t},0,[1]);
__d(function(g,r,i,a,m,e,d){"use strict";m.exports=r(d[0])},1,[2]);
__d(function(g,r,i,a,m,e,d){"use strict";m.exports=r(d[0])},2,[3]);
__d(function(g,r,i,a,m,e,d){"use strict";m.exports={createElement:function(e,t){return{type:e,props:t}}}},3,[]);
require(0);
`;

  // Write the bundle file
  try {
    fs.writeFileSync(bundlePath, bundleContent);
    console.log(`Successfully created minimal bundle at: ${bundlePath}`);
    return bundlePath;
  } catch (error) {
    console.error(`Error creating bundle: ${error.message}`);
    return null;
  }
}

// Check Xcode project to see if it references the bundle
function checkXcodeProject() {
  console.log('Checking Xcode project for bundle reference...');
  
  // Find pbxproj files
  try {
    const findCmd = spawnSync('find', [process.cwd(), '-name', '*.pbxproj'], { encoding: 'utf8' });
    let pbxprojFiles = [];
    
    if (findCmd.status === 0 && findCmd.stdout) {
      pbxprojFiles = findCmd.stdout.trim().split('\n').filter(f => f);
    }
    
    if (pbxprojFiles.length === 0) {
      console.log('No Xcode project files found.');
      return;
    }
    
    // Check each project file
    let bundleReferenced = false;
    
    pbxprojFiles.forEach(pbxproj => {
      console.log(`Checking: ${pbxproj}`);
      
      try {
        const content = fs.readFileSync(pbxproj, 'utf8');
        if (content.includes('main.jsbundle')) {
          console.log(`✅ Bundle is referenced in: ${pbxproj}`);
          bundleReferenced = true;
        }
      } catch (error) {
        console.error(`Error reading ${pbxproj}: ${error.message}`);
      }
    });
    
    if (!bundleReferenced) {
      console.log('⚠️ main.jsbundle is not referenced in any Xcode project');
      console.log('You will need to manually add it to your Xcode project:');
      console.log('1. Open Xcode and your project');
      console.log('2. Right-click on your project in the Project Navigator');
      console.log('3. Select "Add Files to "YourProject"..."');
      console.log('4. Navigate to ios/assets and select main.jsbundle');
      console.log('5. Make sure "Copy items if needed" is checked');
      console.log('6. Click Add');
    }
  } catch (error) {
    console.log(`Error checking Xcode project: ${error.message}`);
  }
}

// Run the fix immediately when this script is executed directly
if (require.main === module) {
  fixBuildCacheProviderError();
}

// Export the function so it can be required by other modules
module.exports = fixBuildCacheProviderError;