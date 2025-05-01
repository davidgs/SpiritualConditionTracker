import React, { useState } from 'react';

function Profile({ user, setUser, setCurrentView }) {
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    sobrietyDate: user?.sobrietyDate || '',
    homeGroup: user?.homeGroup || '',
    privacySettings: user?.privacySettings || {
      anonymousTracking: true,
      shareActivity: false,
      allowNotifications: true
    }
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        privacySettings: {
          ...prev.privacySettings,
          [name]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Update user in local storage
      const updatedUser = {
        ...user,
        ...formData
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
      
      // In a real app, we would save to the server here
      
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const calculateSobrietyDays = (sobrietyDate) => {
    if (!sobrietyDate) return null;
    
    const start = new Date(sobrietyDate);
    const today = new Date();
    const diffTime = Math.abs(today - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  const sobrietyDays = calculateSobrietyDays(formData.sobrietyDate);
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <button 
          onClick={() => setCurrentView('dashboard')}
          className="mr-3 text-gray-600 hover:text-gray-800"
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <h2 className="text-2xl font-semibold text-gray-800">Your Profile</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-800">Personal Information</h3>
              
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <i className="fa-solid fa-edit mr-1"></i> Edit
                </button>
              )}
            </div>
            
            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name (Optional)
                    </label>
                    <input
                      type="text"
                      id="displayName"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleChange}
                      placeholder="Your name or anonymous identifier"
                      className="input-field"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      This is only used within the app and is not shared.
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="sobrietyDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Sobriety Date (Optional)
                    </label>
                    <input
                      type="date"
                      id="sobrietyDate"
                      name="sobrietyDate"
                      value={formData.sobrietyDate}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="homeGroup" className="block text-sm font-medium text-gray-700 mb-1">
                      Home Group (Optional)
                    </label>
                    <input
                      type="text"
                      id="homeGroup"
                      name="homeGroup"
                      value={formData.homeGroup}
                      onChange={handleChange}
                      placeholder="Your primary AA meeting"
                      className="input-field"
                    />
                  </div>
                  
                  <div className="pt-4">
                    <h4 className="font-medium text-gray-700 mb-3">Privacy Settings</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="anonymousTracking"
                            name="anonymousTracking"
                            type="checkbox"
                            checked={formData.privacySettings.anonymousTracking}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="anonymousTracking" className="font-medium text-gray-700">Anonymous Tracking</label>
                          <p className="text-gray-500">Store data locally without personal identifiers</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="shareActivity"
                            name="shareActivity"
                            type="checkbox"
                            checked={formData.privacySettings.shareActivity}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="shareActivity" className="font-medium text-gray-700">Share Activity</label>
                          <p className="text-gray-500">Allow activity sharing with nearby app users (future feature)</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="allowNotifications"
                            name="allowNotifications"
                            type="checkbox"
                            checked={formData.privacySettings.allowNotifications}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="allowNotifications" className="font-medium text-gray-700">Activity Reminders</label>
                          <p className="text-gray-500">Receive gentle reminders about recovery activities</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn-secondary"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`btn-primary ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Display Name</h4>
                  <p className="mt-1 text-gray-800">
                    {formData.displayName || 'Anonymous User'}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Sobriety Date</h4>
                  <p className="mt-1 text-gray-800">
                    {formData.sobrietyDate ? new Date(formData.sobrietyDate).toLocaleDateString() : 'Not specified'}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Home Group</h4>
                  <p className="mt-1 text-gray-800">
                    {formData.homeGroup || 'Not specified'}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Privacy Settings</h4>
                  <ul className="mt-2 space-y-1 text-gray-600">
                    <li className="flex items-center">
                      <i className={`fa-solid fa-${formData.privacySettings.anonymousTracking ? 'check text-green-500' : 'times text-red-500'} mr-2`}></i>
                      Anonymous Tracking
                    </li>
                    <li className="flex items-center">
                      <i className={`fa-solid fa-${formData.privacySettings.shareActivity ? 'check text-green-500' : 'times text-red-500'} mr-2`}></i>
                      Share Activity with Nearby Users
                    </li>
                    <li className="flex items-center">
                      <i className={`fa-solid fa-${formData.privacySettings.allowNotifications ? 'check text-green-500' : 'times text-red-500'} mr-2`}></i>
                      Activity Reminders
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
          
          {/* Data Management */}
          <div className="card mt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Data Management</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-800">Export Your Data</h4>
                  <p className="text-sm text-gray-600">Download all your activity history</p>
                </div>
                <button 
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => {
                    // In a real app, this would generate and download the data
                    alert("Export functionality would be implemented here!");
                  }}
                >
                  <i className="fa-solid fa-download mr-1"></i> Export
                </button>
              </div>
              
              <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-800">Clear All Data</h4>
                  <p className="text-sm text-gray-600">Permanently delete all your activities</p>
                </div>
                <button 
                  className="text-red-600 hover:text-red-800"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete all your activity data? This cannot be undone.")) {
                      localStorage.removeItem('activities');
                      window.location.reload();
                    }
                  }}
                >
                  <i className="fa-solid fa-trash-alt mr-1"></i> Clear
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sidebar with Sobriety Counter and About */}
        <div className="md:col-span-1 space-y-6">
          {formData.sobrietyDate && (
            <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <h3 className="text-lg font-medium mb-3">Sobriety Counter</h3>
              <div className="text-center">
                <div className="text-4xl font-bold">{sobrietyDays}</div>
                <div className="text-sm opacity-90">Days of Sobriety</div>
                <div className="text-xs mt-2 opacity-80">
                  Since {new Date(formData.sobrietyDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
          
          <div className="card">
            <h3 className="text-lg font-medium text-gray-800 mb-3">About Recovery Tracker</h3>
            <p className="text-sm text-gray-600 mb-2">
              This app helps you track your recovery activities and gauge your spiritual fitness.
            </p>
            <p className="text-sm text-gray-600 mb-2">
              Your privacy is important—all data is stored locally on your device.
            </p>
            <p className="text-sm text-gray-600">
              Version 1.0.0
            </p>
          </div>
          
          <div className="card overflow-hidden p-0">
            <img 
              src="https://images.unsplash.com/photo-1606166187734-a4cb74079037" 
              alt="Meditation pose" 
              className="w-full h-48 object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
