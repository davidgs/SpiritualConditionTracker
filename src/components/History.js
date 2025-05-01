import React, { useState, useEffect } from 'react';
import { fetchAllActivities, deleteActivity } from '../utils/storage';

function History({ setCurrentView }) {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all',
    dateRange: 'all',
    search: '',
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  useEffect(() => {
    const loadActivities = async () => {
      setIsLoading(true);
      
      try {
        const allActivities = await fetchAllActivities();
        // Sort by date, newest first
        allActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setActivities(allActivities);
        applyFilters(allActivities, filters);
      } catch (error) {
        console.error('Error loading activities:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadActivities();
  }, []);
  
  useEffect(() => {
    applyFilters(activities, filters);
  }, [filters, activities]);
  
  const applyFilters = (activities, currentFilters) => {
    let result = [...activities];
    
    // Filter by type
    if (currentFilters.type !== 'all') {
      result = result.filter(activity => activity.type === currentFilters.type);
    }
    
    // Filter by date range
    const today = new Date();
    const dateFilters = {
      'week': new Date(today.setDate(today.getDate() - 7)),
      'month': new Date(today.setMonth(today.getMonth() - 1)),
      'quarter': new Date(today.setMonth(today.getMonth() - 3)),
    };
    
    if (currentFilters.dateRange !== 'all' && dateFilters[currentFilters.dateRange]) {
      const dateLimit = dateFilters[currentFilters.dateRange];
      result = result.filter(activity => new Date(activity.date) >= dateLimit);
    }
    
    // Filter by search term
    if (currentFilters.search.trim() !== '') {
      const searchTerm = currentFilters.search.toLowerCase();
      result = result.filter(activity => 
        (activity.name && activity.name.toLowerCase().includes(searchTerm)) ||
        (activity.notes && activity.notes.toLowerCase().includes(searchTerm)) ||
        (activity.location && activity.location.toLowerCase().includes(searchTerm))
      );
    }
    
    setFilteredActivities(result);
  };
  
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleDeleteActivity = async (id) => {
    try {
      await deleteActivity(id);
      
      // Update local state after successful deletion
      const updatedActivities = activities.filter(activity => activity.id !== id);
      setActivities(updatedActivities);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting activity:', error);
      alert('Failed to delete activity. Please try again.');
    }
  };
  
  const renderActivityType = (type) => {
    const icons = {
      'meeting': <i className="fa-solid fa-users text-blue-600"></i>,
      'meditation': <i className="fa-solid fa-brain text-green-600"></i>,
      'reading': <i className="fa-solid fa-book text-purple-600"></i>,
      'sponsor': <i className="fa-solid fa-handshake text-yellow-600"></i>,
      'service': <i className="fa-solid fa-hands-helping text-red-600"></i>,
      'other': <i className="fa-solid fa-star text-gray-600"></i>,
    };
    
    return (
      <div className="flex items-center">
        {icons[type] || <i className="fa-solid fa-star text-gray-600"></i>}
        <span className="ml-2 capitalize">{type}</span>
      </div>
    );
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
        <h2 className="text-2xl font-semibold text-gray-800">Activity History</h2>
      </div>
      
      {/* Filters */}
      <div className="card mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Activity Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="input-field"
            >
              <option value="all">All Activities</option>
              <option value="meeting">Meetings</option>
              <option value="meditation">Meditation</option>
              <option value="reading">Reading</option>
              <option value="sponsor">Sponsor/Sponsee</option>
              <option value="service">Service Work</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="input-field"
            >
              <option value="all">All Time</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 3 Months</option>
            </select>
          </div>
          
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search by name, notes..."
                className="input-field pl-10"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <i className="fa-solid fa-search text-gray-400"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Activities List */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          {filteredActivities.length} {filteredActivities.length === 1 ? 'Activity' : 'Activities'} Found
        </h3>
        
        {filteredActivities.length > 0 ? (
          <div className="space-y-4">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium text-gray-800">
                      {activity.name || `${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} Activity`}
                    </div>
                    <div className="text-sm text-gray-500 mb-2">
                      {new Date(activity.date).toLocaleDateString()} at {new Date(activity.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      {activity.duration && ` · ${activity.duration} minutes`}
                    </div>
                    
                    <div className="flex items-center space-x-3 text-sm">
                      <span className="px-2 py-1 bg-gray-100 rounded-full">
                        {renderActivityType(activity.type)}
                      </span>
                      
                      {activity.location && (
                        <span className="text-gray-600">
                          <i className="fa-solid fa-location-dot mr-1"></i> 
                          {activity.location}
                        </span>
                      )}
                    </div>
                    
                    {activity.notes && (
                      <div className="mt-2 text-gray-600 text-sm">
                        <p>{activity.notes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    {deleteConfirm === activity.id ? (
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleDeleteActivity(activity.id)}
                          className="text-xs text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="text-xs text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(activity.id)}
                        className="text-gray-400 hover:text-red-500"
                        aria-label="Delete activity"
                      >
                        <i className="fa-solid fa-trash-alt"></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <i className="fa-solid fa-calendar-times text-gray-400 text-4xl mb-3"></i>
            <p className="text-gray-500 mb-2">No activities found matching your filters</p>
            <button 
              onClick={() => setFilters({ type: 'all', dateRange: 'all', search: '' })}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
      
      {/* Export Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => {
            // In a real app, this would create and download a file
            alert("Export functionality would be implemented here!");
          }}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <i className="fa-solid fa-download mr-2"></i>
          Export Activity History
        </button>
      </div>
    </div>
  );
}

export default History;
