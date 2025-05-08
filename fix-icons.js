/**
 * Direct icon fixing script
 * Run this script with node to fix icon issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Make sure we're running in the correct directory
const currentDir = process.cwd();
console.log(`Running in: ${currentDir}`);

// Key files that might contain IconFallback references
const filesToSearch = [
  'expo-app/src/components/IconFallback.js',
  'expo-app/web-icon-fixer.js',
  'expo-app/App.js',
  'run-expo-only.js',
  'icon-fix.js',
  'expo-app/web/index.html'
];

// Function to check for icon issues in a file
function checkFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const hasIconFallback = content.includes('IconFallback');
  const hasHamburgerMenu = content.includes('hamburger menu');
  
  return { 
    path: filePath, 
    hasIconFallback, 
    hasHamburgerMenu,
    content
  };
}

// Check all files
console.log('Checking files for IconFallback references...');
const filesWithIssues = [];

filesToSearch.forEach(filePath => {
  const result = checkFile(filePath);
  if (result && (result.hasIconFallback || result.hasHamburgerMenu)) {
    filesWithIssues.push(result);
    console.log(`Found issues in: ${filePath}`);
  }
});

// Replace problematic function
function fixIconFallbackFile() {
  const iconFallbackPath = path.join(currentDir, 'expo-app/src/components/IconFallback.js');
  
  if (!fs.existsSync(iconFallbackPath)) {
    console.log('IconFallback.js not found');
    return;
  }
  
  // Super simple implementation that doesn't do anything
  const fixedContent = `import React from 'react';

/**
 * IconFallback component - Completely simplified version
 * This component intentionally does nothing to avoid any potential issues
 */
export const IconFallback = () => null;

export default IconFallback;
`;
  
  fs.writeFileSync(iconFallbackPath, fixedContent);
  console.log('Replaced IconFallback.js with minimal implementation');
}

// Fix run-expo-only.js if needed
function fixRunExpoScript() {
  const runExpoPath = path.join(currentDir, 'run-expo-only.js');
  
  if (!fs.existsSync(runExpoPath)) {
    console.log('run-expo-only.js not found');
    return;
  }
  
  let content = fs.readFileSync(runExpoPath, 'utf8');
  
  // Remove direct manipulation of icon components
  if (content.includes('window.toggleNav')) {
    console.log('Found window.toggleNav in run-expo-only.js');
    content = content.replace(/window\.toggleNav[^;]*;/g, '// window.toggleNav functionality removed - causing issues');
  }
  
  // Replace window.fixReactNativeIcons
  if (content.includes('fixReactNativeIcons')) {
    console.log('Found fixReactNativeIcons in run-expo-only.js');
    content = content.replace(/function\s+fixReactNativeIcons\s*\([^)]*\)\s*{[^}]*}/g, 
      'function fixReactNativeIcons() { console.log("React Native Icons fix disabled"); }');
  }
  
  fs.writeFileSync(runExpoPath, content);
  console.log('Updated run-expo-only.js to remove problematic code');
}

// Fix icon-fix.js if needed
function fixIconFixScript() {
  const iconFixPath = path.join(currentDir, 'icon-fix.js');
  
  if (!fs.existsSync(iconFixPath)) {
    console.log('icon-fix.js not found');
    return;
  }
  
  let content = fs.readFileSync(iconFixPath, 'utf8');
  
  // Replace the fixReactNativeIcons function 
  if (content.includes('fixReactNativeIcons')) {
    console.log('Found fixReactNativeIcons in icon-fix.js');
    content = content.replace(/function\s+fixReactNativeIcons\s*\([^)]*\)\s*{[^}]*}/g, 
      'function fixReactNativeIcons() { console.log("[Icon Fix] Disabled to prevent bundling issues"); }');
  }
  
  // Replace the hamburger menu fixing code
  if (content.includes('hamburger menu')) {
    console.log('Found hamburger menu code in icon-fix.js');
    content = content.replace(/console\.log\(\s*['"]?\[Icon Fix\] Looking for hamburger[^;]*;/g, 
      'console.log("[Icon Fix] Hamburger menu fix disabled");');
  }
  
  fs.writeFileSync(iconFixPath, content);
  console.log('Updated icon-fix.js to remove problematic code');
}

// Apply all fixes
console.log('Applying fixes...');
fixIconFallbackFile();
fixRunExpoScript();
fixIconFixScript();

// Restart the Expo workflow
console.log('Fixes applied. You should restart the Expo workflow now.');
console.log('Attempting to restart Expo for you...');

try {
  // Clean the cache before restarting
  execSync('rm -rf expo-app/node_modules/.cache', { stdio: 'inherit' });
  execSync('rm -rf expo-app/.expo', { stdio: 'inherit' });
  
  console.log('Expo cache cleared. Restart the ExpoServer workflow to apply changes.');
} catch (error) {
  console.error('Error restarting Expo:', error);
}

console.log('Done!');