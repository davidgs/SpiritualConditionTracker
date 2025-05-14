// NearbyMembers component for finding nearby AA members
import React from 'react';

export default function NearbyMembers({ setCurrentView, user, onUpdatePrivacy }) {
  const handlePrivacyChange = (setting, value) => {
    onUpdatePrivacy({ [setting]: value });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">Nearby AA Members</h2>
        <button 
          onClick={() => setCurrentView('dashboard')}
          className="text-blue-500 hover:text-blue-700"
        >
          <i className="fa-solid fa-arrow-left mr-1"></i> Back
        </button>
      </div>
      
      <div className="card">
        <div className="text-center p-6">
          <i className="fa-solid fa-location-dot text-blue-500 text-5xl mb-4"></i>
          <h3 className="text-xl font-medium mb-2">Find Members Nearby</h3>
          <p className="text-gray-600 mb-6">Connect with other AA members in your area for support and fellowship.</p>
          
          <button 
            onClick={() => alert('This feature is coming soon!')}
            className="btn-primary w-full"
          >
            <i className="fa-solid fa-broadcast-tower mr-2"></i>
            Start Discovery
          </button>
          
          <p className="text-xs text-gray-500 mt-4">
            Your privacy is protected. Your location and personal information are only shared when you choose to connect.
          </p>
        </div>
      </div>
      
      {/* Privacy Settings Card */}
      <div className="card">
        <h3 className="text-lg font-medium mb-4">Discovery Settings</h3>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-medium text-gray-800">Share My Location</p>
            <p className="text-sm text-gray-500">Allow nearby members to see you</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={user?.privacySettings?.shareLocation || false}
              onChange={(e) => handlePrivacyChange('shareLocation', e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-800">Share Activities</p>
            <p className="text-sm text-gray-500">Share recent activities with connections</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={user?.privacySettings?.shareActivities || false}
              onChange={(e) => handlePrivacyChange('shareActivities', e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </label>
        </div>
      </div>
      
      {/* Coming Soon Features */}
      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50">
        <h3 className="text-lg font-medium mb-3">Coming Soon</h3>
        <ul className="space-y-2">
          <li className="flex items-start">
            <i className="fa-solid fa-circle-check text-green-500 mt-1 mr-2"></i>
            <span>Proximity-based discovery of nearby members</span>
          </li>
          <li className="flex items-start">
            <i className="fa-solid fa-circle-check text-green-500 mt-1 mr-2"></i>
            <span>Secure, anonymous messaging</span>
          </li>
          <li className="flex items-start">
            <i className="fa-solid fa-circle-check text-green-500 mt-1 mr-2"></i>
            <span>Meeting sharing and invitations</span>
          </li>
        </ul>
      </div>
    </div>
  );
};