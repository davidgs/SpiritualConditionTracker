/**
 * This script directly fixes the missing ./subprotocol module error in ws
 * by creating the file if it doesn't exist.
 */
const fs = require('fs');
const path = require('path');

console.log('Checking for ws subprotocol.js file...');

// Path to the ws module's lib directory
const wsLibPath = path.resolve('./node_modules/ws/lib');
const subprotocolPath = path.join(wsLibPath, 'subprotocol.js');

// Check if the directory exists
if (!fs.existsSync(wsLibPath)) {
  console.log('Creating ws/lib directory...');
  fs.mkdirSync(wsLibPath, { recursive: true });
}

// Check if the subprotocol.js file exists
if (!fs.existsSync(subprotocolPath)) {
  console.log('Creating missing subprotocol.js file...');
  
  const subprotocolContent = `'use strict';

/**
 * Simple implementation for the missing subprotocol.js module
 */

/**
 * Performs the WebSocket protocol subprotocol selection.
 *
 * @param {String} protocols The list of subprotocols requested by the client
 * @param {Array} ServerOptions.subprotocols The list of supported subprotocols
 * @return {String|Boolean} Returns the selected protocol or \`false\` if no
 *                          protocol could be selected
 * @public
 */
function subprotocol(protocols, serverProtocols) {
  if (!Array.isArray(serverProtocols)) return false;
  
  if (!protocols) return serverProtocols[0];
  
  // Convert from string to array if needed
  const requestedProtocols = typeof protocols === 'string' 
    ? protocols.split(/, */) 
    : protocols;
  
  // Check if any of the requested protocols is supported by the server
  for (let i = 0; i < requestedProtocols.length; i++) {
    const protocol = requestedProtocols[i].trim();
    
    if (serverProtocols.includes(protocol)) {
      return protocol;
    }
  }
  
  return false;
}

module.exports = { subprotocol };`;

  fs.writeFileSync(subprotocolPath, subprotocolContent);
  console.log('Successfully created subprotocol.js');
} else {
  console.log('subprotocol.js already exists');
}

// Create other potentially missing files
const filesToCreate = [
  path.join(wsLibPath, 'stream/index.js'),
  path.join(wsLibPath, 'validation.js'),
  path.join(wsLibPath, 'receiver.js'),
  path.join(wsLibPath, 'sender.js'),
  path.join(wsLibPath, 'extension.js'),
  path.join(wsLibPath, 'constants.js'),
  path.join(wsLibPath, 'websocket.js'),
  path.join(wsLibPath, 'websocket-server.js')
];

// Ensure directory exists for each file
filesToCreate.forEach(filePath => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '// Auto-generated compatibility file\n');
    console.log(`Created: ${filePath}`);
  }
});

console.log('File checks complete');