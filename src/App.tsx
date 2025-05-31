/**
 * App Component - Dashboard Only for Testing
 */

import React from 'react';
import { AppDataProvider, useAppData } from './contexts/AppDataContext';
import MuiThemeProvider from './contexts/MuiThemeProvider';

// Import components for testing
import Dashboard from './components/Dashboard';
import Header from './components/Header';

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

  // Try to render Header + Dashboard with MuiThemeProvider context
  try {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Header 
          title="Recovery Dashboard"
          menuOpen={false}
          setMenuOpen={() => {}}
          isMobile={true}
        />
        <div style={{ paddingTop: '80px' }}>
          <Dashboard
            user={state.user}
            activities={filteredActivities}
            meetings={state.meetings}
            currentTimeframe={state.currentTimeframe}
            onSave={handleSaveActivity}
            onSaveMeeting={async (meetingData) => {
              console.log('Meeting save not implemented yet:', meetingData);
              return null;
            }}
            onTimeframeChange={handleTimeframeChange}
            setCurrentView={handleNavigation}
          />
        </div>
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
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#2d2d2d', borderRadius: '8px' }}>
          <h3>Debug Info:</h3>
          <p>Database Status: {state.databaseStatus}</p>
          <p>User: {state.user ? 'Loaded' : 'Not loaded'}</p>
          <p>Activities: {state.activities.length}</p>
          <p>Timeframe: {state.currentTimeframe}</p>
        </div>
        <pre style={{ fontSize: '12px', marginTop: '20px', maxWidth: '100%', overflow: 'auto' }}>
          {error instanceof Error ? error.stack : 'No stack trace available'}
        </pre>
      </div>
    );
  }
}

function App() {
  return (
    <AppDataProvider>
      <MuiThemeProvider>
        <AppContent />
      </MuiThemeProvider>
    </AppDataProvider>
  );
}

export default App;