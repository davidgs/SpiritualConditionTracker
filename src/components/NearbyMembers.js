import React, { useState, useEffect } from 'react';

export default function NearbyMembers({ setCurrentView, user, onUpdatePrivacy }) {
  const [isDiscoverable, setIsDiscoverable] = useState(true);
  const [radius, setRadius] = useState(1);
  const [searchingNearby, setSearchingNearby] = useState(false);
  const [nearbyMembers, setNearbyMembers] = useState([]);
  
  // Load user privacy settings when component mounts or user changes
  useEffect(() => {
    if (user && user.privacySettings) {
      setIsDiscoverable(user.privacySettings.discoverable ?? true);
      setRadius(user.privacySettings.proximityRadius ?? 1);
    }
  }, [user]);
  
  // Handle toggling discoverable status
  const handleToggleDiscoverable = () => {
    const newValue = !isDiscoverable;
    setIsDiscoverable(newValue);
    onUpdatePrivacy({ discoverable: newValue });
  };
  
  // Handle radius change
  const handleRadiusChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    setRadius(newValue);
    onUpdatePrivacy({ proximityRadius: newValue });
  };
  
  // Simulate searching for nearby members
  const handleSearchNearby = () => {
    if (!isDiscoverable) {
      alert("You need to make yourself discoverable to find nearby members");
      return;
    }
    
    setSearchingNearby(true);
    setNearbyMembers([]);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Mock data - in a real app, this would come from an API or local discovery
      const mockNearbyMembers = [
        {
          id: 'nearby1',
          name: 'John D.',
          distance: 0.3,
          sobrietyYears: 5.2,
          homeGroup: 'Serenity Group'
        },
        {
          id: 'nearby2',
          name: 'Sarah M.',
          distance: 0.7,
          sobrietyYears: 1.8,
          homeGroup: 'New Beginnings'
        },
        {
          id: 'nearby3', 
          name: 'Mike R.',
          distance: 0.9,
          sobrietyYears: 10.5,
          homeGroup: 'Freedom Fellowship'
        }
      ];
      
      // Filter by radius
      const filtered = mockNearbyMembers.filter(member => member.distance <= radius);
      
      setNearbyMembers(filtered);
      setSearchingNearby(false);
    }, 2000);
  };
  
  // Format distance display
  const formatDistance = (distance) => {
    return distance === 1 ? '1 mile' : `${distance} miles`;
  };

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center mb-6">
        <button 
          className="mr-2 text-blue-500 dark:text-blue-400"
          onClick={() => setCurrentView('dashboard')}
        >
          <i className="fas fa-arrow-left"></i>
        </button>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Nearby Members</h1>
      </div>
      
      {/* Privacy Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Discovery Settings</h2>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-300">Make Me Discoverable</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Allow other AA members to find you nearby</p>
          </div>
          <div className="relative inline-block w-12 h-6">
            <input 
              type="checkbox" 
              className="opacity-0 w-0 h-0" 
              checked={isDiscoverable}
              onChange={handleToggleDiscoverable}
              id="discoverable-toggle"
            />
            <label 
              className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full ${isDiscoverable ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
              htmlFor="discoverable-toggle"
            >
              <span 
                className={`absolute left-1 bottom-1 bg-white dark:bg-gray-200 w-4 h-4 rounded-full transition-transform ${isDiscoverable ? 'transform translate-x-6' : ''}`}
              ></span>
            </label>
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Proximity Radius</h3>
          <select
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            value={radius}
            onChange={handleRadiusChange}
          >
            <option value="0.5">0.5 miles</option>
            <option value="1">1 mile</option>
            <option value="2">2 miles</option>
            <option value="5">5 miles</option>
            <option value="10">10 miles</option>
          </select>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Only show members within {formatDistance(radius)}
          </p>
        </div>
        
        <button
          className="w-full bg-blue-500 hover:bg-blue-600 text-white p-3 rounded font-medium transition-colors"
          onClick={handleSearchNearby}
          disabled={searchingNearby}
        >
          {searchingNearby ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Searching...
            </>
          ) : (
            <>
              <i className="fas fa-search mr-2"></i>
              Find Nearby Members
            </>
          )}
        </button>
      </div>
      
      {/* Nearby Members List */}
      {nearbyMembers.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold p-4 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">
            Members Near You
          </h2>
          
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {nearbyMembers.map(member => (
              <div key={member.id} className="p-4">
                <div className="flex items-center">
                  <div className="bg-blue-100 dark:bg-blue-900 h-12 w-12 rounded-full flex items-center justify-center mr-3">
                    <i className="fas fa-user text-blue-500 dark:text-blue-400"></i>
                  </div>
                  <div className="flex-grow">
                    <div className="font-medium text-gray-800 dark:text-gray-200">{member.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {member.sobrietyYears.toFixed(1)} years sober • {member.homeGroup}
                    </div>
                    <div className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                      {member.distance.toFixed(1)} miles away
                    </div>
                  </div>
                  <button className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded text-sm transition-colors">
                    Connect
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Empty State */}
      {!searchingNearby && nearbyMembers.length === 0 && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center border border-gray-200 dark:border-gray-600">
          <i className="fas fa-users text-gray-400 dark:text-gray-500 text-5xl mb-3"></i>
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No Members Found Yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Use the search button above to find AA members near your current location.
          </p>
        </div>
      )}
    </div>
  );
}