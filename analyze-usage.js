#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Component usage analysis
const usedComponents = new Set();
const allComponents = new Set();
const componentDependencies = new Map();

// Find all component files
function findAllComponents(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.')) {
      findAllComponents(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const componentName = file.replace('.tsx', '').replace('.ts', '');
      allComponents.add(componentName);
    }
  }
}

// Analyze import patterns in a file
function analyzeImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const imports = [];
    
    // Match various import patterns
    const importPatterns = [
      // Standard imports: import Component from './Component'
      /import\s+(\w+)\s+from\s+['"]\.\/.+\/(\w+)['"]/g,
      // Named imports: import { Component } from './components'
      /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]\.\/.+['"]/g,
      // Lazy imports: React.lazy(() => import('./Component'))
      /React\.lazy\(\s*\(\)\s*=>\s*import\(['"]\.\/.+\/(\w+)['"]\)\s*\)/g,
      // Dynamic imports: import('./Component')
      /import\(['"]\.\/.+\/(\w+)['"]\)/g
    ];
    
    importPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (match[1]) {
          // Handle named imports
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
    console.log(`Error reading ${filePath}: ${error.message}`);
    return [];
  }
}

// Build dependency graph
function buildDependencyGraph(startDir) {
  const files = [];
  
  function collectFiles(dir) {
    const dirFiles = fs.readdirSync(dir);
    for (const file of dirFiles) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        collectFiles(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        files.push(filePath);
      }
    }
  }
  
  collectFiles(startDir);
  
  files.forEach(filePath => {
    const imports = analyzeImports(filePath);
    const fileName = path.basename(filePath).replace('.tsx', '').replace('.ts', '');
    componentDependencies.set(fileName, imports);
    
    imports.forEach(imp => usedComponents.add(imp));
  });
}

// Entry points analysis
function analyzeEntryPoints() {
  console.log('=== ENTRY POINT ANALYSIS ===');
  
  // Main entry points
  const entryPoints = ['src/App.tsx', 'src/index.tsx'];
  
  entryPoints.forEach(entry => {
    if (fs.existsSync(entry)) {
      console.log(`\n${entry}:`);
      const imports = analyzeImports(entry);
      imports.forEach(imp => {
        console.log(`  - ${imp}`);
        usedComponents.add(imp);
      });
    }
  });
}

// Find unused components
function findUnusedComponents() {
  findAllComponents('src/components');
  
  console.log('\n=== COMPONENT USAGE ANALYSIS ===');
  console.log(`Total components found: ${allComponents.size}`);
  console.log(`Components referenced: ${usedComponents.size}`);
  
  const unused = [...allComponents].filter(comp => !usedComponents.has(comp));
  
  console.log('\n=== UNUSED COMPONENTS ===');
  unused.forEach(comp => {
    console.log(`❌ ${comp}.tsx`);
  });
  
  console.log('\n=== USED COMPONENTS ===');
  [...usedComponents].sort().forEach(comp => {
    if (allComponents.has(comp)) {
      console.log(`✅ ${comp}.tsx`);
    }
  });
  
  return unused;
}

// Find backup/duplicate files
function findBackupFiles() {
  console.log('\n=== BACKUP/DUPLICATE FILES ===');
  
  const backupPatterns = [
    /App-.*\.tsx$/,
    /\.backup$/,
    /\.old$/,
    /-old\./,
    /-backup\./,
    /-copy\./,
    /\(copy\)/
  ];
  
  function scanForBackups(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.')) {
        scanForBackups(filePath);
      } else {
        const isBackup = backupPatterns.some(pattern => pattern.test(file));
        if (isBackup) {
          console.log(`🗑️  ${filePath}`);
        }
      }
    }
  }
  
  scanForBackups('src');
}

// Find archive directories
function findArchiveDirectories() {
  console.log('\n=== ARCHIVE DIRECTORIES ===');
  
  function scanForArchives(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.')) {
        if (file === 'archive' || file.includes('archive')) {
          console.log(`📦 ${filePath}/`);
          // List contents
          try {
            const archiveContents = fs.readdirSync(filePath);
            archiveContents.forEach(item => {
              console.log(`   - ${item}`);
            });
          } catch (e) {
            console.log(`   (Error reading contents)`);
          }
        } else {
          scanForArchives(filePath);
        }
      }
    }
  }
  
  scanForArchives('src');
}

// Main execution
console.log('🔍 PHASE 1: COMPONENT USAGE ANALYSIS\n');

analyzeEntryPoints();
buildDependencyGraph('src');
const unusedComponents = findUnusedComponents();
findBackupFiles();
findArchiveDirectories();

console.log('\n=== SUMMARY ===');
console.log(`📊 Total components: ${allComponents.size}`);
console.log(`✅ Used components: ${usedComponents.size}`);
console.log(`❌ Unused components: ${unusedComponents.length}`);

if (unusedComponents.length > 0) {
  console.log('\n🎯 CANDIDATES FOR REMOVAL:');
  unusedComponents.forEach(comp => {
    console.log(`   • src/components/${comp}.tsx`);
  });
}