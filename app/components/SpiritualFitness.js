import React, { useState, useEffect, useRef } from 'react';
import { fetchSpiritualFitness, fetchRecentActivities } from '../utils/storage';
import { calculateSpiritualFitness } from '../utils/calculations';

function SpiritualFitness({ setCurrentView }) {
  const [spiritualFitness, setSpiritualFitness] = useState(null);
  const [activityBreakdown, setActivityBreakdown] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const chartRef = useRef(null);
  const breakdownChartRef = useRef(null);
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // Get spiritual fitness data
        const fitnessData = await fetchSpiritualFitness();
        setSpiritualFitness(fitnessData);
        
        // Get recent activities for breakdown
        const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
        const activities = await fetchRecentActivities(days);
        
        // Process activities for breakdown
        const breakdown = activities.reduce((acc, activity) => {
          if (!acc[activity.type]) {
            acc[activity.type] = 0;
          }
          acc[activity.type] += parseInt(activity.duration, 10) || 0;
          return acc;
        }, {});
        
        setActivityBreakdown(breakdown);
        
        // Wait for component to render
        setTimeout(() => {
          renderCharts(fitnessData, breakdown);
        }, 100);
      } catch (error) {
        console.error('Error loading spiritual fitness data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [timeRange]);
  
  const renderCharts = (fitnessData, breakdown) => {
    // Render main fitness chart
    if (chartRef.current && fitnessData) {
      const ctx = chartRef.current.getContext('2d');
      
      // Destroy previous chart if it exists
      if (chartRef.current.chart) {
        chartRef.current.chart.destroy();
      }
      
      // Create new chart
      chartRef.current.chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Spiritual Fitness', 'Room for Growth'],
          datasets: [{
            data: [fitnessData.score, 100 - fitnessData.score],
            backgroundColor: ['#4F86C6', '#E4E9F2'],
            borderWidth: 0,
            borderRadius: 5,
          }]
        },
        options: {
          cutout: '75%',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `${context.label}: ${context.raw}%`;
                }
              }
            }
          }
        }
      });
    }
    
    // Render activity breakdown chart
    if (breakdownChartRef.current && Object.keys(breakdown).length > 0) {
      const ctx = breakdownChartRef.current.getContext('2d');
      
      // Destroy previous chart if it exists
      if (breakdownChartRef.current.chart) {
        breakdownChartRef.current.chart.destroy();
      }
      
      // Define colors for different activity types
      const colorMap = {
        meeting: '#4F86C6',
        meditation: '#5BC0BE',
        reading: '#8B5CF6',
        sponsor: '#F59E0B',
        service: '#EF4444',
        other: '#6B7280'
      };
      
      // Prepare data for chart
      const labels = Object.keys(breakdown).map(type => {
        return type.charAt(0).toUpperCase() + type.slice(1);
      });
      
      const data = Object.values(breakdown);
      const colors = Object.keys(breakdown).map(type => colorMap[type] || '#6B7280');
      
      // Create new chart
      breakdownChartRef.current.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Minutes',
            data: data,
            backgroundColor: colors,
            borderWidth: 0,
            borderRadius: 4,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Minutes'
              }
            }
          }
        }
      });
    }
  };
  
  const getTips = (score) => {
    if (score >= 80) {
      return [
        "You're maintaining excellent spiritual fitness. Keep up the great work!",
        "Consider sharing your experience with newcomers in the program.",
        "Reflect on your journey and what practices have been most helpful."
      ];
    } else if (score >= 60) {
      return [
        "You're doing well. Try to maintain consistency in your recovery activities.",
        "Consider adding more variety to your spiritual practice.",
        "Don't forget to connect with your sponsor regularly."
      ];
    } else if (score >= 40) {
      return [
        "Try to increase your meeting attendance this week.",
        "Set aside specific times for meditation and prayer.",
        "Reading literature daily, even for short periods, can help."
      ];
    } else {
      return [
        "Focus on getting to meetings more consistently.",
        "Reach out to your sponsor or a trusted friend in the program.",
        "Small daily actions add up - even 5 minutes of reading or meditation helps."
      ];
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <button 
          onClick={() => setCurrentView('dashboard')}
          className="mr-3 text-gray-600 hover:text-gray-800"
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <h2 className="text-2xl font-semibold text-gray-800">Spiritual Fitness</h2>
      </div>
      
      {/* Time Range Selector */}
      <div className="card mb-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-800">Time Range</h3>
          <div className="flex space-x-2">
            <button 
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                timeRange === 'week' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Week
            </button>
            <button 
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                timeRange === 'month' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Month
            </button>
            <button 
              onClick={() => setTimeRange('quarter')}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                timeRange === 'quarter' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              3 Months
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Fitness Score */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col items-center justify-center">
            <div className="relative" style={{ height: '200px', width: '200px' }}>
              <canvas ref={chartRef}></canvas>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-4xl font-bold text-blue-600">
                  {spiritualFitness?.score || 0}%
                </span>
                <span className="text-sm text-gray-500">Spiritual Fitness</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">What This Means</h3>
            <p className="text-gray-600 mb-4">
              Your spiritual fitness score is calculated based on your recovery activities over the 
              {timeRange === 'week' ? ' past week' : timeRange === 'month' ? ' past month' : ' past 3 months'}.
              It considers the frequency, duration, and variety of your activities.
            </p>
            
            <h4 className="font-medium text-gray-700 mb-2">Suggestions for Improvement:</h4>
            <ul className="space-y-2">
              {getTips(spiritualFitness?.score || 0).map((tip, index) => (
                <li key={index} className="flex items-start">
                  <i className="fa-solid fa-circle-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-600">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Activity Breakdown */}
      <div className="card mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Activity Breakdown</h3>
        
        {Object.keys(activityBreakdown).length > 0 ? (
          <div>
            <div style={{ height: '250px' }}>
              <canvas ref={breakdownChartRef}></canvas>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
              {Object.entries(activityBreakdown).map(([type, minutes]) => (
                <div key={type} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-1">
                    <i className={`
                      ${type === 'meeting' ? 'fa-solid fa-users text-blue-600' :
                        type === 'meditation' ? 'fa-solid fa-brain text-teal-500' : 
                        type === 'reading' ? 'fa-solid fa-book text-purple-600' :
                        type === 'sponsor' ? 'fa-solid fa-handshake text-amber-500' :
                        type === 'service' ? 'fa-solid fa-hands-helping text-red-500' : 
                        'fa-solid fa-star text-gray-600'}
                        mr-2
                    `}></i>
                    <span className="font-medium capitalize">{type}</span>
                  </div>
                  <div className="text-2xl font-bold">{minutes} min</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">No activities logged for this time period.</p>
            <button
              onClick={() => setCurrentView('activity')}
              className="btn-primary"
            >
              Log Your First Activity
            </button>
          </div>
        )}
      </div>
      
      {/* Understanding Spiritual Fitness */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-800 mb-3">Understanding Spiritual Fitness</h3>
        <p className="text-gray-600 mb-4">
          In AA recovery, spiritual fitness refers to the state of your spiritual well-being. It's not about any specific religion 
          but rather your connection to a higher power as you understand it, your community, and your inner self.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">What Improves Spiritual Fitness</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <i className="fa-solid fa-check text-blue-600 mt-1 mr-2"></i>
                <span>Regular meeting attendance</span>
              </li>
              <li className="flex items-start">
                <i className="fa-solid fa-check text-blue-600 mt-1 mr-2"></i>
                <span>Daily prayer and meditation</span>
              </li>
              <li className="flex items-start">
                <i className="fa-solid fa-check text-blue-600 mt-1 mr-2"></i>
                <span>Working with others in recovery</span>
              </li>
              <li className="flex items-start">
                <i className="fa-solid fa-check text-blue-600 mt-1 mr-2"></i>
                <span>Reading and studying AA literature</span>
              </li>
              <li className="flex items-start">
                <i className="fa-solid fa-check text-blue-600 mt-1 mr-2"></i>
                <span>Performing service work</span>
              </li>
            </ul>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg">
            <h4 className="font-medium text-amber-800 mb-2">Signs of Low Spiritual Fitness</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <i className="fa-solid fa-exclamation text-amber-600 mt-1 mr-2"></i>
                <span>Restlessness, irritability, discontentment</span>
              </li>
              <li className="flex items-start">
                <i className="fa-solid fa-exclamation text-amber-600 mt-1 mr-2"></i>
                <span>Self-centered thinking</span>
              </li>
              <li className="flex items-start">
                <i className="fa-solid fa-exclamation text-amber-600 mt-1 mr-2"></i>
                <span>Isolation from the recovery community</span>
              </li>
              <li className="flex items-start">
                <i className="fa-solid fa-exclamation text-amber-600 mt-1 mr-2"></i>
                <span>Neglecting recovery practices</span>
              </li>
              <li className="flex items-start">
                <i className="fa-solid fa-exclamation text-amber-600 mt-1 mr-2"></i>
                <span>Difficulty handling life's challenges</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SpiritualFitness;
