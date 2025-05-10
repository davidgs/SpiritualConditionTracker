/**
 * Local fix for LRU cache issue
 * Run this before starting Expo
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting lru-cache fix...');

// Install lru-cache directly
try {
  console.log('Installing lru-cache package...');
  execSync('npm install lru-cache@6.0.0 --save', { stdio: 'inherit' });
  console.log('Successfully installed lru-cache');
} catch (error) {
  console.error('Error installing lru-cache:', error);
}

// Get the node_modules path
const nodeModulesDir = path.join(__dirname, 'node_modules');
const lruCacheDir = path.join(nodeModulesDir, 'lru-cache');

// Verify the main file exists
const indexPath = path.join(lruCacheDir, 'index.js');
if (!fs.existsSync(indexPath)) {
  console.log('Creating index.js file for lru-cache...');
  
  // Simple LRU implementation
  const basicImplementation = `
// Simple LRU Cache implementation
class LRUCache {
  constructor(options = {}) {
    this.max = options.max || 500;
    this.cache = new Map();
  }

  get(key) {
    const item = this.cache.get(key);
    if (item) {
      // Refresh key
      this.cache.delete(key);
      this.cache.set(key, item);
    }
    return item;
  }

  set(key, value) {
    // Delete if key exists
    if (this.cache.has(key)) this.cache.delete(key);
    
    // Delete oldest if max size reached
    if (this.cache.size >= this.max) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    // Add new value
    this.cache.set(key, value);
    return this;
  }

  has(key) {
    return this.cache.has(key);
  }

  delete(key) {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}

module.exports = function lruCache(options) {
  return new LRUCache(options);
};

module.exports.LRUCache = LRUCache;
`;

  // Create index.js file
  try {
    fs.writeFileSync(indexPath, basicImplementation);
    console.log('Created lru-cache index.js file');
  } catch (error) {
    console.error('Error creating index.js:', error);
  }
}

// Verify package.json has correct main entry
const packageJsonPath = path.join(lruCacheDir, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Fix the main entry if needed
    if (packageJson.main !== 'index.js') {
      packageJson.main = 'index.js';
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('Fixed package.json main entry');
    }
  } catch (error) {
    console.error('Error updating package.json:', error);
  }
} else {
  // Create package.json if it doesn't exist
  try {
    const packageJson = {
      name: "lru-cache",
      version: "6.0.0",
      description: "A cache object that deletes the least-recently-used items",
      main: "index.js",
      license: "ISC"
    };
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('Created package.json for lru-cache');
  } catch (error) {
    console.error('Error creating package.json:', error);
  }
}

console.log('lru-cache fix completed');

// Now do the same for expo-app/node_modules if it exists
const expoAppDir = path.join(__dirname, 'expo-app');
const expoNodeModulesDir = path.join(expoAppDir, 'node_modules');
const expoLruCacheDir = path.join(expoNodeModulesDir, 'lru-cache');

if (fs.existsSync(expoAppDir)) {
  console.log('Fixing lru-cache in expo-app directory...');
  
  // Create directory if needed
  if (!fs.existsSync(expoLruCacheDir)) {
    try {
      fs.mkdirSync(expoLruCacheDir, { recursive: true });
    } catch (error) {
      console.error('Error creating lru-cache directory in expo-app:', error);
    }
  }
  
  // Copy files if main directory fix was successful
  if (fs.existsSync(indexPath) && fs.existsSync(packageJsonPath)) {
    try {
      fs.copyFileSync(indexPath, path.join(expoLruCacheDir, 'index.js'));
      fs.copyFileSync(packageJsonPath, path.join(expoLruCacheDir, 'package.json'));
      console.log('Copied lru-cache files to expo-app/node_modules');
    } catch (error) {
      console.error('Error copying files to expo-app:', error);
    }
  }
}

console.log('lru-cache fix completed in all directories');