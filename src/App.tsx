/**
 * Simple App Component for Testing
 */

import React from 'react';
import { AppDataProvider, useAppData } from './contexts/AppDataContext';

function AppContent() {
  const { state } = useAppData();

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

  // Show app content
  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#1a1a1a',
      color: '#ffffff',
      padding: '20px'
    }}>
      <h1>Recovery App</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Database Status: {state.databaseStatus}</h3>
      </div>

      {state.user && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#2d2d2d', borderRadius: '8px' }}>
          <h3>User Profile</h3>
          <p><strong>Name:</strong> {state.user.name || 'Not set'}</p>
          <p><strong>Last Name:</strong> {state.user.lastName || 'Not set'}</p>
          <p><strong>Phone:</strong> {state.user.phoneNumber || 'Not set'}</p>
          <p><strong>Email:</strong> {state.user.email || 'Not set'}</p>
          <p><strong>Sobriety Date:</strong> {state.user.sobrietyDate || 'Not set'}</p>
        </div>
      )}

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#2d2d2d', borderRadius: '8px' }}>
        <h3>Activities ({state.activities.length})</h3>
        {state.activities.length > 0 ? (
          state.activities.map((activity, index) => (
            <div key={activity.id || index} style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#3d3d3d', borderRadius: '4px' }}>
              <p><strong>Type:</strong> {activity.type}</p>
              <p><strong>Date:</strong> {activity.date}</p>
              {activity.notes && <p><strong>Notes:</strong> {activity.notes}</p>}
            </div>
          ))
        ) : (
          <p>No activities found</p>
        )}
      </div>

      <div style={{ padding: '15px', backgroundColor: '#2d2d2d', borderRadius: '8px' }}>
        <h3>Meetings ({state.meetings.length})</h3>
        {state.meetings.length > 0 ? (
          state.meetings.map((meeting, index) => (
            <div key={meeting.id || index} style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#3d3d3d', borderRadius: '4px' }}>
              <p><strong>Name:</strong> {meeting.name}</p>
              <p><strong>Location:</strong> {meeting.location}</p>
              <p><strong>Time:</strong> {meeting.time}</p>
            </div>
          ))
        ) : (
          <p>No meetings found</p>
        )}
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', opacity: 0.7 }}>
        <p>Spiritual Fitness Score: {state.spiritualFitness}</p>
        <p>Current Timeframe: {state.currentTimeframe} days</p>
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