import React, { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';

export default function Profile({ setCurrentView, user, onUpdate }) {
  const [name, setName] = useState('');
  const [sobrietyDate, setSobrietyDate] = useState('');
  const [homeGroup, setHomeGroup] = useState('');
  const [sponsorName, setSponsorName] = useState('');
  const [sponsorPhone, setSponsorPhone] = useState('');
  const [errors, setErrors] = useState({});

  // Load user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setSobrietyDate(user.sobrietyDate ? user.sobrietyDate.split('T')[0] : '');
      setHomeGroup(user.homeGroup || '');
      setSponsorName(user.sponsorName || '');
      setSponsorPhone(user.sponsorPhone || '');
    }
  }, [user]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    if (!sobrietyDate) newErrors.sobrietyDate = 'Sobriety date is required';
    
    // If there are errors, show them and don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Create updates object
    const updates = {
      name,
      sobrietyDate: sobrietyDate ? new Date(sobrietyDate).toISOString() : '',
      homeGroup,
      sponsorName,
      sponsorPhone
    };
    
    // Update the profile
    onUpdate(updates);
  };

  // Calculate sobriety information if user has a sobriety date
  const sobrietyDays = sobrietyDate 
    ? window.db?.calculateSobrietyDays(sobrietyDate) || 0
    : 0;
  
  const sobrietyYears = sobrietyDate 
    ? window.db?.calculateSobrietyYears(sobrietyDate, 2) || 0
    : 0;

  return (
    <div className="p-4 pb-20 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Recovery Tracker</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Your personal profile</p>
        </div>
      </div>
      
      {sobrietyDate && (
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mb-6 border border-blue-100 dark:border-blue-800">
          <h2 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2">Sobriety Milestone</h2>
          <div className="flex justify-around">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{sobrietyDays}</div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Days</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{sobrietyYears}</div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Years</div>
            </div>
          </div>
        </div>
      )}
      
      {/* App Settings */}
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">App Settings</h2>
        <ThemeToggle />
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="space-y-2">
          <label className="block text-gray-700 dark:text-gray-300 font-medium">Your Name</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-gray-700 dark:text-gray-300 font-medium">Sobriety Date *</label>
          <input
            type="date"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            value={sobrietyDate}
            onChange={(e) => setSobrietyDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
          {errors.sobrietyDate && (
            <p className="text-red-500 text-sm">{errors.sobrietyDate}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <label className="block text-gray-700 dark:text-gray-300 font-medium">Home Group</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            placeholder="Enter your home group"
            value={homeGroup}
            onChange={(e) => setHomeGroup(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-gray-700 dark:text-gray-300 font-medium">Sponsor's Name</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            placeholder="Enter your sponsor's name"
            value={sponsorName}
            onChange={(e) => setSponsorName(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-gray-700 dark:text-gray-300 font-medium">Sponsor's Phone</label>
          <input
            type="tel"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            placeholder="Enter your sponsor's phone number"
            value={sponsorPhone}
            onChange={(e) => setSponsorPhone(e.target.value)}
          />
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white p-3 rounded font-medium transition-colors"
          >
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
}