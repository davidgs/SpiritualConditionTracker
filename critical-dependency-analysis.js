#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Critical dependency analysis
const criticalUtils = new Set();
const utilDependencies = new Map();

// Analyze all imports in a file
function analyzeAllImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const imports = [];
    
    // More comprehensive import patterns
    const patterns = [
      // Standard imports: import X from './utils/Y'
      /import\s+(\w+)\s+from\s+['"]\.\.?\/utils\/(\w+)['"]/g,
      // Named imports: import { X } from './utils/Y'
      /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]\.\.?\/utils\/(\w+)['"]/g,
      // Service imports
      /import\s+(\w+).*from\s+['"]\.\.?\/services\/(\w+)['"]/g,
      // Context imports
      /import\s+.*from\s+['"]\.\.?\/contexts\/(\w+)['"]/g,
    ];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (match[2]) { // Utility name
          imports.push(match[2]);
        }
        if (match[1] && pattern.source.includes('contexts')) { // Context name
          imports.push(match[1]);
        }
      }
    });
    
    return imports;
  } catch (error) {
    return [];
  }
}

// Build critical path from entry points
function buildCriticalPath() {
  console.log('🔍 CRITICAL DEPENDENCY ANALYSIS\n');
  
  // Start from absolute entry points
  const entryPoints = [
    'src/App.tsx',
    'src/index.tsx',
    'src/services/DatabaseService.ts',
    'src/contexts/AppDataContext.tsx',
    'src/contexts/MuiThemeProvider.tsx'
  ];
  
  console.log('=== ANALYZING CRITICAL PATH ===');
  
  entryPoints.forEach(entry => {
    if (fs.existsSync(entry)) {
      console.log(`\n📍 ${entry}:`);
      const imports = analyzeAllImports(entry);
      imports.forEach(imp => {
        console.log(`   → ${imp}`);
        criticalUtils.add(imp);
      });
    }
  });
  
  // Analyze main components
  const mainComponents = [
    'src/components/Dashboard.tsx',
    'src/components/Profile.tsx',
    'src/components/Meetings.tsx',
    'src/components/SponsorSponsee.tsx',
    'src/components/Header.tsx',
    'src/components/BottomNavBar.tsx'
  ];
  
  console.log('\n=== MAIN COMPONENT DEPENDENCIES ===');
  mainComponents.forEach(comp => {
    if (fs.existsSync(comp)) {
      console.log(`\n📍 ${comp}:`);
      const imports = analyzeAllImports(comp);
      imports.forEach(imp => {
        console.log(`   → ${imp}`);
        criticalUtils.add(imp);
      });
    }
  });
}

// Analyze utility dependencies recursively
function analyzeUtilityDependencies() {
  console.log('\n=== UTILITY DEPENDENCY CHAIN ===');
  
  const utilsToCheck = [...criticalUtils].filter(util => 
    fs.existsSync(`src/utils/${util}.ts`) || fs.existsSync(`src/utils/${util}.tsx`)
  );
  
  utilsToCheck.forEach(util => {
    const utilPath = fs.existsSync(`src/utils/${util}.ts`) ? 
      `src/utils/${util}.ts` : `src/utils/${util}.tsx`;
    
    if (fs.existsSync(utilPath)) {
      console.log(`\n🔧 ${util}:`);
      const imports = analyzeAllImports(utilPath);
      if (imports.length > 0) {
        imports.forEach(imp => {
          console.log(`   → depends on: ${imp}`);
          criticalUtils.add(imp);
        });
      } else {
        console.log(`   → no internal dependencies`);
      }
    }
  });
}

// Find all utilities for comparison
function getAllUtilities() {
  const allUtils = new Set();
  if (fs.existsSync('src/utils')) {
    const files = fs.readdirSync('src/utils');
    files.forEach(file => {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        allUtils.add(file.replace('.ts', '').replace('.tsx', ''));
      }
    });
  }
  return allUtils;
}

// Main execution
buildCriticalPath();
analyzeUtilityDependencies();

const allUtils = getAllUtilities();
const safeTRemove = [...allUtils].filter(util => !criticalUtils.has(util));

console.log('\n=== CRITICAL UTILITIES (DO NOT REMOVE) ===');
[...criticalUtils].sort().forEach(util => {
  if (allUtils.has(util)) {
    console.log(`🚨 CRITICAL: ${util}.ts`);
  }
});

console.log('\n=== SAFE TO INVESTIGATE FOR REMOVAL ===');
safeTRemove.forEach(util => {
  console.log(`❓ INVESTIGATE: ${util}.ts`);
});

console.log(`\n=== SUMMARY ===`);
console.log(`Total utilities: ${allUtils.size}`);
console.log(`Critical utilities: ${[...criticalUtils].filter(u => allUtils.has(u)).length}`);
console.log(`Safe to investigate: ${safeTRemove.length}`);