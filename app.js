/**
 * Main entry point for the Spiritual Condition Tracker app
 */
const http = require('http');
const { spawn } = require('child_process');

// Configuration
const PORT = 5000;

// Create HTTP server
const server = http.createServer((req, res) => {
  // Set response headers
  res.writeHead(200, { 'Content-Type': 'text/html' });
  
  // Simple HTML response
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Spiritual Condition Tracker</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
          .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h1 { color: #2c3e50; }
          .loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; }
          .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin-bottom: 20px; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Spiritual Condition Tracker</h1>
          <div class="loading">
            <div class="spinner"></div>
            <p>Loading the application...</p>
            <p><small>If this takes too long, please check the server logs.</small></p>
          </div>
        </div>
      </body>
    </html>
  `);
});

// Start HTTP server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`HTTP server running on http://localhost:${PORT}`);
  
  // Start Expo in a separate process
  console.log('Starting Expo development server...');
  try {
    const expo = spawn('npx', [
      'expo', 
      'start',
      '--web'
    ], {
      stdio: 'inherit'
    });
    
    // Handle errors
    expo.on('error', (err) => {
      console.error('Error starting Expo:', err);
    });
    
    // Handle exit
    expo.on('exit', (code) => {
      console.log(`Expo exited with code ${code}`);
    });
  } catch (error) {
    console.error('Failed to start Expo:', error);
  }
});