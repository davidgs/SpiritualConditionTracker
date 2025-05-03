const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Enable CORS
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname)));

// Parse JSON request body
app.use(express.json());

// In-memory database
const db = {
  users: [
    {
      id: '1',
      name: 'John D.',
      sobrietyDate: '2021-01-15',
      email: 'john@example.com',
      phone: '555-123-4567',
      sponsorId: null,
      preferences: { shareLocation: true, notificationMinutes: 30 }
    }
  ],
  activities: [
    {
      id: '1',
      userId: '1',
      type: 'meeting',
      date: '2023-04-15T10:30:00',
      duration: 60,
      notes: 'First Avenue Group meeting',
      location: 'Community Center'
    },
    {
      id: '2',
      userId: '1',
      type: 'sponsor',
      date: '2023-04-14T20:15:00',
      duration: 15,
      notes: 'Call with sponsor'
    },
    {
      id: '3',
      userId: '1',
      type: 'meditation',
      date: '2023-04-13T07:00:00',
      duration: 20,
      notes: 'Morning meditation'
    }
  ],
  meetings: [
    {
      id: '1',
      name: 'First Avenue Group',
      address: '123 First Ave',
      dayOfWeek: 'Monday',
      time: '19:00',
      type: 'Open Discussion',
      notes: 'Beginner friendly'
    },
    {
      id: '2',
      name: 'Serenity Now',
      address: '456 Park Street',
      dayOfWeek: 'Wednesday',
      time: '12:00',
      type: 'Big Book Study',
      notes: 'Lunch meeting'
    }
  ],
  nearbyMembers: [
    {
      id: '2',
      name: 'John D.',
      sobrietyTime: '3 years',
      distance: 0.3,
      lastActive: '5 min ago'
    },
    {
      id: '3',
      name: 'Sarah M.',
      sobrietyTime: '7 months',
      distance: 0.8,
      lastActive: '20 min ago'
    },
    {
      id: '4',
      name: 'Robert K.',
      sobrietyTime: '5 years',
      distance: 1.2,
      lastActive: '1 hour ago'
    }
  ]
};

// Routes

// Get current user
app.get('/api/users/current', (req, res) => {
  res.json(db.users[0]);
});

// Get user activities
app.get('/api/activities', (req, res) => {
  res.json(db.activities);
});

// Log new activity
app.post('/api/activities', (req, res) => {
  const newActivity = {
    id: Date.now().toString(),
    userId: '1',
    ...req.body
  };
  
  db.activities.unshift(newActivity);
  res.status(201).json(newActivity);
});

// Get spiritual fitness
app.get('/api/spiritual-fitness', (req, res) => {
  // Calculate mock spiritual fitness based on activities
  const score = 8.7;
  const breakdown = {
    meetingAttendance: 4.5,
    prayerMeditation: 3.8,
    literatureStudy: 4.1,
    sponsorship: 4.3,
    serviceWork: 2.2
  };
  
  res.json({ score, breakdown });
});

// Get nearby members
app.get('/api/nearby-members', (req, res) => {
  res.json(db.nearbyMembers);
});

// Start discovery wizard
app.post('/api/discovery/start', (req, res) => {
  res.json({ status: 'success', wizardId: 'w123', step: 1 });
});

// Get meetings
app.get('/api/meetings', (req, res) => {
  res.json(db.meetings);
});

// Default route serves the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`AA Recovery Tracker web demo running at http://localhost:${PORT}`);
});