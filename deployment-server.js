const express = require('express');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 5000;

// Redirect all traffic to the Expo app
app.use('/', (req, res) => {
  res.redirect(302, 'https://localhost:5000');
});

// Start the Expo app in the background
function startExpoApp() {
  console.log('Starting Expo app in the background...');
  const expoProcess = exec('cd expo-app && npx expo start --offline --web --port 5000', 
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error starting Expo app: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Expo stderr: ${stderr}`);
        return;
      }
      console.log(`Expo stdout: ${stdout}`);
  });
}

// Start the server and the Expo app
app.listen(PORT, () => {
  console.log(`Deployment server listening on port ${PORT}`);
  startExpoApp();
});