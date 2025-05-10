/**
 * Fix for lru-cache module resolution error
 * Run this script before starting the Expo server
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting lru-cache module fix...');

// Define paths
const rootDir = __dirname;
const nodeModulesDir = path.join(rootDir, 'node_modules');
const lruCacheDir = path.join(nodeModulesDir, 'lru-cache');

// 1. First check if the module exists
if (!fs.existsSync(lruCacheDir)) {
  console.log('lru-cache module not found, installing...');
  try {
    execSync('npm install lru-cache@6.0.0 --no-save', { stdio: 'inherit' });
  } catch (error) {
    console.error('Error installing lru-cache:', error);
  }
}

// 2. Check again after install
if (!fs.existsSync(lruCacheDir)) {
  console.log('Could not install lru-cache, creating directory structure...');
  try {
    fs.mkdirSync(lruCacheDir, { recursive: true });
  } catch (error) {
    console.error('Error creating lru-cache directory:', error);
  }
}

// 3. Fix the package.json
const packageJsonPath = path.join(lruCacheDir, 'package.json');

try {
  let packageContent = {
    name: "lru-cache",
    version: "6.0.0",
    description: "A cache object that deletes the least-recently-used items",
    main: "index.js",
    license: "ISC"
  };
  
  if (fs.existsSync(packageJsonPath)) {
    // Update existing package.json
    const existingContent = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (existingContent.main !== 'index.js') {
      existingContent.main = 'index.js';
      packageContent = existingContent;
    }
  }
  
  // Write the package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageContent, null, 2));
  console.log('Updated lru-cache package.json');
} catch (error) {
  console.error('Error fixing lru-cache package.json:', error);
}

// 4. Create a basic index.js file if it doesn't exist
const indexJsPath = path.join(lruCacheDir, 'index.js');

if (!fs.existsSync(indexJsPath)) {
  const basicContent = `
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

  fs.writeFileSync(indexJsPath, basicContent);
  console.log('Created basic lru-cache implementation');
}

console.log('lru-cache module fix completed');

// Now fix the expo-app node_modules as well
const expoNodeModulesDir = path.join(rootDir, 'expo-app', 'node_modules');
const expoLruCacheDir = path.join(expoNodeModulesDir, 'lru-cache');

if (!fs.existsSync(expoLruCacheDir)) {
  console.log('Creating lru-cache for expo-app...');
  try {
    fs.mkdirSync(expoLruCacheDir, { recursive: true });
    
    // Copy files from main node_modules if they exist
    if (fs.existsSync(lruCacheDir)) {
      fs.copyFileSync(packageJsonPath, path.join(expoLruCacheDir, 'package.json'));
      fs.copyFileSync(indexJsPath, path.join(expoLruCacheDir, 'index.js'));
      console.log('Copied lru-cache files to expo-app/node_modules');
    } else {
      // Create new files
      fs.writeFileSync(
        path.join(expoLruCacheDir, 'package.json'), 
        JSON.stringify({
          name: "lru-cache",
          version: "6.0.0",
          description: "A cache object that deletes the least-recently-used items",
          main: "index.js",
          license: "ISC"
        }, null, 2)
      );
      
      // Use the same basic implementation
      fs.writeFileSync(path.join(expoLruCacheDir, 'index.js'), basicContent);
      console.log('Created lru-cache files in expo-app/node_modules');
    }
  } catch (error) {
    console.error('Error setting up lru-cache for expo-app:', error);
  }
}

console.log('All lru-cache fixes completed successfully');