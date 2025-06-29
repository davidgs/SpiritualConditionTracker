const express = require('express');
const path = require('path');
const app = express();
const port = 5000;

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// For single-page applications, serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});