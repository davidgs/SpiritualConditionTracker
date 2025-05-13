// Simple React Native app runner
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5002;

// Serve the src directory
app.use('/src', express.static('src'));

// Serve a simple HTML page that loads the app
app.get('/', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Spiritual Condition Tracker</title>
        <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; }
          .container { max-width: 800px; margin: 0 auto; }
          .app-preview { border: 1px solid #ddd; border-radius: 10px; padding: 20px; margin-top: 20px; }
          h1 { color: #333; }
          .component { margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
          .component h3 { margin-bottom: 10px; }
          pre { background: #f5f5f5; padding: 10px; border-radius: 5px; overflow: auto; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Spiritual Condition Tracker App</h1>
          
          <p>Here's a preview of the key components from the src directory:</p>
          
          <div class="app-preview">
            <div class="component">
              <h3>App Structure</h3>
              <ul>
                <li><strong>Components</strong>: Dashboard, ActivityForm, History, NearbyMembers, ProximityWizard, etc.</li>
                <li><strong>Screens</strong>: Dashboard, SpiritualFitness, Meetings, Settings, etc.</li>
                <li><strong>Contexts</strong>: User data and Activities data management</li>
                <li><strong>Utils</strong>: SQLite database, proximity discovery, calculations</li>
              </ul>
            </div>
            
            <div class="component">
              <h3>Main Features</h3>
              <ul>
                <li>Track sobriety time and spiritual fitness</li>
                <li>Log prayer, meditation, and reading time</li>
                <li>Discover nearby AA members</li>
                <li>Check in to meetings</li>
                <li>Manage sponsor/sponsee relationships</li>
              </ul>
            </div>
            
            <div id="components-preview"></div>
          </div>
        </div>
        
        <script>
          // Load and display some of the code snippets
          fetch('/src/components/Dashboard.js')
            .then(response => response.text())
            .then(code => {
              const componentsDiv = document.getElementById('components-preview');
              const dashboardSection = document.createElement('div');
              dashboardSection.className = 'component';
              dashboardSection.innerHTML = '<h3>Dashboard Component</h3><pre>' + code.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</pre>';
              componentsDiv.appendChild(dashboardSection);
            })
            .catch(err => console.error('Failed to load Dashboard component:', err));
        </script>
      </body>
    </html>
  `;
  
  res.send(html);
});

app.listen(PORT, () => {
  console.log(`Simple src app preview running at http://localhost:${PORT}`);
});