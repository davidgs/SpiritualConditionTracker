/**
 * App Component - Dashboard Only for Testing
 */

import React from 'react';
import { AppDataProvider, useAppData } from './contexts/AppDataContext';
import MuiThemeProvider, { useAppTheme } from './contexts/MuiThemeProvider';
import { useTheme } from '@mui/material/styles';
import DatabaseService from './services/DatabaseService';

// Lazy load components for better performance
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const Meetings = React.lazy(() => import('./components/Meetings'));
const Profile = React.lazy(() => import('./components/Profile'));
const SponsorSponsee = React.lazy(() => import('./components/SponsorSponsee'));

// Keep frequently used components as regular imports
import Header from './components/Header';
import BottomNavBar from './components/BottomNavBar';

function AppContent() {
  const { state, addActivity, addMeeting, updateMeeting, deleteMeeting, updateTimeframe, updateUser, resetAllData } = useAppData();
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
    const now = new Date();
    const cutoffTime = now.getTime() - (timeframeDays * 24 * 60 * 60 * 1000);
    const cutoffDate = new Date(cutoffTime);
    
    // console.log(`[ App.tsx ] Filtering activities for ${timeframeDays} days`);
    // console.log(`[ App.tsx ] Cutoff date: ${cutoffDate.toISOString()}`);
    // console.log(`[ App.tsx ] Total activities before filter: ${activities.length}`);
    
    const filtered = activities.filter(activity => {
      if (!activity.date) return false;
      const activityDate = new Date(activity.date);
      const isWithinRange = activityDate >= cutoffDate;
      
      // if (isWithinRange) {
      //   console.log(`[ App.tsx ] Including activity: ${activity.type} on ${activity.date}`);
      // }
      
      return isWithinRange;
    });
    
    // console.log(`[ App.tsx ] Activities after ${timeframeDays}-day filter: ${filtered.length}`);
    
    return filtered;
  }

  // Handle saving new activity or updating existing one
  async function handleSaveActivity(activityData: any): Promise<any> {
    try {
      console.log('[ App.tsx:73 handleSaveActivity ] Received activity data:', JSON.stringify(activityData, null, 2));
      console.log('[ App.tsx:74 handleSaveActivity ] Current user state:', state.user);
      
      // Check if this is an update (has ID) or new activity
      if (activityData.id) {
        console.log('[ App.tsx:76 handleSaveActivity ] Updating existing activity with ID:', activityData.id);
        // This is an update - preserve the ID and update the existing record
        const updateData = {
          type: activityData.type,
          date: activityData.date,
          notes: activityData.notes || '',
          duration: activityData.duration || null,
          location: activityData.location || null,
          updatedAt: new Date().toISOString()
        };
        
        // Use the database service directly to update
        const databaseService = DatabaseService.getInstance();
        const updatedActivity = await databaseService.updateActivity(activityData.id, updateData);
        console.log('[ App.tsx:87 handleSaveActivity ] Activity updated successfully:', updatedActivity);
        return updatedActivity;
      } else {
        // This is a new activity - pass through all fields to preserve meeting data
        const newActivity = {
          ...activityData, // Include all fields from the modal
          notes: activityData.notes || '',
          duration: activityData.duration || null,
          location: activityData.location || null,
        };

        const savedActivity = await addActivity(newActivity);
        
        if (savedActivity) {
          return savedActivity;
        } else {
          return newActivity; // Return the activity data even if it went to fallback
        }
      }
    } catch (error) {
      console.error('[ App.tsx:95 handleSaveActivity ] Error saving activity:', error);
      throw error; // Re-throw to let the LogActivityModal handle the error display
    }
  }

  // Handle saving meeting (new or update)
  async function handleSaveMeeting(meetingData: any): Promise<any> {
    try {
      let savedMeeting;
      
      // If the meeting has an ID, it's an update
      if (meetingData.id) {
        const { id, ...updateData } = meetingData;
        savedMeeting = await updateMeeting(id, updateData);
       // console.log('[ App ] Meeting updated successfully:', savedMeeting?.id);
      } else {
        // If no ID, it's a new meeting
        savedMeeting = await addMeeting(meetingData);
       // console.log('[ App ] Meeting created successfully:', savedMeeting?.id);
      }
      
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
    //  console.log('[ App ] Meeting deleted successfully:', meetingId);
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
     // console.log('[ App: 131 ] Profile updated successfully:', updatedUser?.id);
      return updatedUser;
    } catch (error) {
      console.error('[ App: 134 ] Error updating profile:', error);
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

  // Handle action item updates (complete/delete)
  async function handleUpdateActionItem(actionItemId: string, status: 'completed' | 'deleted') {
    try {
      console.log('Updating action item:', actionItemId, 'to status:', status);
      // TODO: Implement action item update logic
      // This would call a function to update the action item status in the database
    } catch (error) {
      console.error('Error updating action item:', error);
    }
  }

  // Handle navigation to sponsor contact details
  function handleNavigateToSponsorContact(contactId: string) {
    console.log('Navigating to sponsor contact:', contactId);
    // Navigate to the sponsor page which shows sponsor contacts
    setCurrentView('sponsor');
  }

  const filteredActivities = filterActivitiesByTimeframe(state.activities, state.currentTimeframe);

  // Try to render Header + Dashboard with MuiThemeProvider context
  try {
    return (
      <div style={{ 
        minHeight: '100vh',
        backgroundColor: muiTheme.palette.background.default,
        color: muiTheme.palette.text.primary,
        position: 'relative',
        paddingTop: 'max(env(safe-area-inset-top), 0px)',
        paddingBottom: 'max(env(safe-area-inset-bottom), 0px)',
        paddingLeft: 'max(env(safe-area-inset-left), 0px)',
        paddingRight: 'max(env(safe-area-inset-right), 0px)'
      }}>
        <Header 
          title="Recovery Dashboard"
          menuOpen={false}
          setMenuOpen={() => {}}
          isMobile={true}
        />
        <div style={{ 
          paddingTop: 'calc(60px + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))'
        }}>
          <React.Suspense fallback={
            <div style={{ 
              padding: '20px', 
              textAlign: 'center',
              color: muiTheme.palette.text.secondary,
              minHeight: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              Loading...
            </div>
          }>
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
                onUpdateActionItem={handleUpdateActionItem}
                onNavigateToSponsorContact={handleNavigateToSponsorContact}
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
            {currentView === 'sponsor' && (
              <SponsorSponsee
                user={state.user}
                onUpdate={handleUpdateProfile}
                onSaveActivity={handleSaveActivity}
                activities={state.activities}
              />
            )}
          </React.Suspense>
          {currentView !== 'dashboard' && currentView !== 'meetings' && currentView !== 'profile' && currentView !== 'sponsor' && (
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