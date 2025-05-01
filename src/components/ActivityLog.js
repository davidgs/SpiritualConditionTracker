import React, { useState } from 'react';
import ActivityForm from './ActivityForm';
import MeetingCheckIn from './MeetingCheckIn';

function ActivityLog({ setCurrentView }) {
  const [activeTab, setActiveTab] = useState('activity');
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <button 
          onClick={() => setCurrentView('dashboard')}
          className="mr-3 text-gray-600 hover:text-gray-800"
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <h2 className="text-2xl font-semibold text-gray-800">Log Your Recovery Activities</h2>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="flex border-b">
          <button
            className={`py-4 px-6 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'activity' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('activity')}
          >
            <i className="fa-solid fa-list-check mr-2"></i>
            Activity Log
          </button>
          <button
            className={`py-4 px-6 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'meeting' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('meeting')}
          >
            <i className="fa-solid fa-users mr-2"></i>
            Meeting Check-In
          </button>
        </div>
        
        <div className="p-6">
          {activeTab === 'activity' ? (
            <ActivityForm onSuccess={() => setCurrentView('dashboard')} />
          ) : (
            <MeetingCheckIn onSuccess={() => setCurrentView('dashboard')} />
          )}
        </div>
      </div>
      
      {/* Quick Activity Tips */}
      <div className="grid md:grid-cols-2 gap-4 mt-8">
        <div className="card bg-blue-50">
          <h3 className="text-lg font-medium mb-2 text-blue-800">Why Track Recovery?</h3>
          <p className="text-gray-700">
            Consistent tracking helps identify patterns in your recovery journey and reinforces positive habits. Regular activities contribute to greater spiritual fitness.
          </p>
        </div>
        
        <div className="card bg-green-50">
          <h3 className="text-lg font-medium mb-2 text-green-800">Activity Balance</h3>
          <p className="text-gray-700">
            A balanced recovery includes meetings, meditation, literature, connection with others, and service work. Try to incorporate multiple activities into your routine.
          </p>
        </div>
      </div>
      
      {/* Imagery */}
      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <div className="card overflow-hidden p-0">
          <img 
            src="https://images.unsplash.com/photo-1499728603263-13726abce5fd" 
            alt="Meditation practice" 
            className="w-full h-48 object-cover"
          />
        </div>
        <div className="card overflow-hidden p-0">
          <img 
            src="https://images.unsplash.com/photo-1528736189815-2cc50c5586f2" 
            alt="Reading literature" 
            className="w-full h-48 object-cover"
          />
        </div>
      </div>
    </div>
  );
}

export default ActivityLog;
