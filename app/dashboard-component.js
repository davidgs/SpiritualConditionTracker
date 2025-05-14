// Dashboard component - adapted from the original React Native DashboardScreen.js

/**
 * Renders the dashboard screen with sobriety counter, spiritual fitness score,
 * and recent activities.
 * 
 * @param {Object} user - The user data
 * @param {Object} spiritualFitness - The spiritual fitness data
 * @param {Array} activities - The user's activities
 * @param {Function} onNavigate - Navigation function
 */
function renderDashboard(user, spiritualFitness, activities, onNavigate) {
  const rootElement = document.getElementById('root');
  if (!rootElement) return;
  
  // Calculate sobriety time
  const sobrietyDays = window.Database.calculateSobrietyDays(user.sobrietyDate);
  const sobrietyYears = window.Database.calculateSobrietyYears(user.sobrietyDate);
  
  // Get recent activities (last 30 days)
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);
  
  const recentActivities = activities.filter(activity => {
    const activityDate = new Date(activity.date);
    return activityDate >= thirtyDaysAgo;
  });
  
  // Format sobriety days with commas
  const formattedSobrietyDays = sobrietyDays.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  
  // Format fitness score
  const fitnessScore = spiritualFitness?.score || 0;
  const formattedScore = fitnessScore.toFixed(2);
  
  // Create HTML structure based on the original React Native component
  rootElement.innerHTML = `
    <div class="container">
      <div class="header">
        <h1 class="greeting">Hello, ${user?.name || 'Friend'}</h1>
        <p class="subHeading">Your Recovery Dashboard</p>
      </div>
      
      <!-- Sobriety Counter -->
      <div class="card sobrietyCard">
        <div class="cardHeader sobrietyHeader">
          <i class="fas fa-calendar-check"></i>
          <h2 class="cardTitle">Sobriety</h2>
        </div>
        <div class="sobrietyInfo">
          <div class="sobrietyMetric">
            <div class="sobrietyValue">${formattedSobrietyDays}</div>
            <div class="sobrietyLabel">Days</div>
          </div>
          <div class="sobrietySeparator"></div>
          <div class="sobrietyMetric">
            <div class="sobrietyValue">${sobrietyYears}</div>
            <div class="sobrietyLabel">Years</div>
          </div>
        </div>
        <button class="cardButton" id="update-sobriety-btn">Update Sobriety Date</button>
      </div>
      
      <!-- Spiritual Fitness Score -->
      <div class="card fitnessCard">
        <div class="cardHeader fitnessHeader">
          <i class="fas fa-heart"></i>
          <h2 class="cardTitle">Spiritual Fitness</h2>
        </div>
        <div class="scoreContainer">
          <div class="scoreCircle">
            <span class="scoreValue">${formattedScore}</span>
            <span class="scoreMax">/10</span>
          </div>
        </div>
        <button class="cardButton" id="view-fitness-btn">View Details</button>
      </div>
      
      <!-- Recovery Activities -->
      <div class="card activityCard">
        <div class="cardHeader activityHeader">
          <i class="fas fa-list-alt"></i>
          <h2 class="cardTitle">Recovery Activities</h2>
        </div>
        <div class="activitySummary">
          <p class="activityText">
            You've logged <span class="activityHighlight">${recentActivities.length}</span> recovery 
            activities in the last 30 days.
          </p>
        </div>
        <button class="cardButton" id="log-activity-btn">Log New Activity</button>
      </div>
      
      <!-- Quick Actions -->
      <div class="quickActions">
        <h2 class="sectionTitle">Quick Actions</h2>
        <div class="actionButtons">
          <button class="actionButton" id="find-meetings-btn">
            <i class="fas fa-users"></i>
            <span class="actionButtonText">Find Meetings</span>
          </button>
          
          <button class="actionButton" id="nearby-members-btn">
            <i class="fas fa-map-marker-alt"></i>
            <span class="actionButtonText">Nearby Members</span>
          </button>
          
          <button class="actionButton" id="track-progress-btn">
            <i class="fas fa-chart-line"></i>
            <span class="actionButtonText">Track Progress</span>
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Add event listeners (similar to the onPress handlers in React Native)
  document.getElementById('update-sobriety-btn').addEventListener('click', () => {
    onNavigate('settings');
  });
  
  document.getElementById('view-fitness-btn').addEventListener('click', () => {
    onNavigate('spiritual');
  });
  
  document.getElementById('log-activity-btn').addEventListener('click', () => {
    onNavigate('activities');
  });
  
  document.getElementById('find-meetings-btn').addEventListener('click', () => {
    onNavigate('meetings');
  });
  
  document.getElementById('nearby-members-btn').addEventListener('click', () => {
    onNavigate('nearby');
  });
  
  document.getElementById('track-progress-btn').addEventListener('click', () => {
    onNavigate('spiritual');
  });
}

// Export the function
window.renderDashboard = renderDashboard;