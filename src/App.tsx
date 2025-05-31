/**
 * App Component - Dashboard Only for Testing
 */

import React from 'react';
import { AppDataProvider, useAppData } from './contexts/AppDataContext';
import MuiThemeProvider, { useAppTheme } from './contexts/MuiThemeProvider';
import { useTheme } from '@mui/material/styles';

// Import components for testing
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import BottomNavBar from './components/BottomNavBar';
import Meetings from './components/Meetings';
import Profile from './components/Profile';

function AppContent() {
  const { state, addActivity, addMeeting, deleteMeeting, updateTimeframe, updateUser, resetAllData } = useAppData();
  const muiTheme = useTheme();
  const [currentView, setCurrentView] = React.useState('dashboard');

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
      if (savedActivity) {
        console.log('[ App ] Activity saved successfully:', savedActivity?.id);
        return savedActivity;
      } else {
        console.log('[ App ] Activity saved to fallback storage');
        return newActivity; // Return the activity data even if it went to fallback
      }
    } catch (error) {
      console.error('[ App ] Error saving activity:', error);
      throw error; // Re-throw to let the LogActivityModal handle the error display
    }
  }

  // Handle saving new meeting
  async function handleSaveMeeting(meetingData: any): Promise<any> {
    try {
      const savedMeeting = await addMeeting(meetingData);
      console.log('[ App ] Meeting saved successfully:', savedMeeting?.id);
      return savedMeeting;
    } catch (error) {
      console.error('[ App ] Error saving meeting:', error);
      return null;
    }
  }

  // Handle deleting meeting
  async function handleDeleteMeeting(meetingId: string | number): Promise<boolean> {
    try {
      const success = await deleteMeeting(meetingId);
      console.log('[ App ] Meeting deleted successfully:', meetingId);
      return success;
    } catch (error) {
      console.error('[ App ] Error deleting meeting:', error);
      return false;
    }
  }

  // Handle updating user profile
  async function handleUpdateProfile(updates: any, options: any = {}): Promise<any> {
    try {
      const updatedUser = await updateUser(updates);
      console.log('[ App ] Profile updated successfully:', updatedUser?.id);
      return updatedUser;
    } catch (error) {
      console.error('[ App ] Error updating profile:', error);
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
    setCurrentView(view);
  }

  const filteredActivities = filterActivitiesByTimeframe(state.activities, state.currentTimeframe);

  // Try to render Header + Dashboard with MuiThemeProvider context
  try {
    return (
      <div style={{ 
        minHeight: '100vh',
        backgroundColor: muiTheme.palette.background.default,
        color: muiTheme.palette.text.primary
      }}>
        <Header 
          title="Recovery Dashboard"
          menuOpen={false}
          setMenuOpen={() => {}}
          isMobile={true}
        />
        <div style={{ paddingTop: '80px', paddingBottom: '80px' }}>
          {currentView === 'dashboard' && (
            <Dashboard
              user={state.user}
              activities={filteredActivities}
              meetings={state.meetings}
              currentTimeframe={state.currentTimeframe}
              onSave={handleSaveActivity}
              onSaveMeeting={handleSaveMeeting}
              onTimeframeChange={handleTimeframeChange}
              setCurrentView={handleNavigation}
            />
          )}
          {currentView === 'meetings' && (
            <Meetings
              setCurrentView={handleNavigation}
              meetings={state.meetings}
              onSave={handleSaveMeeting}
              onDelete={handleDeleteMeeting}
              user={state.user}
            />
          )}
          {currentView === 'profile' && (
            <Profile
              setCurrentView={handleNavigation}
              user={state.user}
              onUpdate={handleUpdateProfile}
              meetings={state.meetings}
              onSaveMeeting={handleSaveMeeting}
              onResetAllData={resetAllData}
              currentUserId={state.currentUserId}
            />
          )}
          {currentView !== 'dashboard' && currentView !== 'meetings' && currentView !== 'profile' && (
            <div style={{ 
              padding: '20px', 
              textAlign: 'center',
              color: muiTheme.palette.text.secondary 
            }}>
              <h2>Coming Soon</h2>
              <p>{currentView.charAt(0).toUpperCase() + currentView.slice(1)} page is under development</p>
            </div>
          )}
        </div>
        
        <BottomNavBar 
          currentView={currentView}
          onNavigate={handleNavigation}
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