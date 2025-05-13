// Ultra-simple proxy to the Expo web server port
const http = require('http');

const PORT = process.env.PORT || 5000;
const EXPO_WEB_PORT = 19006; // This is the Webpack port for Expo web

const server = http.createServer((req, res) => {
  // Setup proxy to the Expo web server
  const options = {
    hostname: 'localhost',
    port: EXPO_WEB_PORT,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: `localhost:${EXPO_WEB_PORT}`,
      'expo-platform': 'web'
    }
  };

  console.log(`Proxying to Expo web: ${req.url}`);

  const proxyReq = http.request(options, (proxyRes) => {
    // Copy headers from the proxied response
    Object.keys(proxyRes.headers).forEach(key => {
      res.setHeader(key, proxyRes.headers[key]);
    });
    
    // Write status code and send the response
    res.writeHead(proxyRes.statusCode);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error(`Proxy error: ${err.message}`);
    
    if (req.url === '/') {
      // If the home page fails, return a simple HTML that redirects to the Expo web port
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="refresh" content="0;url=http://localhost:${EXPO_WEB_PORT}">
          <title>Redirecting to Expo</title>
        </head>
        <body>
          <p>If you are not redirected automatically, follow this <a href="http://localhost:${EXPO_WEB_PORT}">link to the Expo web app</a>.</p>
        </body>
        </html>
      `);
    } else {
      // For other URLs, return an error
      res.writeHead(502);
      res.end(`Cannot connect to Expo web server: ${err.message}`);
    }
  });

  // Handle request body for POST/PUT methods
  if (req.method === 'POST' || req.method === 'PUT') {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Proxy server running on port ${PORT}`);
  console.log(`All requests are forwarded to Expo web server on port ${EXPO_WEB_PORT}`);
});