// A simple HTTP server to browse source code files
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 5001;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  if (pathname === '/') {
    // Display directory listing
    const srcDir = path.join(__dirname, 'src');
    let html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Source Code Browser</title>
          <style>
            body { font-family: sans-serif; margin: 20px; line-height: 1.5; }
            h1 { color: #333; }
            ul { list-style-type: none; padding-left: 20px; }
            a { color: #0066cc; text-decoration: none; }
            a:hover { text-decoration: underline; }
            .file { background: #f0f0f0; padding: 2px 8px; border-radius: 4px; }
            .folder { font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Spiritual Condition Tracker - Source Code</h1>
          <p>Browse the source code files:</p>
          <ul>
    `;
    
    function listDirectory(dir, basePath = '') {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const item of items) {
        if (item.name.startsWith('.')) continue;
        
        const relativePath = path.join(basePath, item.name);
        
        if (item.isDirectory()) {
          html += `<li class="folder">${item.name}/</li><ul>`;
          listDirectory(path.join(dir, item.name), relativePath);
          html += '</ul>';
        } else {
          html += `<li><a class="file" href="/view?file=${encodeURIComponent(relativePath)}">${item.name}</a></li>`;
        }
      }
    }
    
    try {
      listDirectory(srcDir);
      html += `
          </ul>
        </body>
      </html>
      `;
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Error: ${err.message}`);
    }
  } else if (pathname === '/view') {
    // View file content
    const filePath = path.join(__dirname, 'src', parsedUrl.query.file);
    
    // Basic security check
    if (!filePath.startsWith(path.join(__dirname, 'src'))) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Access denied');
      return;
    }
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fileName = path.basename(filePath);
      
      let html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${fileName} - Source Code</title>
            <style>
              body { font-family: sans-serif; margin: 20px; line-height: 1.5; }
              h1 { color: #333; }
              pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow: auto; }
              .back { margin-bottom: 20px; }
              a { color: #0066cc; text-decoration: none; }
              a:hover { text-decoration: underline; }
            </style>
          </head>
          <body>
            <div class="back"><a href="/">&laquo; Back to file list</a></div>
            <h1>${parsedUrl.query.file}</h1>
            <pre>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
          </body>
        </html>
      `;
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Error reading file: ${err.message}`);
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Source code browser running at http://localhost:${PORT}`);
});