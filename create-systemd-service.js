/**
 * Script to create a systemd service file for Spiritual Condition Tracker
 * Run this script with sudo to create the service file
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get current directory
const currentDir = process.cwd();
console.log(`Current directory: ${currentDir}`);

// Service file content
const serviceContent = `[Unit]
Description=Spiritual Condition Tracker Expo Server
After=network.target

[Service]
Type=simple
User=${process.env.USER}
WorkingDirectory=${currentDir}
ExecStart=/usr/bin/node ${path.join(currentDir, 'run-expo-with-fixes.js')}
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=spiritual-condition

[Install]
WantedBy=multi-user.target
`;

// Path to service file
const serviceFilePath = '/etc/systemd/system/spiritual-condition.service';

try {
  // Check if running as root
  if (process.getuid && process.getuid() !== 0) {
    console.error('This script must be run with sudo to create a systemd service');
    console.log('Example: sudo node create-systemd-service.js');
    process.exit(1);
  }

  // Write service file
  fs.writeFileSync(serviceFilePath, serviceContent);
  console.log(`Created service file at ${serviceFilePath}`);

  // Reload systemd
  console.log('Reloading systemd daemon...');
  execSync('systemctl daemon-reload');

  console.log('Service created successfully!');
  console.log('\nTo enable and start the service:');
  console.log('  sudo systemctl enable spiritual-condition');
  console.log('  sudo systemctl start spiritual-condition');
  console.log('\nTo check service status:');
  console.log('  sudo systemctl status spiritual-condition');
  console.log('\nTo view logs:');
  console.log('  sudo journalctl -u spiritual-condition');

} catch (error) {
  console.error(`Error creating service: ${error.message}`);
  process.exit(1);
}