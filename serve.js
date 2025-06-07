const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle all routes by serving index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});