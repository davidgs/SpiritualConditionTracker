// Main React App for Spiritual Condition Tracker

// Wait for DOM & React to load
document.addEventListener('DOMContentLoaded', function() {
  // Initialize the app once the DOM is loaded
  console.log('DOM loaded, initializing app');
  initApp();
});

/**
 * Initialize the application
 */
async function initApp() {
  try {
    // Initialize database
    await initializeDatabase();
    
    // Create app container
    const App = () => {
      // State variables would go in a React component
      const [currentView, setCurrentView] = React.useState('dashboard');
      const [user, setUser] = React.useState(null);
      const [activities, setActivities] = React.useState([]);
      const [spiritualFitness, setSpiritualFitness] = React.useState({ score: 0 });
      const [loading, setLoading] = React.useState(true);
      
      // Use React's useEffect for data fetching
      React.useEffect(() => {
        loadUserData();
      }, []);
      
      // Load user data
      const loadUserData = async () => {
        try {
          // Get all users (use the first one)
          const users = window.Database.userOperations.getAll();
          
          if (users && users.length > 0) {
            const currentUser = users[0];
            console.log('User data loaded:', currentUser);
            setUser(currentUser);
            
            // Load activities for this user
            const userActivities = window.Database.activityOperations.getAll({ 
              userId: currentUser.id 
            }) || [];
            setActivities(userActivities);
            
            // Calculate spiritual fitness
            const fitness = window.Database.spiritualFitnessOperations.calculateAndSave(
              currentUser.id, 
              userActivities
            );
            setSpiritualFitness(fitness);
            
            setLoading(false);
          } else {
            throw new Error('No user found in database');
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          setLoading(false);
        }
      };
      
      // Update activity
      const handleActivitySave = (newActivity) => {
        try {
          // Add to database
          const savedActivity = window.Database.activityOperations.create({
            ...newActivity,
            userId: user.id
          });
          
          // Update state
          setActivities(prev => [...prev, savedActivity]);
          
          // Recalculate spiritual fitness
          const updatedFitness = window.Database.spiritualFitnessOperations.calculateAndSave(
            user.id, 
            [...activities, savedActivity]
          );
          setSpiritualFitness(updatedFitness);
          
          // Navigate back to dashboard
          setCurrentView('dashboard');
        } catch (error) {
          console.error('Error saving activity:', error);
          alert('There was an error saving your activity. Please try again.');
        }
      };
      
      // Update user profile
      const handleProfileUpdate = (updates) => {
        try {
          // Update in database
          window.Database.userOperations.update(user.id, updates);
          
          // Update in state
          setUser(prev => ({ ...prev, ...updates }));
          
          // Return to dashboard
          setCurrentView('dashboard');
        } catch (error) {
          console.error('Error updating profile:', error);
          alert('There was an error updating your profile. Please try again.');
        }
      };
      
      // Update privacy settings
      const handlePrivacyUpdate = (changes) => {
        try {
          const updatedSettings = {
            ...user.privacySettings,
            ...changes
          };
          
          // Update in database
          window.Database.userOperations.update(user.id, {
            privacySettings: updatedSettings
          });
          
          // Update in state
          setUser(prev => ({
            ...prev,
            privacySettings: updatedSettings
          }));
        } catch (error) {
          console.error('Error updating privacy settings:', error);
          alert('There was an error updating your privacy settings.');
        }
      };
      
      // Loading state
      if (loading) {
        return (
          <div className="flex justify-center items-center h-screen">
            <div className="text-center">
              <div className="spinner-border text-blue-500" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <p className="mt-2 text-gray-600">Loading your data...</p>
            </div>
          </div>
        );
      }
      
      // Render the appropriate view
      const renderView = () => {
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
                onSave={handleActivitySave}
              />
            );
          case 'fitness':
            return (
              <SpiritualFitness
                setCurrentView={setCurrentView}
                spiritualFitness={spiritualFitness}
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
                onUpdatePrivacy={handlePrivacyUpdate}
              />
            );
          case 'profile':
            return (
              <Profile
                setCurrentView={setCurrentView}
                user={user}
                onUpdate={handleProfileUpdate}
              />
            );
          default:
            return (
              <Dashboard 
                setCurrentView={setCurrentView} 
                user={user}
                activities={activities}
                spiritualFitness={spiritualFitness}
              />
            );
        }
      };
      
      return (
        <div className="app-container">
          {/* Main Content */}
          <div className="pb-16">
            {renderView()}
          </div>
          
          {/* Bottom Navigation */}
          <NavBar currentView={currentView} setCurrentView={setCurrentView} />
        </div>
      );
    };
    
    // Create storage adapter functions for the React components
    window.fetchRecentActivities = (limit) => {
      const users = window.Database.userOperations.getAll();
      if (!users || users.length === 0) return [];
      
      const user = users[0];
      let activities = window.Database.activityOperations.getAll({ userId: user.id }) || [];
      
      // Sort by date (newest first)
      activities = activities.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // Apply limit if provided
      if (limit && !isNaN(limit)) {
        activities = activities.slice(0, limit);
      }
      
      return activities;
    };
    
    window.fetchSpiritualFitness = () => {
      const users = window.Database.userOperations.getAll();
      if (!users || users.length === 0) return { score: 0 };
      
      const user = users[0];
      const activities = window.Database.activityOperations.getAll({ userId: user.id }) || [];
      
      return window.Database.spiritualFitnessOperations.calculateAndSave(user.id, activities);
    };
    
    // Render the React app
    ReactDOM.render(<App />, document.getElementById('root'));
    
  } catch (error) {
    console.error('Error initializing app:', error);
    showErrorScreen('Failed to initialize the application. Please try again later.');
  }
}

/**
 * Initialize the database
 */
async function initializeDatabase() {
  if (!window.Database) {
    throw new Error('Database module not loaded');
  }
  
  try {
    await window.Database.initDatabase();
    
    // Check if we have any users
    const users = window.Database.userOperations.getAll();
    
    if (!users || users.length === 0) {
      // Create a default user
      window.Database.userOperations.create({
        name: 'Test User',
        sobrietyDate: '2020-01-01',
        homeGroup: 'Thursday Night Group',
        phone: '555-123-4567',
        email: 'test@example.com',
        privacySettings: {
          shareLocation: false,
          shareActivities: true
        }
      });
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

/**
 * Show an error screen when something goes wrong
 */
function showErrorScreen(message) {
  const rootElement = document.getElementById('root');
  if (!rootElement) return;
  
  rootElement.innerHTML = `
    <div class="h-screen flex flex-col items-center justify-center p-4">
      <div class="text-center">
        <i class="fa-solid fa-exclamation-circle text-red-500 text-5xl mb-4"></i>
        <h1 class="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h1>
        <p class="text-gray-600 mb-6">${message}</p>
        <button id="reload-app" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">
          Reload Application
        </button>
      </div>
    </div>
  `;
  
  document.getElementById('reload-app')?.addEventListener('click', () => {
    window.location.reload();
  });
}

// Export the main init function globally
window.initApp = initApp;