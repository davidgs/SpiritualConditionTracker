const express = require('express');
const router = express.Router();
const { getAll, getById, add, update, remove, query } = require('../memoryDB');

/**
 * Get recent activities for a user
 */
router.get('/recent', (req, res) => {
  try {
    const { userId, limit = 5 } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Get activities for the user
    const userActivities = query('activities', activity => activity.userId === userId);
    
    // Sort by date (newest first)
    userActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Apply limit
    const limitedActivities = userActivities.slice(0, parseInt(limit, 10));
    
    res.json(limitedActivities);
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({ error: 'Failed to fetch recent activities' });
  }
});

/**
 * Get an activity by ID
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const activity = getById('activities', id);
    
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    res.json(activity);
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

/**
 * Get all activities or filter by user ID
 */
router.get('/', (req, res) => {
  try {
    const { userId } = req.query;
    
    if (userId) {
      // Get activities for a specific user
      const userActivities = query('activities', activity => activity.userId === userId);
      return res.json(userActivities);
    }
    
    // Get all activities
    const activities = getAll('activities');
    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

/**
 * Create a new activity
 */
router.post('/', (req, res) => {
  try {
    const newActivity = req.body;
    
    // Validate required fields
    if (!newActivity.type || !newActivity.date || !newActivity.userId) {
      return res.status(400).json({ error: 'Type, date, and userId are required' });
    }
    
    // Add the activity
    const activity = add('activities', {
      ...newActivity,
      createdAt: new Date().toISOString()
    });
    
    res.status(201).json(activity);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

/**
 * Update an activity
 */
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Remove id from updates if present
    if (updates.id) {
      delete updates.id;
    }
    
    const updatedActivity = update('activities', id, updates);
    
    if (!updatedActivity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    res.json(updatedActivity);
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({ error: 'Failed to update activity' });
  }
});

/**
 * Delete an activity
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const success = remove('activities', id);
    
    if (!success) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({ error: 'Failed to delete activity' });
  }
});

module.exports = router;
