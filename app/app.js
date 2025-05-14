// Main App Component - adapted from the original React Native components

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize the app
  const app = new SpiritualConditionTracker();
  
  // Make it available globally for debugging
  window.app = app;
});

/**
 * Main App class for Spiritual Condition Tracker
 */
class SpiritualConditionTracker {
  constructor() {
    // Initialize the app
    this.initialize();
  }
  
  /**
   * Initialize the application
   */
  async initialize() {
    try {
      // Initialize database
      await this.initializeDatabase();
      
      // Load user data
      await this.loadUserData();
      
      // Set up navigation
      this.setupNavigation();
      
      // Calculate spiritual fitness
      this.calculateSpiritualFitness();
      
      // Render the main dashboard
      this.navigateTo('dashboard');
      
      console.log('App initialized successfully');
    } catch (error) {
      console.error('Error initializing app:', error);
      this.renderErrorScreen('Failed to initialize the application. Please try again.');
    }
  }
  
  /**
   * Initialize the database
   */
  async initializeDatabase() {
    // Check if Database is already initialized
    if (!window.Database) {
      console.error('Database module not loaded');
      throw new Error('Database module not loaded');
    }
    
    try {
      // Initialize the database
      await window.Database.initDatabase();
      
      // Get all users
      const users = window.Database.userOperations.getAll();
      
      // If no users, create a default one
      if (!users || users.length === 0) {
        // Create default user
        const defaultUser = {
          name: 'John D.',
          sobrietyDate: '2020-01-01',
          homeGroup: 'Downtown Group',
          phone: '',
          email: '',
          privacySettings: {
            shareLocation: false,
            shareActivities: false
          }
        };
        
        window.Database.userOperations.create(defaultUser);
      }
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }
  
  /**
   * Load user data from the database
   */
  async loadUserData() {
    try {
      // Get all users (for simplicity, we'll use the first one)
      const users = window.Database.userOperations.getAll();
      
      if (users && users.length > 0) {
        this.user = users[0];
        console.log('User data loaded:', this.user);
        
        // Load activities for this user
        this.activities = window.Database.activityOperations.getAll({ 
          userId: this.user.id 
        });
        
        // Load meetings
        this.meetings = window.Database.meetingOperations.getAll();
      } else {
        throw new Error('No user found in database');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      throw error;
    }
  }
  
  /**
   * Calculate spiritual fitness score
   */
  calculateSpiritualFitness() {
    try {
      if (!this.user || !this.activities) {
        this.spiritualFitness = { score: 0 };
        return this.spiritualFitness;
      }
      
      // Calculate spiritual fitness
      this.spiritualFitness = window.Database.spiritualFitnessOperations.calculateAndSave(
        this.user.id, 
        this.activities
      );
      
      console.log('Spiritual fitness calculated:', this.spiritualFitness.score);
      
      return this.spiritualFitness;
    } catch (error) {
      console.error('Error calculating spiritual fitness:', error);
      this.spiritualFitness = { score: 0 };
      return this.spiritualFitness;
    }
  }
  
  /**
   * Set up navigation
   */
  setupNavigation() {
    // Create the bottom navigation (similar to React Native's TabNavigator)
    const navHTML = `
      <nav class="fixed bottom-0 left-0 right-0 bg-white flex justify-around py-3 shadow-md z-10">
        <a id="nav-dashboard" class="flex flex-col items-center text-blue-500 cursor-pointer">
          <i class="fa-solid fa-home text-lg mb-1"></i>
          <span class="text-xs">Home</span>
        </a>
        <a id="nav-activities" class="flex flex-col items-center text-gray-500 cursor-pointer">
          <i class="fa-solid fa-clipboard-list text-lg mb-1"></i>
          <span class="text-xs">Activities</span>
        </a>
        <a id="nav-meetings" class="flex flex-col items-center text-gray-500 cursor-pointer">
          <i class="fa-solid fa-users text-lg mb-1"></i>
          <span class="text-xs">Meetings</span>
        </a>
        <a id="nav-nearby" class="flex flex-col items-center text-gray-500 cursor-pointer">
          <i class="fa-solid fa-map-marker-alt text-lg mb-1"></i>
          <span class="text-xs">Nearby</span>
        </a>
        <a id="nav-settings" class="flex flex-col items-center text-gray-500 cursor-pointer">
          <i class="fa-solid fa-user text-lg mb-1"></i>
          <span class="text-xs">Profile</span>
        </a>
      </nav>
    `;
    
    // Add navigation to the DOM
    document.body.insertAdjacentHTML('beforeend', navHTML);
    
    // Add event listeners to navigation items
    document.getElementById('nav-dashboard').addEventListener('click', () => {
      this.navigateTo('dashboard');
    });
    
    document.getElementById('nav-activities').addEventListener('click', () => {
      this.navigateTo('activities');
    });
    
    document.getElementById('nav-meetings').addEventListener('click', () => {
      this.navigateTo('meetings');
    });
    
    document.getElementById('nav-nearby').addEventListener('click', () => {
      this.navigateTo('nearby');
    });
    
    document.getElementById('nav-settings').addEventListener('click', () => {
      this.navigateTo('settings');
    });
  }
  
  /**
   * Navigation handler (similar to React Navigation)
   */
  navigateTo(screenName) {
    // Update active tab
    document.querySelectorAll('.navItem').forEach(item => {
      item.classList.remove('active');
    });
    
    const activeNav = document.getElementById(`nav-${screenName}`);
    if (activeNav) {
      activeNav.classList.add('active');
    }
    
    // Render the appropriate screen
    switch (screenName) {
      case 'dashboard':
        if (window.renderDashboard) {
          window.renderDashboard(
            this.user, 
            this.spiritualFitness, 
            this.activities || [], 
            (screen) => this.navigateTo(screen)
          );
        } else {
          this.renderErrorScreen('Dashboard component not loaded');
        }
        break;
        
      case 'activities':
        // Placeholder for activities screen
        this.renderTemporaryScreen('Activities Screen', 'Track your recovery activities');
        break;
        
      case 'meetings':
        // Placeholder for meetings screen
        this.renderTemporaryScreen('Meetings Screen', 'Find and manage meetings');
        break;
        
      case 'nearby':
        // Placeholder for nearby screen
        this.renderTemporaryScreen('Nearby Members', 'Connect with other members');
        break;
        
      case 'settings':
        // Placeholder for settings screen
        this.renderTemporaryScreen('Profile Settings', 'Manage your account');
        break;
        
      case 'spiritual':
        // Show spiritual fitness details
        this.showSpiritualFitnessDetails();
        break;
        
      default:
        // Default to dashboard
        if (window.renderDashboard) {
          window.renderDashboard(
            this.user, 
            this.spiritualFitness, 
            this.activities || [], 
            (screen) => this.navigateTo(screen)
          );
        } else {
          this.renderErrorScreen('Dashboard component not loaded');
        }
    }
  }
  
  /**
   * Render a temporary screen (placeholder for other screens)
   */
  renderTemporaryScreen(title, subtitle) {
    const rootElement = document.getElementById('root');
    if (!rootElement) return;
    
    rootElement.innerHTML = `
      <div class="container">
        <div class="header">
          <h1 class="greeting">${title}</h1>
          <p class="subHeading">${subtitle}</p>
        </div>
        
        <div class="card">
          <div class="cardHeader">
            <i class="fas fa-code"></i>
            <h2 class="cardTitle">Coming Soon</h2>
          </div>
          <div class="activitySummary">
            <p class="activityText">
              This screen is under development. More features coming soon!
            </p>
          </div>
          <button class="cardButton" id="back-to-dashboard">Back to Dashboard</button>
        </div>
      </div>
    `;
    
    // Add event listener to the back button
    document.getElementById('back-to-dashboard').addEventListener('click', () => {
      this.navigateTo('dashboard');
    });
  }
  
  /**
   * Show spiritual fitness details
   */
  showSpiritualFitnessDetails() {
    const spiritualFitness = this.spiritualFitness || { score: 0, components: {}, activityCounts: {} };
    const components = spiritualFitness.components || {};
    const activityCounts = spiritualFitness.activityCounts || {};
    
    const rootElement = document.getElementById('root');
    if (!rootElement) return;
    
    rootElement.innerHTML = `
      <div class="container">
        <div class="header">
          <h1 class="greeting">Spiritual Fitness</h1>
          <p class="subHeading">Your recovery progress</p>
        </div>
        
        <div class="card fitnessCard">
          <div class="cardHeader fitnessHeader">
            <i class="fas fa-heart"></i>
            <h2 class="cardTitle">Your Score</h2>
          </div>
          
          <div class="scoreContainer">
            <div class="scoreCircle">
              <span class="scoreValue">${spiritualFitness.score.toFixed(2)}</span>
              <span class="scoreMax">/10</span>
            </div>
          </div>
          
          <div class="activitySummary">
            <p class="activityText">
              Based on your activities in the last 30 days
            </p>
          </div>
        </div>
        
        <!-- Score Breakdown -->
        <div class="card">
          <div class="cardHeader">
            <i class="fas fa-chart-bar"></i>
            <h2 class="cardTitle">Score Breakdown</h2>
          </div>
          
          <div style="margin: 15px 0;">
            <!-- Meeting Attendance -->
            <div style="margin-bottom: 15px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span style="font-weight: 600;">Meeting Attendance</span>
                <span style="color: #3498db; font-weight: 600;">${(components.meetings || 0).toFixed(1)}/3.0</span>
              </div>
              <div style="height: 8px; background-color: #ecf0f1; border-radius: 4px; overflow: hidden;">
                <div style="height: 100%; width: ${((components.meetings || 0) / 3) * 100}%; background-color: #3498db;"></div>
              </div>
              <p style="font-size: 0.9rem; color: #7f8c8d; margin-top: 5px;">
                ${activityCounts.meeting || 0} meetings in the last 30 days
              </p>
            </div>
            
            <!-- Prayer & Meditation -->
            <div style="margin-bottom: 15px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span style="font-weight: 600;">Prayer & Meditation</span>
                <span style="color: #3498db; font-weight: 600;">${(components.prayer || 0).toFixed(1)}/2.0</span>
              </div>
              <div style="height: 8px; background-color: #ecf0f1; border-radius: 4px; overflow: hidden;">
                <div style="height: 100%; width: ${((components.prayer || 0) / 2) * 100}%; background-color: #3498db;"></div>
              </div>
              <p style="font-size: 0.9rem; color: #7f8c8d; margin-top: 5px;">
                ${(activityCounts.prayer || 0) + (activityCounts.meditation || 0)} sessions in the last 30 days
              </p>
            </div>
            
            <!-- Other breakdown components would go here -->
          </div>
          
          <button class="cardButton" id="back-to-dashboard">Back to Dashboard</button>
        </div>
      </div>
    `;
    
    // Add event listener to the back button
    document.getElementById('back-to-dashboard').addEventListener('click', () => {
      this.navigateTo('dashboard');
    });
  }
  
  /**
   * Render an error screen
   */
  renderErrorScreen(message) {
    const rootElement = document.getElementById('root');
    if (!rootElement) return;
    
    rootElement.innerHTML = `
      <div class="errorContainer">
        <div>
          <i class="fas fa-exclamation-circle" style="font-size: 48px; color: #e74c3c; margin-bottom: 20px;"></i>
        </div>
        <h1 class="errorTitle">Something went wrong</h1>
        <p class="errorMessage">${message}</p>
        <button class="errorButton" id="reload-app">Reload App</button>
      </div>
    `;
    
    // Add event listener to the reload button
    document.getElementById('reload-app').addEventListener('click', () => {
      window.location.reload();
    });
  }
}

// Export the class
window.SpiritualConditionTracker = SpiritualConditionTracker;