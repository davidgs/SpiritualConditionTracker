/**
 * Main App Component - Centralized State Management Version
 * Uses AppDataContext for all data operations
 */

import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppDataProvider, useAppData } from './contexts/AppDataContext';

// Import components
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Meetings from './components/Meetings';
import StepWork from './components/StepWork';
import SponsorSponsee from './components/SponsorSponsee';
import LoadingScreen from './components/LoadingScreen';
import ErrorBoundary from './components/ErrorBoundary';

// Import utilities
import { calculateSpiritualFitnessScore } from './components/Dashboard';

// Create theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3b82f6',
    },
    background: {
      default: '#1a1a1a',
      paper: '#2d2d2d',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

type ViewType = 'dashboard' | 'profile' | 'meetings' | 'stepwork' | 'sponsorship' | 'sponsor' | 'sponsee';

function AppContent(): JSX.Element {
  const { state, addActivity, addMeeting, updateUser, updateTimeframe } = useAppData();
  const [currentView, setCurrentView] = React.useState<ViewType>('dashboard');

  // Show loading screen while initializing
  if (state.isLoading) {
    return <LoadingScreen status={state.databaseStatus} />;
  }

  // Show error if initialization failed
  if (state.error) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        color: '#ff6b6b' 
      }}>
        <h2>App Error</h2>
        <p>{state.error}</p>
        <p>Using fallback storage mode.</p>
      </div>
    );
  }

  // Filter activities by timeframe for current view
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
        userId: userId,
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

  // Handle saving new meeting
  async function handleSaveMeeting(newMeeting: any): Promise<any> {
    try {
      const savedMeeting = await addMeeting(newMeeting);
      console.log('[ App ] Meeting saved successfully:', savedMeeting?.id);
      return savedMeeting;
    } catch (error) {
      console.error('[ App ] Error saving meeting:', error);
      return null;
    }
  }

  // Handle updating user profile
  async function handleUpdateProfile(updates: any, options: any = {}): Promise<any> {
    try {
      const updatedUser = await updateUser(updates);
      console.log('[ App ] Profile updated successfully');
      
      if (options.redirectToDashboard) {
        setCurrentView('dashboard');
      }
      
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

  // Navigation handler
  function handleNavigation(view: ViewType) {
    setCurrentView(view);
  }

  // Render current view
  function renderCurrentView() {
    const filteredActivities = filterActivitiesByTimeframe(state.activities, state.currentTimeframe);

    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            user={state.user}
            activities={filteredActivities}
            currentTimeframe={state.currentTimeframe}
            spiritualFitness={state.spiritualFitness}
            onSaveActivity={handleSaveActivity}
            onTimeframeChange={handleTimeframeChange}
            onNavigate={handleNavigation}
          />
        );

      case 'profile':
        return (
          <Profile
            user={state.user}
            onUpdateProfile={handleUpdateProfile}
            onNavigate={handleNavigation}
          />
        );

      case 'meetings':
        return (
          <Meetings
            meetings={state.meetings}
            onSaveMeeting={handleSaveMeeting}
            onNavigate={handleNavigation}
          />
        );

      case 'stepwork':
        return (
          <StepWork
            activities={filteredActivities}
            onSaveActivity={handleSaveActivity}
            onNavigate={handleNavigation}
          />
        );

      case 'sponsorship':
      case 'sponsor':
      case 'sponsee':
        return (
          <SponsorSponsee
            user={state.user}
            currentView={currentView}
            onUpdateProfile={handleUpdateProfile}
            onNavigate={handleNavigation}
          />
        );

      default:
        return (
          <Dashboard
            user={state.user}
            activities={filteredActivities}
            currentTimeframe={state.currentTimeframe}
            spiritualFitness={state.spiritualFitness}
            onSaveActivity={handleSaveActivity}
            onTimeframeChange={handleTimeframeChange}
            onNavigate={handleNavigation}
          />
        );
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#1a1a1a',
      color: '#ffffff'
    }}>
      {renderCurrentView()}
    </div>
  );
}

function App(): JSX.Element {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppDataProvider>
          <AppContent />
        </AppDataProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;