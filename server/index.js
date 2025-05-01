const express = require('express');
const path = require('path');
const cors = require('cors');
const { initializeMemoryDB } = require('./memoryDB');

// Initialize the in-memory database
initializeMemoryDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Simple API route
app.get('/api/status', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
