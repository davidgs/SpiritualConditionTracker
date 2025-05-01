// Use Node.js built-in HTTP module instead of Express
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { exec } = require('child_process');

const PORT = process.env.PORT || 5000;

// In-memory database for the app
const db = {
  users: [],
  activities: [],
  spiritualFitness: [],
  meetings: [] // Added user-managed meetings
};

// Calculate spiritual fitness score for a user
const calculateSpiritualFitness = (userId, timeframe = 30) => {
  // Ensure user exists
  const user = db.users.find(u => u.id === userId);
  if (!user) return null;
  
  // Get activities for the user
  const userActivities = db.activities.filter(activity => activity.userId === userId);
  
  // Simple fitness calculation
  const now = new Date();
  const timeframeCutoff = new Date(now.setDate(now.getDate() - timeframe));
  
  // Filter activities within timeframe
  const relevantActivities = userActivities.filter(
    activity => new Date(activity.date) >= timeframeCutoff
  );
  
  // Calculate scores based on activity count and variety
  const activityCount = relevantActivities.length;
  const activityTypes = new Set(relevantActivities.map(a => a.type)).size;
  
  // Simple score based on activity count and variety
  const score = Math.min(100, Math.round((activityCount * 5) + (activityTypes * 10)));
  
  // Store the calculation
  const fitnessData = {
    userId,
    score,
    timeframe,
    lastCalculated: new Date().toISOString(),
    activityCount,
    activityTypes
  };
  
  // Update or add fitness data
  const existingIndex = db.spiritualFitness.findIndex(sf => sf.userId === userId);
  if (existingIndex >= 0) {
    db.spiritualFitness[existingIndex] = fitnessData;
  } else {
    db.spiritualFitness.push(fitnessData);
  }
  
  return fitnessData;
};

// Get spiritual fitness for a user
const getSpiritualFitness = (userId, timeframe = 30) => {
  // Check if we already have a recent calculation
  const existingFitness = db.spiritualFitness.find(sf => 
    sf.userId === userId && sf.timeframe === timeframe);
  
  // If we have a recent calculation (less than an hour old), return it
  if (existingFitness && 
      (new Date() - new Date(existingFitness.lastCalculated)) < 60 * 60 * 1000) {
    return existingFitness;
  }
  
  // Otherwise calculate a new one
  return calculateSpiritualFitness(userId, timeframe);
};

// Calculate distance between two coordinates in kilometers using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  
  return distance;
};

// Calculate sobriety days
const calculateSobrietyDays = (sobrietyDate) => {
  if (!sobrietyDate) return 0;
  
  const start = new Date(sobrietyDate);
  const now = new Date();
  
  // Calculate the difference in days
  const diffTime = Math.abs(now - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Get content type for file extension
const getContentType = (extname) => {
  switch (extname) {
    case '.html':
      return 'text/html';
    case '.js':
      return 'text/javascript';
    case '.css':
      return 'text/css';
    case '.json':
      return 'application/json';
    case '.png':
      return 'image/png';
    case '.jpg':
      return 'image/jpg';
    case '.svg':
      return 'image/svg+xml';
    default:
      return 'text/plain';
  }
};

// Serve a static file
const serveFile = (filePath, res) => {
  try {
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = getContentType(extname);
    
    const content = fs.readFileSync(filePath);
    res.writeHead(200, {'Content-Type': contentType});
    res.end(content);
  } catch (error) {
    console.error(`Error serving file ${filePath}:`, error);
    res.writeHead(404);
    res.end('File Not Found');
  }
};

// Simple CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

// Create a minimal HTTP server with API capabilities
const server = http.createServer((req, res) => {
  // Add CORS headers to all responses
  Object.keys(corsHeaders).forEach(header => {
    res.setHeader(header, corsHeaders[header]);
  });
  
  // Handle OPTIONS requests for CORS
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Parse the URL
  const reqUrl = url.parse(req.url, true);
  const pathname = reqUrl.pathname;
  
  // API routes
  if (pathname.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');
    
    // Status endpoint
    if (pathname === '/api/status') {
      res.writeHead(200);
      res.end(JSON.stringify({ status: 'OK', message: 'Server is running' }));
      return;
    }
    
    // Get all activities
    if (pathname === '/api/activities' && req.method === 'GET') {
      // Check for userId query param for filtering
      const userId = reqUrl.query.userId;
      let activities = [...db.activities];
      
      if (userId) {
        activities = activities.filter(activity => activity.userId === userId);
      }
      
      res.writeHead(200);
      res.end(JSON.stringify(activities));
      return;
    }
    
    // Get recent activities
    if (pathname === '/api/activities/recent' && req.method === 'GET') {
      const userId = reqUrl.query.userId;
      const limit = parseInt(reqUrl.query.limit || '5', 10);
      
      if (!userId) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'User ID is required' }));
        return;
      }
      
      let activities = db.activities.filter(activity => activity.userId === userId);
      
      // Sort by date (newest first)
      activities.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // Apply limit
      activities = activities.slice(0, limit);
      
      res.writeHead(200);
      res.end(JSON.stringify(activities));
      return;
    }
    
    // Get an activity by ID
    if (pathname.startsWith('/api/activities/') && req.method === 'GET' && pathname !== '/api/activities/recent') {
      const id = pathname.split('/').pop();
      const activity = db.activities.find(a => a.id === id);
      
      if (!activity) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Activity not found' }));
        return;
      }
      
      res.writeHead(200);
      res.end(JSON.stringify(activity));
      return;
    }
    
    // Add activity
    if (pathname === '/api/activities' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          const activity = JSON.parse(body);
          
          // Validate required fields
          if (!activity.type || !activity.date || !activity.userId) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Type, date, and userId are required' }));
            return;
          }
          
          activity.id = `activity_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          activity.createdAt = new Date().toISOString();
          
          db.activities.push(activity);
          
          // Calculate spiritual fitness after adding activity
          calculateSpiritualFitness(activity.userId);
          
          res.writeHead(201);
          res.end(JSON.stringify(activity));
        } catch (error) {
          console.error('Error processing activity:', error);
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid activity data' }));
        }
      });
      return;
    }
    
    // Get all users
    if (pathname === '/api/users' && req.method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify(db.users.map(user => {
        const { password, ...safeUser } = user;
        return safeUser;
      })));
      return;
    }
    
    // Get a user by ID
    if (pathname.startsWith('/api/users/') && 
        req.method === 'GET' && 
        !pathname.includes('/spiritual-fitness')) {
      const id = pathname.split('/').pop();
      const user = db.users.find(u => u.id === id);
      
      if (!user) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'User not found' }));
        return;
      }
      
      // Remove sensitive information
      const { password, ...safeUser } = user;
      
      res.writeHead(200);
      res.end(JSON.stringify(safeUser));
      return;
    }
    
    // Get spiritual fitness for a user
    if (pathname.startsWith('/api/users/') && 
        pathname.includes('/spiritual-fitness') && 
        req.method === 'GET') {
      const userId = pathname.split('/')[3]; // Extract user ID from URL
      const timeframe = parseInt(reqUrl.query.timeframe || '30', 10);
      
      const fitnessData = getSpiritualFitness(userId, timeframe);
      
      if (!fitnessData) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'User not found or no fitness data available' }));
        return;
      }
      
      res.writeHead(200);
      res.end(JSON.stringify(fitnessData));
      return;
    }
    
    // Create a new user
    if (pathname === '/api/users' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          const newUser = JSON.parse(body);
          
          // Validate required fields
          if (!newUser.name || !newUser.email) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Name and email are required' }));
            return;
          }
          
          const user = {
            ...newUser,
            id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            createdAt: new Date().toISOString()
          };
          
          db.users.push(user);
          
          // Remove sensitive information from response
          const { password, ...safeUser } = user;
          
          res.writeHead(201);
          res.end(JSON.stringify(safeUser));
        } catch (error) {
          console.error('Error creating user:', error);
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid user data' }));
        }
      });
      return;
    }
    
    // Get user meetings
    if (pathname === '/api/meetings' && req.method === 'GET') {
      // We now use a user-managed meeting list instead of an external API
      // Simple in-memory storage for meetings (in real app, this would be in the SQLite database)
      if (!db.meetings) {
        db.meetings = [];
      }
      
      const { day, type } = reqUrl.query;
      
      // Filter meetings based on query parameters
      let filteredMeetings = [...db.meetings];
      
      if (day) {
        filteredMeetings = filteredMeetings.filter(m => 
          m.day && m.day.toLowerCase() === day.toLowerCase()
        );
      }
      
      if (type) {
        filteredMeetings = filteredMeetings.filter(m => 
          m.type && m.type.toLowerCase().includes(type.toLowerCase())
        );
      }
      
      res.writeHead(200);
      res.end(JSON.stringify(filteredMeetings));
      return;
    }
    
    // Create a new meeting
    if (pathname === '/api/meetings' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          const meeting = JSON.parse(body);
          
          // Validate required fields
          if (!meeting.name || !meeting.day || !meeting.time) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Name, day, and time are required' }));
            return;
          }
          
          // Initialize meetings array if it doesn't exist
          if (!db.meetings) {
            db.meetings = [];
          }
          
          // Add ID and creation timestamp
          meeting.id = `meeting_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          meeting.createdAt = new Date().toISOString();
          
          // Add to database
          db.meetings.push(meeting);
          
          res.writeHead(201);
          res.end(JSON.stringify(meeting));
        } catch (error) {
          console.error('Error creating meeting:', error);
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid meeting data' }));
        }
      });
      return;
    }
    
    // Update a meeting
    if (pathname.startsWith('/api/meetings/') && req.method === 'PUT') {
      const id = pathname.split('/').pop();
      
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          // Initialize meetings array if it doesn't exist
          if (!db.meetings) {
            db.meetings = [];
          }
          
          const meetingIndex = db.meetings.findIndex(m => m.id === id);
          
          if (meetingIndex === -1) {
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Meeting not found' }));
            return;
          }
          
          const updatedMeeting = JSON.parse(body);
          
          // Preserve ID and creation date
          updatedMeeting.id = id;
          updatedMeeting.createdAt = db.meetings[meetingIndex].createdAt;
          
          // Update the meeting
          db.meetings[meetingIndex] = updatedMeeting;
          
          res.writeHead(200);
          res.end(JSON.stringify(updatedMeeting));
        } catch (error) {
          console.error('Error updating meeting:', error);
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid meeting data' }));
        }
      });
      return;
    }
    
    // Delete a meeting
    if (pathname.startsWith('/api/meetings/') && req.method === 'DELETE') {
      // Initialize meetings array if it doesn't exist
      if (!db.meetings) {
        db.meetings = [];
      }
      
      const id = pathname.split('/').pop();
      const meetingIndex = db.meetings.findIndex(m => m.id === id);
      
      if (meetingIndex === -1) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Meeting not found' }));
        return;
      }
      
      // Remove the meeting
      db.meetings.splice(meetingIndex, 1);
      
      res.writeHead(200);
      res.end(JSON.stringify({ message: 'Meeting deleted successfully' }));
      return;
    }
    
    // Get shared meetings
    if (pathname === '/api/meetings/shared' && req.method === 'GET') {
      // Initialize meetings array if it doesn't exist
      if (!db.meetings) {
        db.meetings = [];
      }
      
      // Filter for shared meetings only
      const sharedMeetings = db.meetings.filter(m => m.isShared);
      
      res.writeHead(200);
      res.end(JSON.stringify(sharedMeetings));
      return;
    }
    
    // Get nearby users
    if (pathname === '/api/nearby-users' && req.method === 'GET') {
      const { lat, lng, radius = 1, userId } = reqUrl.query;
      
      if (!lat || !lng || !userId) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Latitude, longitude, and userId are required' }));
        return;
      }
      
      // Update user's location
      const userIndex = db.users.findIndex(u => u.id === userId);
      if (userIndex >= 0) {
        db.users[userIndex].location = {
          lat: parseFloat(lat),
          lng: parseFloat(lng)
        };
        db.users[userIndex].lastSeen = new Date().toISOString();
      }
      
      // Find users within radius (simplified distance calculation)
      const nearbyUsers = db.users.filter(user => {
        if (user.id === userId || !user.discoverable) return false;
        
        // Simple distance calculation (not accurate for large distances)
        const distance = calculateDistance(
          parseFloat(lat), 
          parseFloat(lng), 
          user.location.lat, 
          user.location.lng
        );
        
        return distance <= parseFloat(radius);
      });
      
      // Only return non-sensitive information
      const sanitizedUsers = nearbyUsers.map(user => {
        const { password, email, ...publicInfo } = user;
        return publicInfo;
      });
      
      res.writeHead(200);
      res.end(JSON.stringify(sanitizedUsers));
      return;
    }
    
    // Update user's discovery settings
    if (pathname === '/api/users/discovery-settings' && req.method === 'PUT') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          const { userId, discoverable } = JSON.parse(body);
          
          if (userId === undefined || discoverable === undefined) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'userId and discoverable are required' }));
            return;
          }
          
          const userIndex = db.users.findIndex(user => user.id === userId);
          if (userIndex === -1) {
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'User not found' }));
            return;
          }
          
          db.users[userIndex].discoverable = Boolean(discoverable);
          
          res.writeHead(200);
          res.end(JSON.stringify({ 
            id: userId, 
            discoverable: db.users[userIndex].discoverable 
          }));
        } catch (error) {
          console.error('Error updating discovery settings:', error);
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid request data' }));
        }
      });
      return;
    }
    
    // API endpoint not found
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'API endpoint not found' }));
    return;
  }
  
  // Serve static files (index.html, css, js, etc.)
  if (pathname === '/') {
    // Serve index.html for root path
    serveFile(path.join(__dirname, '../public/index.html'), res);
  } else {
    // Check if the file exists in public directory
    const filePath = path.join(__dirname, '../public', pathname);
    
    // Only try to serve files that might exist and are within the public directory
    if (fs.existsSync(filePath) && pathname.indexOf('..') === -1) {
      serveFile(filePath, res);
    } else {
      // Serve index.html for client-side routing
      serveFile(path.join(__dirname, '../public/index.html'), res);
    }
  }
});

// Add sample data
db.users.push({
  id: 'user_1',
  name: 'John Doe',
  email: 'john@example.com',
  sobrietyDate: '1985-01-01',
  phone: '555-123-4567',
  discoverable: true, // Available for nearby discovery
  location: {
    lat: 37.7749,
    lng: -122.4194
  },
  lastSeen: new Date().toISOString(),
  createdAt: new Date().toISOString()
});

db.users.push({
  id: 'user_2',
  name: 'Jane Smith',
  email: 'jane@example.com',
  sobrietyDate: '2021-03-15',
  phone: '555-987-6543',
  discoverable: true,
  location: {
    lat: 37.7749,
    lng: -122.4194
  },
  lastSeen: new Date().toISOString(),
  createdAt: new Date().toISOString()
});

db.activities.push({
  id: 'activity_1',
  userId: 'user_1',
  type: 'meeting',
  name: 'Morning Meditation',
  date: new Date().toISOString(),
  duration: 60,
  notes: 'Great meeting with strong sharing',
  createdAt: new Date().toISOString()
});

// Add sample meetings
db.meetings.push({
  id: 'meeting_1',
  name: 'Downtown Morning Serenity',
  day: 'Monday',
  time: '07:30',
  location: 'Community Center',
  address: '123 Main Street',
  city: 'San Francisco',
  state: 'CA',
  type: 'Open',
  notes: 'Beginner-friendly meeting with coffee and donuts',
  isShared: true,
  createdAt: new Date().toISOString()
});

db.meetings.push({
  id: 'meeting_2',
  name: 'Sunset Discussion Group',
  day: 'Wednesday',
  time: '19:00',
  location: 'Sunset Church',
  address: '456 Sunset Blvd',
  city: 'San Francisco',
  state: 'CA',
  type: 'Closed',
  notes: 'Discussion format, 1 hour',
  isShared: true,
  createdAt: new Date().toISOString()
});

db.meetings.push({
  id: 'meeting_3',
  name: 'Saturday Step Study',
  day: 'Saturday',
  time: '10:00',
  location: 'Recovery Center',
  address: '789 Recovery Road',
  city: 'San Francisco',
  state: 'CA',
  type: 'Step Study',
  notes: 'Focuses on one step per week with detailed discussion',
  isShared: true,
  createdAt: new Date().toISOString()
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
