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
    
  // Determine whether to display years or days prominently
  const showYearsProminent = sobrietyYears >= 1;
  
  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="p-4 pb-20 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Recovery Tracker</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Your personal profile</p>
        </div>
      </div>
      
      {sobrietyDate && (
        <div style={{
          backgroundColor: 'var(--color-bg-primary, #ffffff)',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1.5rem',
          border: '1px solid var(--color-border, #e5e7eb)'
        }} className="dark:bg-gray-800 dark:border-gray-700">
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: 'var(--color-text-heading, #374151)',
            marginBottom: '1rem',
            textAlign: 'left'
          }} className="dark:text-gray-300">Sobriety Milestone</h3>
          
          {showYearsProminent ? (
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '10px' }}>
                <span style={{ 
                  fontSize: '2rem', 
                  fontWeight: 'bold', 
                  color: '#3b82f6',
                  marginRight: '8px'
                }} className="dark:text-blue-400">
                  {sobrietyYears.toFixed(2)}
                </span>
                <span style={{ 
                  fontSize: '1.25rem', 
                  color: '#6b7280'
                }} className="dark:text-gray-400">
                  years
                </span>
              </div>
              <div style={{ 
                fontSize: '1.25rem', 
                color: '#3b82f6'
              }} className="dark:text-blue-400">
                {formatNumber(sobrietyDays)} days
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '10px' }}>
                <span style={{ 
                  fontSize: '2rem', 
                  fontWeight: 'bold', 
                  color: '#3b82f6',
                  marginRight: '8px'
                }} className="dark:text-blue-400">
                  {formatNumber(sobrietyDays)}
                </span>
                <span style={{ 
                  fontSize: '1.25rem', 
                  color: '#6b7280'
                }} className="dark:text-gray-400">
                  days
                </span>
              </div>
              <div style={{ 
                fontSize: '1.25rem', 
                color: '#3b82f6'
              }} className="dark:text-blue-400">
                {sobrietyYears.toFixed(2)} years
              </div>
            </div>
          )}
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