// Main App Component
function App() {
  const { useState, useEffect } = React;
  const [currentView, setCurrentView] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [spiritualFitness, setSpiritualFitness] = useState(0);

  // Load data when component mounts
  useEffect(() => {
    loadData();
  }, []);

  // Calculate spiritual fitness score when activities change
  useEffect(() => {
    if (activities.length > 0) {
      calculateSpiritualFitness();
    }
  }, [activities]);

  // Load data from the database
  async function loadData() {
    if (!window.db) {
      console.error('Database not initialized');
      return;
    }

    // Get user data
    const userData = window.db.getAll('user');
    setUser(userData);

    // Get activities
    const activitiesData = window.db.getAll('activities');
    setActivities(activitiesData);

    // Get meetings
    const meetingsData = window.db.getAll('meetings');
    setMeetings(meetingsData);

    // Calculate spiritual fitness
    calculateSpiritualFitness();
  }

  // Calculate spiritual fitness score
  function calculateSpiritualFitness() {
    if (!activities.length) return;

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Get activities from the last week
    const recentActivities = activities.filter(activity => {
      const activityDate = new Date(activity.date);
      return activityDate >= oneWeekAgo;
    });

    // Calculate score based on different activity types
    const totalScore = recentActivities.reduce((score, activity) => {
      switch (activity.type) {
        case 'prayer':
          return score + (activity.duration / 60) * 0.5; // 0.5 points per minute
        case 'meditation':
          return score + (activity.duration / 60) * 0.7; // 0.7 points per minute
        case 'literature':
          return score + (activity.duration / 60) * 0.4; // 0.4 points per minute
        case 'service':
          return score + activity.duration * 0.02; // 0.02 points per minute
        case 'sponsee':
          return score + activity.duration * 0.03; // 0.03 points per minute
        case 'meeting':
          return score + 2; // 2 points per meeting
        default:
          return score;
      }
    }, 0);

    // Round to 2 decimal places
    const fitness = parseFloat(totalScore.toFixed(2));
    setSpiritualFitness(fitness);
  }

  // Handle saving a new activity
  function handleSaveActivity(newActivity) {
    if (!window.db) {
      console.error('Database not initialized');
      return;
    }

    // Add activity to database
    const savedActivity = window.db.add('activities', newActivity);
    
    // Update activities state
    setActivities(prev => [...prev, savedActivity]);
    
    // Set view back to dashboard after saving
    setCurrentView('dashboard');
  }

  // Handle saving a new meeting
  function handleSaveMeeting(newMeeting) {
    if (!window.db) {
      console.error('Database not initialized');
      return;
    }

    // Add meeting to database
    const savedMeeting = window.db.add('meetings', newMeeting);
    
    // Update meetings state
    setMeetings(prev => [...prev, savedMeeting]);
    
    // Set view back to dashboard after saving
    setCurrentView('dashboard');
  }

  // Handle updating user profile
  function handleUpdateProfile(updates) {
    if (!window.db) {
      console.error('Database not initialized');
      return;
    }

    // Update user in database
    const updatedUser = window.db.update('user', user.id, updates);
    
    // Update user state
    setUser(updatedUser);
    
    // Set view back to dashboard after updating
    setCurrentView('dashboard');
  }

  // Handle updating privacy settings
  function handleUpdatePrivacy(changes) {
    if (!window.db || !user) {
      console.error('Database not initialized or user not loaded');
      return;
    }

    const currentSettings = user.privacySettings || {};
    const updatedSettings = { ...currentSettings, ...changes };
    
    // Update user with new privacy settings
    const updates = { privacySettings: updatedSettings };
    const updatedUser = window.db.update('user', user.id, updates);
    
    // Update user state
    setUser(updatedUser);
  }

  // Render current view based on navigation state
  function renderCurrentView() {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            setCurrentView={setCurrentView}
            user={user}
            activities={activities}
            spiritualFitness={spiritualFitness}
          />
        );
      case 'activity':
        return (
          <ActivityLog 
            setCurrentView={setCurrentView}
            onSave={handleSaveActivity}
          />
        );
      case 'history':
        return (
          <History
            setCurrentView={setCurrentView}
            activities={activities}
          />
        );
      case 'nearby':
        return (
          <NearbyMembers
            setCurrentView={setCurrentView}
            user={user}
            onUpdatePrivacy={handleUpdatePrivacy}
          />
        );
      case 'profile':
        return (
          <Profile
            setCurrentView={setCurrentView}
            user={user}
            onUpdate={handleUpdateProfile}
          />
        );
      default:
        return (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Page Not Found</h2>
            <p>The requested page does not exist.</p>
            <button 
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() => setCurrentView('dashboard')}
            >
              Return to Dashboard
            </button>
          </div>
        );
    }
  }

  return (
    <div className="app-container h-full flex flex-col">
      <div className="flex-grow overflow-auto">
        {renderCurrentView()}
      </div>
      <NavBar currentView={currentView} setCurrentView={setCurrentView} />
    </div>
  );
}

// Component is globally available via the function name