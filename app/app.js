// Main React App for Spiritual Condition Tracker

// Wait for DOM & React to load
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing app');
  initApp();
});

/**
 * Initialize the application
 */
async function initApp() {
  try {
    console.log('Initializing app...');
    // Initialize database
    await initDatabase();
    
    // Simple React App Component
    function App() {
      const { useState, useEffect } = React;
      
      // State variables
      const [currentView, setCurrentView] = useState('dashboard');
      const [user, setUser] = useState(null);
      const [activities, setActivities] = useState([]);
      const [spiritualFitness, setSpiritualFitness] = useState({ score: 0 });
      const [loading, setLoading] = useState(true);
      
      // Load data on component mount
      useEffect(() => {
        console.log('App component mounted, loading data...');
        loadData();
      }, []);
      
      // Load all user data
      async function loadData() {
        try {
          // Get user
          const users = window.Database.userOperations.getAll();
          if (users && users.length > 0) {
            const currentUser = users[0];
            setUser(currentUser);
            
            // Get activities
            const userActivities = window.Database.activityOperations.getAll({ 
              userId: currentUser.id 
            }) || [];
            setActivities(userActivities);
            
            // Calculate fitness
            const fitness = window.Database.spiritualFitnessOperations.calculateAndSave(
              currentUser.id, 
              userActivities
            );
            setSpiritualFitness(fitness);
          } else {
            console.error('No user found');
          }
        } catch (error) {
          console.error('Error loading data:', error);
        } finally {
          setLoading(false);
        }
      }
      
      // Handler for saving new activities
      function handleSaveActivity(newActivity) {
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
        }
      }
      
      // Handler for updating user profile
      function handleUpdateProfile(updates) {
        try {
          // Update in database
          window.Database.userOperations.update(user.id, updates);
          
          // Update state
          setUser(prev => ({ ...prev, ...updates }));
          
          // Navigate back to dashboard
          setCurrentView('dashboard');
        } catch (error) {
          console.error('Error updating profile:', error);
        }
      }
      
      // Handler for updating privacy settings
      function handleUpdatePrivacy(changes) {
        try {
          const updatedSettings = {
            ...user.privacySettings,
            ...changes
          };
          
          // Update in database
          window.Database.userOperations.update(user.id, {
            privacySettings: updatedSettings
          });
          
          // Update state
          setUser(prev => ({
            ...prev,
            privacySettings: updatedSettings
          }));
        } catch (error) {
          console.error('Error updating privacy settings:', error);
        }
      }
      
      // Loading screen
      if (loading) {
        return (
          <div className="flex justify-center items-center h-screen">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading your data...</p>
            </div>
          </div>
        );
      }
      
      // Render the main view
      return (
        <div className="app-container">
          {/* Main Content Area */}
          <div className="pb-16">
            {currentView === 'dashboard' && (
              <window.Dashboard 
                setCurrentView={setCurrentView} 
                user={user}
                activities={activities}
                spiritualFitness={spiritualFitness}
              />
            )}
            
            {currentView === 'activity' && (
              <window.ActivityLog
                setCurrentView={setCurrentView}
                onSave={handleSaveActivity}
              />
            )}
            
            {currentView === 'fitness' && (
              <window.SpiritualFitness
                setCurrentView={setCurrentView}
                spiritualFitness={spiritualFitness}
              />
            )}
            
            {currentView === 'history' && (
              <window.History
                setCurrentView={setCurrentView}
                activities={activities}
              />
            )}
            
            {currentView === 'nearby' && (
              <window.NearbyMembers
                setCurrentView={setCurrentView}
                user={user}
                onUpdatePrivacy={handleUpdatePrivacy}
              />
            )}
            
            {currentView === 'profile' && (
              <window.Profile
                setCurrentView={setCurrentView}
                user={user}
                onUpdate={handleUpdateProfile}
              />
            )}
          </div>
          
          {/* Bottom Navigation */}
          <window.NavBar currentView={currentView} setCurrentView={setCurrentView} />
        </div>
      );
    }
    
    // Render the React app
    ReactDOM.render(
      <App />,
      document.getElementById('root')
    );
    
  } catch (error) {
    console.error('Error initializing app:', error);
    showError('Failed to initialize the application. Please try again later.');
  }
}

/**
 * Initialize the database
 */
async function initDatabase() {
  console.log('Initializing database...');
  
  if (!window.Database) {
    throw new Error('Database module not loaded');
  }
  
  try {
    await window.Database.initDatabase();
    
    // Check if we have any users
    const users = window.Database.userOperations.getAll();
    
    if (!users || users.length === 0) {
      console.log('Creating default user...');
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
    
    console.log('Database initialization complete');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

/**
 * Show an error message
 */
function showError(message) {
  const rootElement = document.getElementById('root');
  if (!rootElement) return;
  
  rootElement.innerHTML = `
    <div class="h-screen flex flex-col items-center justify-center p-4">
      <div class="text-center">
        <i class="fa-solid fa-exclamation-circle text-red-500 text-5xl mb-4"></i>
        <h1 class="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h1>
        <p class="text-gray-600 mb-6">${message}</p>
        <button onclick="window.location.reload()" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">
          Reload Application
        </button>
      </div>
    </div>
  `;
}

// Make the init function available globally
window.initApp = initApp;