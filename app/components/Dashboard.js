import React from 'react';

// Utilities
import { calculateSobrietyDays, calculateSobrietyYears, formatNumberWithCommas } from '../utils/calculations';

function Dashboard({ user, spiritualFitness, recentActivities, onNavigate }) {
  // Format sobriety information
  const sobrietyDays = user?.sobrietyDate 
    ? calculateSobrietyDays(user.sobrietyDate) 
    : 0;
  
  const sobrietyYears = user?.sobrietyDate 
    ? calculateSobrietyYears(user.sobrietyDate) 
    : 0;
    
  // Format spiritual fitness score
  const fitnessScore = spiritualFitness?.score || 0;
  const formattedScore = fitnessScore.toFixed(2);
  
  // Get recent activity count
  const recentActivitiesCount = recentActivities?.length || 0;
  
  return (
    <div className="dashboard-container">
      <header>
        <h1>Hello, {user?.name || 'Friend'}</h1>
        <p className="subtitle">Your Recovery Dashboard</p>
      </header>
      
      {/* Sobriety Counter */}
      <div className="card sobriety-card">
        <div className="card-header">
          <i className="fas fa-calendar-check"></i>
          <h2>Sobriety</h2>
        </div>
        <div className="sobriety-info">
          <div className="sobriety-metric">
            <div className="sobriety-value">
              {formatNumberWithCommas(sobrietyDays)}
            </div>
            <div className="sobriety-label">Days</div>
          </div>
          <div className="sobriety-separator"></div>
          <div className="sobriety-metric">
            <div className="sobriety-value">{sobrietyYears}</div>
            <div className="sobriety-label">Years</div>
          </div>
        </div>
        <button 
          className="card-button"
          onClick={() => onNavigate('profile')}
        >
          Update Sobriety Date
        </button>
      </div>
      
      {/* Spiritual Fitness Score */}
      <div className="card fitness-card">
        <div className="card-header">
          <i className="fas fa-heart"></i>
          <h2>Spiritual Fitness</h2>
        </div>
        <div className="score-container">
          <div className="score-circle">
            <span className="score-value">{formattedScore}</span>
            <span className="score-max">/10</span>
          </div>
        </div>
        <button 
          className="card-button"
          onClick={() => onNavigate('spiritual')}
        >
          View Details
        </button>
      </div>
      
      {/* Recent Activity */}
      <div className="card activity-card">
        <div className="card-header">
          <i className="fas fa-list-alt"></i>
          <h2>Recovery Activities</h2>
        </div>
        <div className="activity-summary">
          <p className="activity-text">
            You've logged <strong className="activity-highlight">{recentActivitiesCount}</strong> recovery 
            activities in the last 30 days.
          </p>
        </div>
        <button 
          className="card-button"
          onClick={() => onNavigate('activities')}
        >
          Log New Activity
        </button>
      </div>
      
      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button 
            className="action-button"
            onClick={() => onNavigate('meetings')}
          >
            <i className="fas fa-users"></i>
            <span>Find Meetings</span>
          </button>
          
          <button 
            className="action-button"
            onClick={() => onNavigate('nearby')}
          >
            <i className="fas fa-map-marker-alt"></i>
            <span>Nearby Members</span>
          </button>
          
          <button 
            className="action-button"
            onClick={() => onNavigate('spiritual')}
          >
            <i className="fas fa-chart-line"></i>
            <span>Track Progress</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;