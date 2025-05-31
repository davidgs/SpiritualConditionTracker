/**
 * App Component - Dashboard Only for Testing
 */

import React from 'react';
import { AppDataProvider, useAppData } from './contexts/AppDataContext';

// Import only Dashboard for testing
import Dashboard from './components/Dashboard';

function AppContent() {
  const { state, addActivity, updateTimeframe } = useAppData();

  // Show loading state
  if (state.isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh',
        backgroundColor: '#1a1a1a',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <h2>Loading...</h2>
        <p>Database Status: {state.databaseStatus}</p>
      </div>
    );
  }

  // Show error state
  if (state.error) {
    return (
      <div style={{ 
        minHeight: '100vh',
        backgroundColor: '#1a1a1a',
        color: '#ff6b6b',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <h2>Error</h2>
        <p>{state.error}</p>
        <p>Using fallback storage</p>
      </div>
    );
  }

  // Filter activities by timeframe
  function filterActivitiesByTimeframe(activities: any[], timeframeDays: number): any[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeframeDays);
    
    return activities.filter(activity => {
      const activityDate = new Date(activity.date);
      return activityDate >= cutoffDate;
    });
  }

  // Handle saving new activity
  async function handleSaveActivity(activityData: any): Promise<any> {
    try {
      const userId = state.currentUserId;
      if (!userId) {
        throw new Error('No user ID available');
      }

      const newActivity = {
        userId: String(userId),
        type: activityData.type,
        date: activityData.date,
        notes: activityData.notes || '',
        duration: activityData.duration || null,
        location: activityData.location || null,
      };

      const savedActivity = await addActivity(newActivity);
      console.log('[ App ] Activity saved successfully:', savedActivity?.id);
      return savedActivity;
    } catch (error) {
      console.error('[ App ] Error saving activity:', error);
      return null;
    }
  }

  // Handle timeframe change
  async function handleTimeframeChange(newTimeframe: number) {
    await updateTimeframe(newTimeframe);
  }

  // Simple navigation handler (does nothing for now)
  function handleNavigation(view: string) {
    console.log('Navigation to:', view);
    // For testing, we stay on dashboard
  }

  const filteredActivities = filterActivitiesByTimeframe(state.activities, state.currentTimeframe);

  // Simple Dashboard replacement without Material-UI
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#1a1a1a',
      color: '#ffffff',
      padding: '20px'
    }}>
      <h1>Recovery Dashboard</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Database Status: {state.databaseStatus}</h3>
      </div>

      {state.user && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#2d2d2d', borderRadius: '8px' }}>
          <h3>Welcome, {state.user.name || 'User'}</h3>
          <p>Sobriety Date: {state.user.sobrietyDate || 'Not set'}</p>
          <p>Phone: {state.user.phoneNumber || 'Not set'}</p>
          <p>Email: {state.user.email || 'Not set'}</p>
        </div>
      )}

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#2d2d2d', borderRadius: '8px' }}>
        <h3>Activities ({filteredActivities.length})</h3>
        <p>Timeframe: {state.currentTimeframe} days</p>
        <p>Spiritual Fitness: {state.spiritualFitness}</p>
        
        {filteredActivities.length > 0 ? (
          filteredActivities.map((activity, index) => (
            <div key={activity.id || index} style={{ 
              marginBottom: '10px', 
              padding: '10px', 
              backgroundColor: '#3d3d3d', 
              borderRadius: '4px' 
            }}>
              <p><strong>Type:</strong> {activity.type}</p>
              <p><strong>Date:</strong> {activity.date}</p>
              {activity.notes && <p><strong>Notes:</strong> {activity.notes}</p>}
            </div>
          ))
        ) : (
          <p>No activities in the last {state.currentTimeframe} days</p>
        )}
      </div>

      <div style={{ padding: '15px', backgroundColor: '#2d2d2d', borderRadius: '8px' }}>
        <h3>Quick Actions</h3>
        <button 
          onClick={() => handleNavigation('profile')}
          style={{
            marginRight: '10px',
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Profile
        </button>
        <button 
          onClick={() => handleNavigation('meetings')}
          style={{
            marginRight: '10px',
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Meetings
        </button>
        <button 
          onClick={() => handleNavigation('stepwork')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Step Work
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <AppDataProvider>
      <AppContent />
    </AppDataProvider>
  );
}

export default App;