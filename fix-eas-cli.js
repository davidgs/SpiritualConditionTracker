/**
 * Fix script for EAS CLI polyfills module error
 */
const fs = require('fs');
const path = require('path');

// Find the path to the eas-cli module
const easRoot = path.dirname(require.resolve('eas-cli/package.json'));
const polyfillsDir = path.join(easRoot, 'build', 'polyfills');

console.log(`EAS CLI module found at: ${easRoot}`);

// Create the polyfills directory if it doesn't exist
if (!fs.existsSync(polyfillsDir)) {
  console.log(`Creating polyfills directory: ${polyfillsDir}`);
  fs.mkdirSync(polyfillsDir, { recursive: true });
}

// Create the symbols.js file with basic polyfills
const symbolsFilePath = path.join(polyfillsDir, 'symbols.js');
const symbolsContent = `
// Polyfill for symbols module
module.exports = {
  isSymbol: (value) => typeof value === 'symbol',
  keyFor: Symbol.keyFor,
  for: Symbol.for,
  Symbol
};
`;

fs.writeFileSync(symbolsFilePath, symbolsContent);
console.log(`Created symbols.js at: ${symbolsFilePath}`);

console.log('EAS CLI polyfills fix complete. Try running your eas build command again.');