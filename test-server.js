/**
 * Simple test server - works reliably on deployment environment
 */

const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const app = express();
const PORT = 5000;

// Serve static files
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname)));

// Set up a simple home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Add a test page
app.get('/test', (req, res) => {
  res.send(`
    <html>
      <head><title>Test Page</title></head>
      <body>
        <h1>Server is working!</h1>
        <p>This is a test page to verify the server is running correctly.</p>
        <p>View the <a href="/">Home Page</a></p>
      </body>
    </html>
  `);
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`- Visit http://localhost:${PORT}/ for the landing page`);
  console.log(`- Visit http://localhost:${PORT}/test for the test page`);
});