/**
 * React App Server for Spiritual Condition Tracker
 * - Serves the landing page at root (/)
 * - Serves the React app at /app
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = 5000;

// Create server
const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  // Serve the original landing page at root
  if (req.url === '/' || req.url === '') {
    console.log('Serving landing page');
    
    const landingPath = path.join(__dirname, 'landing-page.html');
    fs.readFile(landingPath, (err, content) => {
      if (err) {
        console.error(`Error reading landing page: ${err.message}`);
        res.writeHead(500);
        res.end('Error loading landing page');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
    return;
  }
  
  // Serve the app index.html at /app
  if (req.url === '/app' || req.url === '/app/') {
    console.log('Serving app index.html');
    
    const appIndexPath = path.join(__dirname, 'app', 'adapted-index.html');
    fs.readFile(appIndexPath, (err, content) => {
      if (err) {
        console.error(`Error reading app index.html: ${err.message}`);
        res.writeHead(500);
        res.end('Error loading application');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
    return;
  }
  
  // Serve app assets (JS, CSS, etc.)
  if (req.url === '/app.js') {
    console.log('Serving app.js');
    
    const appJsPath = path.join(__dirname, 'app', 'app.js');
    fs.readFile(appJsPath, (err, content) => {
      if (err) {
        console.error(`Error reading app.js: ${err.message}`);
        res.writeHead(500);
        res.end('Error loading application script');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(content);
    });
    return;
  }
  
  if (req.url === '/app.js') {
    console.log('Serving app.js');
    
    const appJsPath = path.join(__dirname, 'app', 'app.js');
    fs.readFile(appJsPath, (err, content) => {
      if (err) {
        console.error(`Error reading app.js: ${err.message}`);
        res.writeHead(500);
        res.end('Error loading application script');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(content);
    });
    return;
  }
  
  if (req.url === '/database.js') {
    console.log('Serving database.js');
    
    const dbJsPath = path.join(__dirname, 'app', 'database.js');
    fs.readFile(dbJsPath, (err, content) => {
      if (err) {
        console.error(`Error reading database.js: ${err.message}`);
        res.writeHead(500);
        res.end('Error loading database script');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(content);
    });
    return;
  }
  
  if (req.url === '/main.js') {
    console.log('Redirecting main.js to app.js');
    res.writeHead(302, { 'Location': '/app.js' });
    res.end();
    return;
  }
  
  if (req.url === '/database.js') {
    console.log('Serving database.js');
    
    const dbJsPath = path.join(__dirname, 'app', 'database.js');
    fs.readFile(dbJsPath, (err, content) => {
      if (err) {
        console.error(`Error reading database.js: ${err.message}`);
        res.writeHead(500);
        res.end('Error loading database script');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(content);
    });
    return;
  }
  
  if (req.url === '/styles.css') {
    console.log('Serving styles.css');
    
    const stylesPath = path.join(__dirname, 'app', 'styles.css');
    fs.readFile(stylesPath, (err, content) => {
      if (err) {
        console.error(`Error reading styles.css: ${err.message}`);
        res.writeHead(500);
        res.end('Error loading styles');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/css' });
      res.end(content);
    });
    return;
  }
  
  // Serve static assets at the root level (like logo.jpg)
  if (req.url.match(/\.(jpg|jpeg|png|gif|ico|svg)$/i) && !req.url.startsWith('/app')) {
    const filePath = path.join(__dirname, req.url);
    
    console.log(`Serving static file: ${filePath}`);
    
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error(`File not found: ${filePath}`);
        res.writeHead(404);
        res.end('File not found');
        return;
      }
      
      fs.readFile(filePath, (err, content) => {
        if (err) {
          console.error(`Error reading file: ${err.message}`);
          res.writeHead(500);
          res.end('Error reading file');
          return;
        }
        
        // Set appropriate content type
        let contentType = 'application/octet-stream';
        if (req.url.match(/\.(jpg|jpeg)$/i)) contentType = 'image/jpeg';
        if (req.url.match(/\.png$/i)) contentType = 'image/png';
        if (req.url.match(/\.gif$/i)) contentType = 'image/gif';
        if (req.url.match(/\.ico$/i)) contentType = 'image/x-icon';
        if (req.url.match(/\.svg$/i)) contentType = 'image/svg+xml';
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      });
    });
    
    return;
  }
  
  // Handle app directory static assets requests
  if (req.url.startsWith('/app/')) {
    // Extract the filename from the URL
    const filename = req.url.substring(5); // Remove '/app/' prefix
    const filePath = path.join(__dirname, 'app', filename);
    
    console.log(`Serving app asset: ${filePath}`);
    
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error(`File not found: ${filePath}`);
        res.writeHead(404);
        res.end('File not found');
        return;
      }
      
      fs.readFile(filePath, (err, content) => {
        if (err) {
          console.error(`Error reading file: ${err.message}`);
          res.writeHead(500);
          res.end('Error reading file');
          return;
        }
        
        // Set appropriate content type
        let contentType = 'application/octet-stream';
        if (filename.match(/\.html$/i)) contentType = 'text/html';
        if (filename.match(/\.js$/i)) contentType = 'application/javascript';
        if (filename.match(/\.css$/i)) contentType = 'text/css';
        if (filename.match(/\.json$/i)) contentType = 'application/json';
        if (filename.match(/\.(jpg|jpeg)$/i)) contentType = 'image/jpeg';
        if (filename.match(/\.png$/i)) contentType = 'image/png';
        if (filename.match(/\.gif$/i)) contentType = 'image/gif';
        if (filename.match(/\.svg$/i)) contentType = 'image/svg+xml';
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      });
    });
    
    return;
  }
  
  // Default 404 for any other routes
  res.writeHead(404);
  res.end('Not Found');
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Landing page: http://localhost:${PORT}/`);
  console.log(`Application: http://localhost:${PORT}/app`);
});