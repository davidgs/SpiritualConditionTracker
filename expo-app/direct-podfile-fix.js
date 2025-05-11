/**
 * Direct Podfile Fix for EAS builds
 * 
 * This script directly modifies the Expo Config Plugin responsible for generating the Podfile
 * ensuring the correct path to React Native is used.
 */

const fs = require('fs');
const path = require('path');

// Find the Expo Config Plugin's Podfile template
const EXPO_CONFIG_PLUGINS_PATH = path.join(__dirname, 'node_modules', '@expo', 'config-plugins');

// Possible locations for the Podfile template
const TEMPLATE_PATHS = [
  path.join(EXPO_CONFIG_PLUGINS_PATH, 'build', 'plugins', 'ios-plugins', 'react-native-podfile', 'templates', 'Podfile'),
  path.join(EXPO_CONFIG_PLUGINS_PATH, 'ios', 'react-native-podfile', 'templates', 'Podfile'),
  path.join(EXPO_CONFIG_PLUGINS_PATH, 'templates', 'ios', 'Podfile'),
];

// Search for the Podfile template
let templatePath = null;
for (const possiblePath of TEMPLATE_PATHS) {
  if (fs.existsSync(possiblePath)) {
    templatePath = possiblePath;
    break;
  }
}

if (!templatePath) {
  console.error('❌ Could not find Podfile template in @expo/config-plugins');
  console.error('Searched in:');
  TEMPLATE_PATHS.forEach(p => console.error(`  - ${p}`));
  process.exit(1);
}

// Read the template
console.log(`📝 Found Podfile template at: ${templatePath}`);
const originalTemplate = fs.readFileSync(templatePath, 'utf8');

// Create a backup
const backupPath = `${templatePath}.bak`;
if (!fs.existsSync(backupPath)) {
  fs.writeFileSync(backupPath, originalTemplate);
  console.log(`✅ Created backup at: ${backupPath}`);
}

// Fix the template - replace the path to React Native
const fixedTemplate = originalTemplate.replace(
  /use_react_native!\(\s*:path => config\[:reactNativePath\],/g,
  'use_react_native!(:path => "../node_modules/react-native",'
);

// Write the fixed template
fs.writeFileSync(templatePath, fixedTemplate);
console.log('✅ Patched Podfile template with correct React Native path');

// Also add a post-install hook for C++20 if it doesn't exist
if (!fixedTemplate.includes('post_install')) {
  const postInstallHook = `

post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      # Set C++20 for all C++ files
      config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++20'
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '13.0'
    end
  end
end
`;
  fs.appendFileSync(templatePath, postInstallHook);
  console.log('✅ Added post_install hook for C++20 compatibility');
}

console.log('✅ Podfile template has been successfully patched');
console.log('');
console.log('You can now run:');
console.log('npx eas build --platform ios --profile preview');
console.log('');