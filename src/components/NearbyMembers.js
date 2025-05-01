import React, { useState, useEffect } from 'react';

function NearbyMembers({ userId, setCurrentView }) {
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [discoverable, setDiscoverable] = useState(true);
  const [searchRadius, setSearchRadius] = useState(1); // Default 1km radius

  // Get user's current location
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (error) => {
            reject(error);
          }
        );
      }
    });
  };

  // Fetch nearby users
  const fetchNearbyUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get current location
      const location = await getCurrentLocation();
      
      // Fetch nearby users from API
      const response = await fetch(
        `/api/nearby-users?lat=${location.lat}&lng=${location.lng}&userId=${userId}&radius=${searchRadius}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch nearby users');
      }
      
      const data = await response.json();
      setNearbyUsers(data);
    } catch (error) {
      console.error('Error fetching nearby users:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle discoverability status
  const toggleDiscoverability = async () => {
    try {
      const response = await fetch('/api/users/discovery-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          discoverable: !discoverable
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update discovery settings');
      }
      
      const data = await response.json();
      setDiscoverable(data.discoverable);
    } catch (error) {
      console.error('Error updating discoverability:', error);
      setError(error.message);
    }
  };

  // Fetch nearby users on component mount and when search radius changes
  useEffect(() => {
    fetchNearbyUsers();
    
    // Periodically update the nearby users list every 30 seconds
    const intervalId = setInterval(fetchNearbyUsers, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [userId, searchRadius]);

  // Calculate time since last seen
  const getTimeSince = (lastSeen) => {
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffMs = now - lastSeenDate;
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-800">Nearby AA Members</h2>
        <button 
          onClick={() => setCurrentView('dashboard')}
          className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Back to Dashboard
        </button>
      </div>
      
      <div className="mb-6 bg-white p-4 rounded shadow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Your Discoverability</h3>
            <p className="text-gray-600">
              {discoverable 
                ? 'Other AA members can see you on their nearby list' 
                : 'You are hidden from other AA members'}
            </p>
          </div>
          <div className="flex items-center">
            <span className="mr-2">{discoverable ? 'Visible' : 'Hidden'}</span>
            <button 
              onClick={toggleDiscoverability}
              className={`${
                discoverable 
                  ? 'bg-green-500 hover:bg-green-700' 
                  : 'bg-gray-500 hover:bg-gray-700'
              } text-white py-2 px-4 rounded-full w-16 h-8 flex items-center justify-center`}
            >
              <div 
                className={`transform transition-transform duration-300 ${
                  discoverable ? 'translate-x-2' : '-translate-x-2'
                }`}
              >
                {discoverable ? 'ON' : 'OFF'}
              </div>
            </button>
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-gray-700 mb-2">Search Radius (km)</label>
          <div className="flex items-center">
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={searchRadius}
              onChange={(e) => setSearchRadius(parseFloat(e.target.value))}
              className="w-full mr-4"
            />
            <span className="text-lg font-semibold">{searchRadius} km</span>
          </div>
        </div>
        
        <button 
          onClick={fetchNearbyUsers}
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
          disabled={isLoading}
        >
          {isLoading ? 'Searching...' : 'Refresh Search'}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded shadow p-4">
        <h3 className="text-xl font-semibold mb-4">
          {nearbyUsers.length === 0 
            ? 'No AA members found nearby' 
            : `Found ${nearbyUsers.length} nearby ${nearbyUsers.length === 1 ? 'member' : 'members'}`}
        </h3>
        
        {nearbyUsers.length > 0 && (
          <div className="space-y-4">
            {nearbyUsers.map(user => (
              <div key={user.id} className="border rounded p-4 hover:bg-blue-50">
                <div className="flex justify-between">
                  <div>
                    <h4 className="text-lg font-semibold">{user.name}</h4>
                    <p className="text-gray-600">
                      Sober since: {new Date(user.sobrietyDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Last seen: {getTimeSince(user.lastSeen)}
                    </p>
                  </div>
                  <div>
                    <a 
                      href={`tel:${user.phone}`}
                      className="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded inline-flex items-center"
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Call
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default NearbyMembers;