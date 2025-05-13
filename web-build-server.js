const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5003;

// Check if web-build directory exists
const webBuildPath = path.join(__dirname, 'web-build');
if (!fs.existsSync(webBuildPath)) {
  console.error('Error: web-build directory not found!');
  process.exit(1);
}

// Serve static files from web-build
app.use(express.static(webBuildPath));

// Serve index.html for all routes (for single-page application)
app.get('*', (req, res) => {
  res.sendFile(path.join(webBuildPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Web build server running at http://localhost:${PORT}`);
  console.log(`Serving files from: ${webBuildPath}`);
});