const express = require('express');
const router = express.Router();
const { getAll, getById, add, update, remove } = require('../memoryDB');

/**
 * Get all users
 */
router.get('/', (req, res) => {
  try {
    const users = getAll('users');
    
    // Remove sensitive information for security
    const sanitizedUsers = users.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });
    
    res.json(sanitizedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * Get spiritual fitness for a user
 */
router.get('/fitness/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { timeframe = 30 } = req.query; // Default to 30 days
    
    // This would typically fetch from a database, but for this MVP we'll calculate it
    // Get activities for the user
    const { query } = require('../memoryDB');
    const userActivities = query('activities', activity => activity.userId === userId);
    
    // Simple fitness calculation
    const now = new Date();
    const timeframeCutoff = new Date(now.setDate(now.getDate() - parseInt(timeframe, 10)));
    
    // Filter activities within timeframe
    const relevantActivities = userActivities.filter(
      activity => new Date(activity.date) >= timeframeCutoff
    );
    
    // Very basic calculation for MVP
    // In a real app, this would be more sophisticated
    const activityCount = relevantActivities.length;
    const activityTypes = new Set(relevantActivities.map(a => a.type)).size;
    
    // Simple score based on activity count and variety
    const score = Math.min(100, Math.round((activityCount * 5) + (activityTypes * 10)));
    
    res.json({
      userId,
      score,
      timeframe: parseInt(timeframe, 10),
      lastCalculated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error calculating spiritual fitness:', error);
    res.status(500).json({ error: 'Failed to calculate spiritual fitness' });
  }
});

/**
 * Get a user by ID
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const user = getById('users', id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Remove sensitive information for security
    const { password, ...safeUser } = user;
    
    res.json(safeUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * Create a new user (registration)
 */
router.post('/', (req, res) => {
  try {
    const newUser = req.body;
    
    // In a real app, we would validate and hash passwords
    
    // Add the user
    const user = add('users', {
      ...newUser,
      createdAt: new Date().toISOString()
    });
    
    // Remove sensitive information
    const { password, ...safeUser } = user;
    
    res.status(201).json(safeUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

/**
 * Update a user
 */
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Remove id from updates if present
    if (updates.id) {
      delete updates.id;
    }
    
    const updatedUser = update('users', id, updates);
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Remove sensitive information
    const { password, ...safeUser } = updatedUser;
    
    res.json(safeUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

/**
 * Delete a user
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const success = remove('users', id);
    
    if (!success) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
