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

  // Try to render Dashboard component
  try {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#1a1a1a',
        color: '#ffffff'
      }}>
        <Dashboard
          user={state.user}
          activities={filteredActivities}
          currentTimeframe={state.currentTimeframe}
          onSaveActivity={handleSaveActivity}
          onTimeframeChange={handleTimeframeChange}
          setCurrentView={handleNavigation}
        />
      </div>
    );
  } catch (error) {
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
        <h2>Dashboard Component Error</h2>
        <p>Error rendering Dashboard: {error instanceof Error ? error.message : 'Unknown error'}</p>
        <pre style={{ fontSize: '12px', marginTop: '20px' }}>
          {error instanceof Error ? error.stack : 'No stack trace available'}
        </pre>
      </div>
    );
  }
}

function App() {
  return (
    <AppDataProvider>
      <AppContent />
    </AppDataProvider>
  );
}

export default App;