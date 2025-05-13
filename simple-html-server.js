const express = require('express');
const path = require('path');

const app = express();
const PORT = 5000;

// Serve static files from the web-build directory
app.use(express.static(path.join(__dirname, 'web-build')));

// Serve the index.html for any route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'web-build', 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
  console.log(`Serving from ${path.join(__dirname, 'web-build')}`);
});