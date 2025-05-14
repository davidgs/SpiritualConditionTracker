/**
 * Dependency Checker for Spiritual Condition Tracker
 * 
 * This script checks and directly installs essential dependencies
 * instead of using workarounds or complex fix scripts.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Checking essential dependencies for iOS and Android builds...');

// List of essential packages with exact versions
const essentialPackages = [
  { name: 'minimatch', version: '5.1.6', reason: 'Required for glob pattern matching' },
  { name: 'agent-base', version: '6.0.2', reason: 'Required for iOS build process' },
  { name: 'lru-cache', version: '6.0.0', reason: 'Required by several React Native dependencies' },
  { name: 'glob', version: '9.3.5', reason: 'Required for asset processing' }
];

// Check if package is installed and install if missing
let installedCount = 0;
let alreadyInstalledCount = 0;

for (const pkg of essentialPackages) {
  const pkgJsonPath = path.join(__dirname, 'node_modules', pkg.name, 'package.json');
  const paddedName = pkg.name.padEnd(20);
  
  if (!fs.existsSync(pkgJsonPath)) {
    console.log(`⚠️  Missing: ${paddedName} - Installing version ${pkg.version}...`);
    console.log(`   Reason: ${pkg.reason}`);
    
    try {
      execSync(`npm install ${pkg.name}@${pkg.version} --save-exact`, {
        stdio: 'inherit',
        cwd: __dirname
      });
      console.log(`✅ Installed: ${paddedName} v${pkg.version}`);
      installedCount++;
    } catch (error) {
      console.error(`❌ Error installing ${pkg.name}: ${error.message}`);
    }
  } else {
    try {
      // Check the installed version
      const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
      console.log(`✅ Present:  ${paddedName} v${pkgJson.version}`);
      alreadyInstalledCount++;
    } catch (error) {
      console.error(`❌ Error reading package.json for ${pkg.name}`);
    }
  }
}

console.log('\nDependency check summary:');
console.log(`- ${alreadyInstalledCount} packages already installed`);
console.log(`- ${installedCount} packages installed`);
console.log(`- ${essentialPackages.length - alreadyInstalledCount - installedCount} packages failed to install\n`);

if (installedCount > 0) {
  console.log('✅ Dependencies have been updated. Your project is now ready for building!');
} else if (alreadyInstalledCount === essentialPackages.length) {
  console.log('✅ All dependencies are already installed. Your project is ready for building!');
} else {
  console.log('⚠️  Some dependencies could not be installed. Please check the errors above.');
}