/**
 * Podfile Fix Tool for Spiritual Condition Tracker
 * 
 * This script fixes common issues with the Podfile, particularly:
 * 1. Merging multiple post_install hooks
 * 2. Adding exclusions for problematic C++ files
 * 3. Setting proper preprocessor definitions for Folly
 * 
 * Usage:
 *   node fix-podfile.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Path to Podfile
const PODFILE_PATH = path.join(__dirname, 'expo-app', 'ios', 'Podfile');

// Function to log with colors
function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m%s\x1b[0m',    // Cyan
    success: '\x1b[32m%s\x1b[0m', // Green
    warning: '\x1b[33m%s\x1b[0m', // Yellow
    error: '\x1b[31m%s\x1b[0m'    // Red
  };
  
  console.log(colors[type] || colors.info, message);
}

// Check if Podfile exists
if (!fs.existsSync(PODFILE_PATH)) {
  log('Error: Podfile not found at ' + PODFILE_PATH, 'error');
  log('Run "npx expo prebuild --platform ios" first to create the iOS project.', 'warning');
  process.exit(1);
}

// Create a backup of the Podfile
const backupPath = PODFILE_PATH + '.backup';
fs.copyFileSync(PODFILE_PATH, backupPath);
log(`Created backup at ${backupPath}`, 'info');

// Read the Podfile
let podfileContent = fs.readFileSync(PODFILE_PATH, 'utf8');

// Configuration to add to Podfile
const config = `
  # Fix for C++ file errors in certain libraries
  installer.pods_project.targets.each do |target|
    if target.name == "react-native-safe-area-context"
      target.build_configurations.each do |config|
        config.build_settings["EXCLUDED_SOURCE_FILE_NAMES"] = [
          "RNCSafeAreaViewShadowNode.cpp",
          "RNCSafeAreaViewState.cpp"
        ]
      end
    elsif target.name == "react-native-screens"
      target.build_configurations.each do |config|
        config.build_settings["EXCLUDED_SOURCE_FILE_NAMES"] = [
          "RNSScreenStackHeaderConfig.mm"
        ]
      end
    elsif target.name == "RCT-Folly"
      target.build_configurations.each do |config|
        config.build_settings["GCC_PREPROCESSOR_DEFINITIONS"] ||= ["$(inherited)"]
        config.build_settings["GCC_PREPROCESSOR_DEFINITIONS"] << "FOLLY_HAVE_COROUTINES=0"
      end
    end
  end
`;

// Check for existing post_install hooks
if (podfileContent.includes('post_install')) {
  log('Found existing post_install hook(s)', 'info');
  
  // Count how many post_install hooks exist
  const postInstallCount = (podfileContent.match(/post_install/g) || []).length;
  
  if (postInstallCount > 1) {
    log(`Warning: Found ${postInstallCount} post_install hooks - this will cause CocoaPods errors`, 'warning');
    log('Merging multiple post_install hooks into one...', 'info');
    
    // Extract content of all post_install blocks
    const postInstallRegex = /post_install\s+do\s+\|installer\|([\s\S]*?)end/g;
    const postInstallBlocks = [];
    let match;
    
    while ((match = postInstallRegex.exec(podfileContent)) !== null) {
      postInstallBlocks.push(match[1].trim());
    }
    
    // Remove all post_install blocks
    podfileContent = podfileContent.replace(/post_install\s+do\s+\|installer\|([\s\S]*?)end/g, '');
    
    // Create a single merged post_install block
    const mergedBlock = postInstallBlocks.join('\n\n  ');
    
    // Create new post_install block with our configuration if needed
    const newPostInstall = `post_install do |installer|
  ${mergedBlock}
  
${config}
end`;
    
    // Add the merged post_install block before the last 'end'
    podfileContent = podfileContent.replace(/end\s*$/, `${newPostInstall}\nend`);
    
    log('Successfully merged post_install hooks', 'success');
  } else {
    log('Single post_install hook found - checking for required configurations', 'info');
    
    // Check if our configuration is already present
    if (!podfileContent.includes('EXCLUDED_SOURCE_FILE_NAMES') || 
        !podfileContent.includes('FOLLY_HAVE_COROUTINES=0')) {
      
      log('Adding required configurations to existing post_install hook', 'info');
      
      // Add our configuration at the end of the existing post_install block
      podfileContent = podfileContent.replace(
        /(post_install\s+do\s+\|installer\|[\s\S]*?)(end)/,
        `$1\n${config}\n  $2`
      );
      
      log('Added required configurations to post_install hook', 'success');
    } else {
      log('Required configurations already present in post_install hook', 'success');
    }
  }
} else {
  log('No post_install hook found - adding one with required configurations', 'info');
  
  // Add a new post_install hook at the end of the file
  const newPostInstall = `
post_install do |installer|
${config}
end
`;
  
  // Add the post_install hook before the last 'end'
  podfileContent = podfileContent.replace(/end\s*$/, `${newPostInstall}\nend`);
  
  log('Added new post_install hook with required configurations', 'success');
}

// Write the updated Podfile
fs.writeFileSync(PODFILE_PATH, podfileContent);
log('Updated Podfile has been saved', 'success');

// Summary
log('\nPodfile has been successfully updated with the following fixes:', 'success');
log('1. Merged multiple post_install hooks (if any)', 'info');
log('2. Added exclusions for problematic C++ files', 'info');
log('3. Added preprocessor definitions for Folly', 'info');

log('\nNext steps:', 'info');
log('1. Run "cd expo-app/ios && pod install" to apply the changes', 'info');
log('2. Open the xcworkspace in Xcode and build your project', 'info');

log('\nIf you encounter any issues, restore from backup:', 'warning');
log(`cp ${backupPath} ${PODFILE_PATH}`, 'info');