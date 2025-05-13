/**
 * Minimal Web App for Spiritual Condition Tracker
 * This is a direct web app that doesn't rely on Expo's web infrastructure
 */
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

// Serve static HTML
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Spiritual Condition Tracker</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        h1 {
          color: #2c3e50;
        }
        .card {
          background-color: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }
        .status {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .status-good {
          color: green;
          font-weight: bold;
        }
        .button {
          background-color: #3b82f6;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 4px;
          cursor: pointer;
          margin-right: 10px;
          margin-bottom: 10px;
        }
        .button:hover {
          background-color: #2563eb;
        }
        .logs {
          background-color: #fff;
          border-radius: 4px;
          padding: 10px;
          max-height: 300px;
          overflow-y: auto;
          font-family: monospace;
          font-size: 14px;
          line-height: 1.4;
        }
        .log-entry {
          margin-bottom: 5px;
          border-bottom: 1px solid #eee;
          padding-bottom: 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Spiritual Condition Tracker</h1>
          <p>Web Version</p>
        </div>
        
        <div class="card">
          <div class="status">
            <strong>Database Status:</strong>
            <span class="status-good">Initialized (Web Storage)</span>
          </div>
        </div>
        
        <div class="card">
          <h3>Test Functions</h3>
          <div>
            <button class="button" onclick="createUser()">Create Test User</button>
            <button class="button" onclick="createActivity()">Create Activity</button>
            <button class="button" onclick="createMeeting()">Create Meeting</button>
            <button class="button" onclick="calculateFitness()">Calculate Fitness</button>
            <button class="button" onclick="clearLogs()">Clear Logs</button>
          </div>
        </div>
        
        <div class="card">
          <h3>Results:</h3>
          <div id="logs" class="logs">
            <div class="log-entry">Database initialized with localStorage</div>
            <div class="log-entry">Ready to test operations</div>
          </div>
        </div>
      </div>
      
      <script>
        // Simple localStorage-based database operations
        const DB_PREFIX = 'spiritual_condition_';
        let testUserId = null;
        
        function log(message) {
          const logsElement = document.getElementById('logs');
          const entry = document.createElement('div');
          entry.className = 'log-entry';
          entry.textContent = message;
          logsElement.appendChild(entry);
          logsElement.scrollTop = logsElement.scrollHeight;
        }
        
        function clearLogs() {
          document.getElementById('logs').innerHTML = '';
        }
        
        function getTable(name) {
          const data = localStorage.getItem(DB_PREFIX + name) || '[]';
          return JSON.parse(data);
        }
        
        function saveTable(name, data) {
          localStorage.setItem(DB_PREFIX + name, JSON.stringify(data));
        }
        
        function createUser() {
          try {
            const users = getTable('users');
            const now = new Date().toISOString();
            const userId = 'user_' + Date.now();
            
            users.push({
              id: userId,
              name: 'Test User',
              sobriety_date: '2022-01-01',
              home_group: 'Thursday Night',
              created_at: now,
              updated_at: now
            });
            
            saveTable('users', users);
            testUserId = userId;
            log('Created test user with ID: ' + userId);
          } catch (error) {
            log('Error creating user: ' + error.message);
          }
        }
        
        function createActivity() {
          if (!testUserId) {
            log('Create a test user first');
            return;
          }
          
          try {
            const activities = getTable('activities');
            const now = new Date().toISOString();
            const activityId = 'activity_' + Date.now();
            
            activities.push({
              id: activityId,
              user_id: testUserId,
              type: 'prayer',
              date: now,
              duration: 15,
              notes: 'Morning prayer',
              created_at: now
            });
            
            saveTable('activities', activities);
            log('Created activity with ID: ' + activityId);
          } catch (error) {
            log('Error creating activity: ' + error.message);
          }
        }
        
        function createMeeting() {
          if (!testUserId) {
            log('Create a test user first');
            return;
          }
          
          try {
            const meetings = getTable('meetings');
            const now = new Date().toISOString();
            const meetingId = 'meeting_' + Date.now();
            
            meetings.push({
              id: meetingId,
              name: 'Thursday Night Beginners',
              day: 'thursday',
              time: '19:00',
              location: 'Community Center',
              address: '123 Main St',
              city: 'Anytown',
              state: 'CA',
              zip: '90210',
              type: 'open',
              notes: 'Beginner-friendly meeting',
              shared: true,
              created_by: testUserId,
              created_at: now,
              updated_at: now
            });
            
            saveTable('meetings', meetings);
            log('Created meeting with ID: ' + meetingId);
          } catch (error) {
            log('Error creating meeting: ' + error.message);
          }
        }
        
        function calculateFitness() {
          if (!testUserId) {
            log('Create a test user first');
            return;
          }
          
          try {
            const activities = getTable('activities');
            const userActivities = activities.filter(a => a.user_id === testUserId);
            
            // Calculate scores based on activity frequency and duration
            const scores = {
              prayer: 0,
              meditation: 0,
              reading: 0,
              meeting: 0,
              service: 0
            };
            
            // Process each activity type
            userActivities.forEach(activity => {
              const type = activity.type.toLowerCase();
              const duration = activity.duration || 0;
              
              if (type.includes('prayer')) {
                scores.prayer += duration / 10; // 10 minutes per day is ideal
              } else if (type.includes('meditation')) {
                scores.meditation += duration / 15; // 15 minutes per day is ideal
              } else if (type.includes('reading')) {
                scores.reading += duration / 20; // 20 minutes per day is ideal
              } else if (type.includes('meeting')) {
                scores.meeting += 1; // Each meeting counts as 1 point
              } else if (type.includes('service')) {
                scores.service += duration / 30; // 30 minutes per week is ideal
              }
            });
            
            // Cap each score at 10
            Object.keys(scores).forEach(key => {
              scores[key] = Math.min(10, scores[key]);
            });
            
            // Calculate total score (max 50)
            const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
            
            // Convert to percentage (0-100) with 2 decimal precision
            const finalScore = ((totalScore / 50) * 100).toFixed(2);
            
            log('Spiritual fitness: ' + finalScore);
            log('Details: ' + JSON.stringify(scores));
            
            // Save to fitness table
            const fitnessRecords = getTable('spiritual_fitness');
            const now = new Date().toISOString();
            
            fitnessRecords.push({
              id: 'sf_' + Date.now(),
              user_id: testUserId,
              score: parseFloat(finalScore),
              prayer_score: scores.prayer,
              meditation_score: scores.meditation,
              reading_score: scores.reading,
              meeting_score: scores.meeting,
              service_score: scores.service,
              calculated_at: now
            });
            
            saveTable('spiritual_fitness', fitnessRecords);
          } catch (error) {
            log('Error calculating spiritual fitness: ' + error.message);
          }
        }
        
        // Initialize database tables
        function initDatabase() {
          const tables = [
            'users', 'activities', 'meetings', 'spiritual_fitness'
          ];
          
          tables.forEach(table => {
            if (!localStorage.getItem(DB_PREFIX + table)) {
              localStorage.setItem(DB_PREFIX + table, '[]');
            }
          });
          
          log('Database initialized with localStorage');
        }
        
        // Run initialization when page loads
        window.onload = initDatabase;
      </script>
    </body>
    </html>
  `);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple web app running at http://0.0.0.0:${PORT}`);
});