// SpiritualFitness component for displaying fitness score and details
import React from 'react';

interface SpiritualFitnessData {
  score: number;
  components: {
    meetings?: number;
    prayer?: number;
    reading?: number;
    service?: number;
    sponsorship?: number;
  };
  activityCounts: {
    meetings?: number;
    prayer?: number;
    reading?: number;
    service?: number;
    sponsorship?: number;
  };
}

interface SpiritualFitnessProps {
  setCurrentView: (view: string) => void;
  spiritualFitness: SpiritualFitnessData | null;
}

export default function SpiritualFitness({ setCurrentView, spiritualFitness }: SpiritualFitnessProps) {
  const components = spiritualFitness?.components || {};
  const activityCounts = spiritualFitness?.activityCounts || {};
  
  return (
    <div className="p-4 pb-20 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Spiritual Fitness</h2>
        <button 
          onClick={() => setCurrentView('dashboard')}
          className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          <i className="fa-solid fa-arrow-left mr-1"></i> Back
        </button>
      </div>
      
      {/* Score Card */}
      <div className="bg-blue-500 dark:bg-blue-700 text-white rounded-lg p-4 border border-blue-400 dark:border-blue-600">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Your Score</h3>
          <div className="text-5xl font-bold mb-2">{spiritualFitness?.score ? spiritualFitness.score.toFixed(2) : "0.00"}%</div>
          <p className="text-white text-opacity-80">Based on your activities in the last 30 days</p>
        </div>
      </div>
      
      {/* Score Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-100">Score Breakdown</h3>
        
        {/* Meeting Attendance */}
        <div className="mb-6">
          <div className="flex justify-between mb-1">
            <span className="font-medium text-gray-700 dark:text-gray-300">Meeting Attendance</span>
            <span className="text-blue-600 dark:text-blue-400 font-medium">{((components.meetings || 0) * 3).toFixed(1)}/3.0</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded overflow-hidden">
            <div className="h-full bg-blue-500" style={{width: `${Math.min(((components.meetings || 0) * 100), 100)}%`}}></div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {activityCounts.meeting || 0} meetings in the last 30 days
          </p>
        </div>
        
        {/* Prayer & Meditation */}
        <div className="mb-6">
          <div className="flex justify-between mb-1">
            <span className="font-medium text-gray-700 dark:text-gray-300">Prayer & Meditation</span>
            <span className="text-green-600 dark:text-green-400 font-medium">{((components.prayer || 0) * 2).toFixed(1)}/2.0</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded overflow-hidden">
            <div className="h-full bg-green-500" style={{width: `${Math.min(((components.prayer || 0) * 100), 100)}%`}}></div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {(activityCounts.prayer || 0) + (activityCounts.meditation || 0)} sessions in the last 30 days
          </p>
        </div>
        
        {/* Reading AA Literature */}
        <div className="mb-6">
          <div className="flex justify-between mb-1">
            <span className="font-medium text-gray-700 dark:text-gray-300">Reading AA Literature</span>
            <span className="text-purple-600 dark:text-purple-400 font-medium">{((components.reading || 0) * 1.5).toFixed(1)}/1.5</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded overflow-hidden">
            <div className="h-full bg-purple-500" style={{width: `${Math.min(((components.reading || 0) * 100), 100)}%`}}></div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {activityCounts.reading || 0} reading sessions in the last 30 days
          </p>
        </div>
        
        {/* Service Work */}
        <div className="mb-6">
          <div className="flex justify-between mb-1">
            <span className="font-medium text-gray-700 dark:text-gray-300">Service Work</span>
            <span className="text-yellow-600 dark:text-yellow-400 font-medium">{((components.service || 0) * 1.5).toFixed(1)}/1.5</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded overflow-hidden">
            <div className="h-full bg-yellow-500" style={{width: `${Math.min(((components.service || 0) * 100), 100)}%`}}></div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {activityCounts.service || 0} service activities in the last 30 days
          </p>
        </div>
        
        {/* Sponsorship */}
        <div className="mb-6">
          <div className="flex justify-between mb-1">
            <span className="font-medium text-gray-700 dark:text-gray-300">Sponsorship</span>
            <span className="text-red-600 dark:text-red-400 font-medium">{((components.sponsorship || 0) * 1).toFixed(1)}/1.0</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded overflow-hidden">
            <div className="h-full bg-red-500" style={{width: `${Math.min(((components.sponsorship || 0) * 100), 100)}%`}}></div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {activityCounts.sponsorship || 0} sponsor interactions in the last 30 days
          </p>
        </div>
      </div>
      
      {/* Recommendations */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-100">Recommendations</h3>
        <ul className="space-y-2">
          {(components.meetings || 0) < 0.7 ? (
            <li className="flex items-start">
              <i className="fa-solid fa-info-circle text-blue-500 dark:text-blue-400 mt-1 mr-2"></i>
              <span className="text-gray-700 dark:text-gray-300">Try to attend more meetings to strengthen your connection with the community.</span>
            </li>
          ) : null}
          
          {(components.prayer || 0) < 0.5 ? (
            <li className="flex items-start">
              <i className="fa-solid fa-info-circle text-blue-500 dark:text-blue-400 mt-1 mr-2"></i>
              <span className="text-gray-700 dark:text-gray-300">Consider adding more prayer and meditation to your routine.</span>
            </li>
          ) : null}
          
          {(components.reading || 0) < 0.7 ? (
            <li className="flex items-start">
              <i className="fa-solid fa-info-circle text-blue-500 dark:text-blue-400 mt-1 mr-2"></i>
              <span className="text-gray-700 dark:text-gray-300">Reading AA literature helps reinforce recovery principles.</span>
            </li>
          ) : null}
          
          {Object.values(components).every(v => v >= 0.5) ? (
            <li className="flex items-start">
              <i className="fa-solid fa-check-circle text-green-500 dark:text-green-400 mt-1 mr-2"></i>
              <span className="text-gray-700 dark:text-gray-300">You're maintaining a well-balanced recovery program. Keep up the great work!</span>
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );
};