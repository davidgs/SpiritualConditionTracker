// Profile component for user profile management
import React from 'react';
import { calculateSobrietyDays, calculateSobrietyYears } from '../utils/calculations';

export default function Profile({ setCurrentView, user, onUpdate }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const updates = {
      name: formData.get('profile-name'),
      sobrietyDate: formData.get('profile-sobriety-date'),
      homeGroup: formData.get('profile-home-group'),
      phone: formData.get('profile-phone'),
      email: formData.get('profile-email'),
    };
    
    onUpdate(updates);
  };
  
  // Calculate sobriety stats if available
  const sobrietyDays = user?.sobrietyDate ? calculateSobrietyDays(user.sobrietyDate) : 0;
  const sobrietyYears = user?.sobrietyDate ? calculateSobrietyYears(user.sobrietyDate) : 0;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">Profile</h2>
        <button 
          onClick={() => setCurrentView('dashboard')}
          className="text-blue-500 hover:text-blue-700"
        >
          <i className="fa-solid fa-arrow-left mr-1"></i> Back
        </button>
      </div>
      
      {/* Profile Card */}
      <div className="card text-center">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fa-solid fa-user text-blue-500 text-4xl"></i>
        </div>
        <h3 className="text-xl font-semibold mb-1">{user?.name || 'User'}</h3>
        <p className="text-gray-500 mb-4">Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</p>
        
        <div className="flex justify-center space-x-8 mb-2">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">{sobrietyDays}</div>
            <div className="text-sm text-gray-500">Days</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">{sobrietyYears.toFixed(2)}</div>
            <div className="text-sm text-gray-500">Years</div>
          </div>
        </div>
        
        <p className="text-sm text-gray-500">
          Sober since {user?.sobrietyDate ? new Date(user.sobrietyDate).toLocaleDateString() : 'Not set'}
        </p>
      </div>
      
      {/* Profile Form */}
      <div className="card">
        <h3 className="text-lg font-medium mb-4">Personal Information</h3>
        
        <form id="profile-form" className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Name</label>
            <input 
              type="text" 
              name="profile-name" 
              defaultValue={user?.name || ''} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Sobriety Date</label>
            <input 
              type="date" 
              name="profile-sobriety-date" 
              defaultValue={user?.sobrietyDate || ''} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Home Group</label>
            <input 
              type="text" 
              name="profile-home-group" 
              defaultValue={user?.homeGroup || ''} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Phone</label>
            <input 
              type="tel" 
              name="profile-phone" 
              defaultValue={user?.phone || ''} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
            <input 
              type="email" 
              name="profile-email" 
              defaultValue={user?.email || ''} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
          >
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
};