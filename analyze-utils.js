#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Utility usage analysis
const usedUtils = new Set();
const allUtils = new Set();
const assetUsage = new Set();
const allAssets = new Set();

// Analyze import patterns for utilities
function analyzeUtilImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const imports = [];
    
    // Match utility imports
    const utilImportPatterns = [
      // from utils folder: import { fn } from './utils/file'
      /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]\.\/.+\/utils\/(\w+)['"]/g,
      // default imports: import util from './utils/file'
      /import\s+(\w+)\s+from\s+['"]\.\/.+\/utils\/(\w+)['"]/g,
      // services imports
      /import\s+(\w+)\s+from\s+['"]\.\/.+\/services\/(\w+)['"]/g,
    ];
    
    utilImportPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (match[1]) {
          if (match[1].includes(',')) {
            match[1].split(',').forEach(name => {
              const cleanName = name.trim().replace(/\s+as\s+\w+/, '');
              if (cleanName && !cleanName.includes(' ')) {
                imports.push(cleanName);
              }
            });
          } else {
            imports.push(match[1].trim());
          }
        }
        if (match[2]) {
          imports.push(match[2]);
        }
      }
    });
    
    return imports;
  } catch (error) {
    return [];
  }
}

// Analyze asset references
function analyzeAssetUsage(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const assets = [];
    
    // Match asset references
    const assetPatterns = [
      // import statements: import logo from './assets/logo.jpg'
      /import\s+\w+\s+from\s+['"]\.\/.+\/assets\/([^'"]+)['"]/g,
      // require statements: require('./assets/file')
      /require\(['"]\.\/.+\/assets\/([^'"]+)['"]\)/g,
      // string references: './assets/file' or '/assets/file'
      /['"]\.\/.+\/assets\/([^'"]+)['"]/g,
      /['"]\/assets\/([^'"]+)['"]/g,
    ];
    
    assetPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (match[1]) {
          assets.push(match[1]);
        }
      }
    });
    
    return assets;
  } catch (error) {
    return [];
  }
}

// Find all utilities
function findAllUtils(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'archive') {
      findAllUtils(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.js')) {
      const utilName = file.replace('.ts', '').replace('.js', '');
      allUtils.add(utilName);
    }
  }
}

// Find all assets
function findAllAssets(dir) {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.')) {
      findAllAssets(filePath);
    } else {
      allAssets.add(file);
    }
  }
}

// Build usage graph
function buildUsageGraph(startDir) {
  const files = [];
  
  function collectFiles(dir) {
    if (!fs.existsSync(dir)) return;
    
    const dirFiles = fs.readdirSync(dir);
    for (const file of dirFiles) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== 'archive') {
        collectFiles(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        files.push(filePath);
      }
    }
  }
  
  collectFiles(startDir);
  
  files.forEach(filePath => {
    const utilImports = analyzeUtilImports(filePath);
    const assetImports = analyzeAssetUsage(filePath);
    
    utilImports.forEach(util => usedUtils.add(util));
    assetImports.forEach(asset => assetUsage.add(asset));
  });
}

// Analyze specific file types
function analyzeSpecificFiles() {
  console.log('\n=== SPECIFIC FILE ANALYSIS ===');
  
  // Check for unused TypeScript declaration files
  console.log('\nTypeScript Declaration Files:');
  if (fs.existsSync('src/types')) {
    const typeFiles = fs.readdirSync('src/types');
    typeFiles.forEach(file => {
      console.log(`📄 src/types/${file}`);
    });
  }
  
  // Check for unused configuration files
  console.log('\nConfiguration Files:');
  const configFiles = [
    'src/defaults.ts',
    'src/clear-cache.ts',
    'src/ios-compatibility.ts'
  ];
  
  configFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`⚙️  ${file}`);
    }
  });
  
  // Check styles directory
  console.log('\nStyle Files:');
  if (fs.existsSync('src/styles')) {
    const styleFiles = fs.readdirSync('src/styles');
    styleFiles.forEach(file => {
      console.log(`🎨 src/styles/${file}`);
    });
  }
}

// Main execution
console.log('🔍 UTILITY AND ASSET USAGE ANALYSIS\n');

// Build usage maps
buildUsageGraph('src');
findAllUtils('src/utils');
findAllAssets('src/assets');

console.log('=== UTILITY ANALYSIS ===');
console.log(`Total utilities found: ${allUtils.size}`);
console.log(`Utilities referenced: ${usedUtils.size}`);

const unusedUtils = [...allUtils].filter(util => !usedUtils.has(util));

console.log('\n❌ UNUSED UTILITIES:');
unusedUtils.forEach(util => {
  console.log(`   • src/utils/${util}.ts`);
});

console.log('\n✅ USED UTILITIES:');
[...usedUtils].sort().forEach(util => {
  if (allUtils.has(util)) {
    console.log(`   • ${util}`);
  }
});

console.log('\n=== ASSET ANALYSIS ===');
console.log(`Total assets found: ${allAssets.size}`);
console.log(`Assets referenced: ${assetUsage.size}`);

const unusedAssets = [...allAssets].filter(asset => !assetUsage.has(asset));

console.log('\n❌ UNUSED ASSETS:');
unusedAssets.forEach(asset => {
  console.log(`   • src/assets/${asset}`);
});

console.log('\n✅ USED ASSETS:');
[...assetUsage].sort().forEach(asset => {
  console.log(`   • ${asset}`);
});

analyzeSpecificFiles();

console.log('\n=== SUMMARY ===');
console.log(`📊 Total utilities: ${allUtils.size}`);
console.log(`✅ Used utilities: ${usedUtils.size}`);
console.log(`❌ Unused utilities: ${unusedUtils.length}`);
console.log(`📊 Total assets: ${allAssets.size}`);
console.log(`✅ Used assets: ${assetUsage.size}`);
console.log(`❌ Unused assets: ${unusedAssets.length}`);