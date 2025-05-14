// Simple server to redirect to our Expo app
const express = require('express');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Serve the index.html for the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Redirect /expo-app to the Expo app
app.get('/expo-app', (req, res) => {
  res.redirect('http://localhost:5000');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Start the Expo app in the background
  console.log('Starting Expo app in the background...');
  exec('cd expo-app && npx expo start --offline --web --port 5000', 
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
});