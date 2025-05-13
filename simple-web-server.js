const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8080;

// Don't use static middleware that's causing the error

// Set up simple HTML for the src directory structure
app.get('/', (req, res) => {
  const srcDir = path.join(__dirname, 'src');
  let fileList = '<ul>';
  
  function processDirectory(dir, prefix = '') {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);
      const relativePath = path.join(prefix, item);
      
      if (stats.isDirectory()) {
        fileList += `<li><strong>${item}/</strong>`;
        fileList += '<ul>';
        processDirectory(itemPath, relativePath);
        fileList += '</ul></li>';
      } else {
        fileList += `<li><a href="/view?file=${encodeURIComponent(relativePath)}">${item}</a></li>`;
      }
    });
  }
  
  try {
    processDirectory(srcDir);
    fileList += '</ul>';
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Spiritual Condition Tracker Source</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            ul { list-style-type: none; padding-left: 20px; }
            li { margin: 5px 0; }
            pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow: auto; }
          </style>
        </head>
        <body>
          <h1>Spiritual Condition Tracker Source Code</h1>
          <p>Browse the source code structure below:</p>
          ${fileList}
        </body>
      </html>
    `;
    
    res.send(html);
  } catch (err) {
    res.status(500).send(`Error reading directory: ${err.message}`);
  }
});

// Route to view file contents
app.get('/view', (req, res) => {
  const filePath = path.join(__dirname, 'src', req.query.file);
  
  // Validate the path to prevent directory traversal attacks
  if (!filePath.startsWith(path.join(__dirname, 'src'))) {
    return res.status(403).send('Access denied');
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileExt = path.extname(filePath);
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${req.query.file} - Spiritual Condition Tracker</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow: auto; }
            .back { margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="back"><a href="/">&laquo; Back to file list</a></div>
          <h1>${req.query.file}</h1>
          <pre>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
        </body>
      </html>
    `;
    
    res.send(html);
  } catch (err) {
    res.status(500).send(`Error reading file: ${err.message}`);
  }
});

app.listen(PORT, () => {
  console.log(`Source code browser server running at http://localhost:${PORT}`);
});