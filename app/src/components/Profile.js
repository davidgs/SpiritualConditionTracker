import React, { useState, useEffect, useContext } from 'react';
import ThemeToggle from './ThemeToggle';
import { ThemeContext } from '../contexts/ThemeContext';

export default function Profile({ setCurrentView, user, onUpdate }) {
  const { theme } = useContext(ThemeContext);
  const darkMode = theme === 'dark';
  
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
    
    // Get the current state of the messaging toggle
    const allowMessages = document.getElementById('allowMessages').checked;
    
    // Create updates object with privacy settings
    const updates = {
      name,
      sobrietyDate: sobrietyDate ? new Date(sobrietyDate).toISOString() : '',
      homeGroup,
      sponsorName,
      sponsorPhone,
      privacySettings: {
        ...(user?.privacySettings || {}),
        allowMessages
      }
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
    
  // Determine whether to display years or days prominently
  const showYearsProminent = sobrietyYears >= 1;
  
  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Recovery Tracker</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Your personal profile</p>
        </div>
      </div>
      
      {sobrietyDate && (
        <div style={{
          backgroundColor: darkMode ? '#1f2937' : '#ffffff',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1.5rem',
          border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
          textAlign: 'left'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: darkMode ? '#d1d5db' : '#374151',
            marginBottom: '1rem',
            textAlign: 'left'
          }}>Sobriety Milestone</h3>
          
          {showYearsProminent ? (
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '10px' }}>
                <span style={{ 
                  fontSize: '2rem', 
                  fontWeight: 'bold', 
                  color: darkMode ? '#60a5fa' : '#3b82f6',
                  marginRight: '8px'
                }}>
                  {sobrietyYears.toFixed(2)}
                </span>
                <span style={{ 
                  fontSize: '1.25rem', 
                  color: darkMode ? '#9ca3af' : '#6b7280'
                }}>
                  years
                </span>
              </div>
              <div style={{ 
                fontSize: '1.25rem', 
                color: darkMode ? '#60a5fa' : '#3b82f6'
              }}>
                {formatNumber(sobrietyDays)} days
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '10px' }}>
                <span style={{ 
                  fontSize: '2rem', 
                  fontWeight: 'bold', 
                  color: darkMode ? '#60a5fa' : '#3b82f6',
                  marginRight: '8px'
                }}>
                  {formatNumber(sobrietyDays)}
                </span>
                <span style={{ 
                  fontSize: '1.25rem', 
                  color: darkMode ? '#9ca3af' : '#6b7280'
                }}>
                  days
                </span>
              </div>
              <div style={{ 
                fontSize: '1.25rem', 
                color: darkMode ? '#60a5fa' : '#3b82f6'
              }}>
                {sobrietyYears.toFixed(2)} years
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* App Settings */}
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">App Settings</h2>
        <div className="mb-4">
          <ThemeToggle />
        </div>
        
        <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Privacy & Messaging</h3>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-gray-700 dark:text-gray-300">
              Allow Messaging
            </label>
            <div className="relative inline-block w-10 mr-2 align-middle select-none">
              <input 
                type="checkbox" 
                name="allowMessages" 
                id="allowMessages" 
                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                defaultChecked={user?.privacySettings?.allowMessages !== false}
                onChange={(e) => {
                  // This will be handled in the form submit
                }}
                style={{
                  right: user?.privacySettings?.allowMessages !== false ? '0' : 'auto',
                  left: user?.privacySettings?.allowMessages !== false ? 'auto' : '0',
                  borderColor: user?.privacySettings?.allowMessages !== false ? '#4ade80' : '#f87171',
                  backgroundColor: user?.privacySettings?.allowMessages !== false ? '#4ade80' : '#f87171'
                }}
              />
              <label 
                htmlFor="allowMessages" 
                className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 dark:bg-gray-600 cursor-pointer"
              ></label>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            When enabled, your connections can send you secure messages.
          </p>
        </div>
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