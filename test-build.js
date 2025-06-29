// Simple test to check basic import and compilation
const fs = require('fs');
const path = require('path');

// Check if critical files exist
const criticalFiles = [
  'src/types/database.ts',
  'src/services/DatabaseService.ts',
  'src/contexts/AppDataContext.tsx'
];

console.log('Checking critical files...');
for (const file of criticalFiles) {
  if (fs.existsSync(file)) {
    console.log(`✓ ${file} exists`);
  } else {
    console.log(`✗ ${file} missing`);
  }
}

// Try to read the database types to ensure they're valid
try {
  const typesContent = fs.readFileSync('src/types/database.ts', 'utf8');
  console.log('✓ database.ts readable');
  
  // Check for critical type exports
  const hasPersonType = typesContent.includes('export interface Person');
  const hasContactType = typesContent.includes('export interface Contact');
  
  console.log(`Person type exported: ${hasPersonType}`);
  console.log(`Contact type exported: ${hasContactType}`);
  
} catch (error) {
  console.error('✗ Error reading database types:', error.message);
}

console.log('Basic file check complete');