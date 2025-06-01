import React, { useState, useRef, useEffect } from 'react';
import logoImg from '../assets/logo-small.png';
import { formatDateForDisplay } from '../utils/dateUtils';
import { useTheme } from '@mui/material/styles';
import ActivityList from './ActivityList';
import SpiritualFitnessModal from './SpiritualFitnessModal';
import LogActivityModal from './LogActivityModal';
import { useAppTheme } from '../contexts/MuiThemeProvider';
import { Paper, Box, Typography, IconButton, Button } from '@mui/material';
import { User, Activity, Meeting } from '../types/database';

interface DashboardProps {
  setCurrentView: (view: string) => void;
  user: User | null;
  activities: Activity[];
  meetings: Meeting[];
  onSave: (activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onSaveMeeting: (meeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onTimeframeChange: (timeframe: number) => void;
  currentTimeframe: number;
}

export default function Dashboard({ setCurrentView, user, activities, meetings = [], onSave, onSaveMeeting, onTimeframeChange, currentTimeframe }: DashboardProps) {
  // Get theme from MUI theme provider
  const { mode } = useAppTheme();
  const darkMode = mode === 'dark';
  
  // State for controlling modal visibility and score timeframe
  const [showScoreModal, setShowScoreModal] = useState<boolean>(false);
  const [showActivityModal, setShowActivityModal] = useState<boolean>(false);
  const [activityDaysFilter, setActivityDaysFilter] = useState<number>(7);
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>('all');
  // Use timeframe from props instead of local state
  const scoreTimeframe = currentTimeframe;
  const [spiritualFitness, setSpiritualFitness] = useState<number>(5);
  const [currentScore, setCurrentScore] = useState<number>(0);
  
  const modalRef = useRef(null);
  const buttonRef = useRef(null);
  
  // Calculate spiritual fitness score using proper millisecond-based filtering
  const calculateSpiritualFitnessScore = () => {
    // console.log('[ Dashboard.tsx ] calculateSpiritualFitnessScore with timeframe:', scoreTimeframe, 'days');
    
    // Base score
    const baseScore = 5;
    
    // Filter activities within the timeframe using millisecond calculation
    const now = new Date();
    const timeframeStartMs = now.getTime() - (scoreTimeframe * 24 * 60 * 60 * 1000);
    
    const recentActivities = activities.filter(activity => {
      if (!activity.date) {
        return false;
      }
      const activityDate = new Date(activity.date);
      return activityDate.getTime() >= timeframeStartMs;
    });
    
    // console.log('[ Dashboard.tsx ] Filtered', recentActivities.length, 'recent activities from', activities.length, 'total');
    
    if (recentActivities.length === 0) {
      const score = baseScore;
      setCurrentScore(score);
      setSpiritualFitness(score);
      return score;
    }
    
    // Calculate weighted activity points with action item scoring
    const weights = {
      meeting: 10,
      prayer: 8,
      meditation: 8,
      reading: 6,
      literature: 6,
      callSponsor: 5,
      callSponsee: 4,
      call: 5,
      service: 9,
      stepWork: 10,
      stepwork: 10,
      'action-item': 0.5  // Will be adjusted based on status
    };
    
    let totalActivityPoints = 0;
    const activityDays = new Set();
    
    recentActivities.forEach(activity => {
      // Track unique days
      const day = new Date(activity.date).toISOString().split('T')[0];
      activityDays.add(day);
      
      // Calculate points for this activity with action item logic
      let points;
      if (activity.type === 'action-item') {
        if (activity.location === 'completed') {
          points = 0.5; // Completed action items add points
        } else if (activity.location === 'deleted') {
          points = -0.5; // Deleted action items subtract points
        } else {
          points = 0; // Pending action items don't count
        }
      } else {
        points = weights[activity.type] || 2;
      }
      totalActivityPoints += points;
    });
    
    const activityPoints = Math.min(totalActivityPoints / 4, 40); // Scale down and cap at 40
    const consistencyPercentage = activityDays.size / scoreTimeframe;
    const consistencyPoints = consistencyPercentage * 40; // Up to 40 points
    
    // Total score (capped at 100, with decimal precision)
    const totalScore = Math.min(100, baseScore + activityPoints + consistencyPoints);
    const preciseScore = Math.round(totalScore * 100) / 100; // Round to 2 decimal places
    
    // console.log('[ Dashboard.tsx ] Calculation result:', preciseScore);
    
    setCurrentScore(preciseScore);
    setSpiritualFitness(preciseScore);
    return preciseScore;
  };

  // Calculate score when component mounts or activities change
  useEffect(() => {
    // console.log('[ Dashboard.tsx ] useEffect [activities] triggered with', activities.length, 'activities');
    calculateSpiritualFitnessScore();
  }, [activities]);

  // Effect to recalculate score when timeframe changes
  useEffect(() => {
    // console.log('[ Dashboard.tsx ] useEffect [scoreTimeframe] triggered with timeframe:', scoreTimeframe);
    calculateSpiritualFitnessScore();
  }, [scoreTimeframe]);

  // Format score to 2 decimal places for display
  const formattedScore: string = currentScore > 0 ? currentScore.toFixed(2) : '0.00';

  // Calculate sobriety days
  const calculateSobrietyDays = (): number => {
    if (!user?.sobrietyDate) return 0;
    const sobrietyDate = new Date(user.sobrietyDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - sobrietyDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleClickOutside = (event: any) => {
    if (modalRef.current && !modalRef.current.contains(event.target) && 
        buttonRef.current && !buttonRef.current.contains(event.target)) {
      setShowScoreModal(false);
    }
  };

  useEffect(() => {
    if (showScoreModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showScoreModal]);

  const handleTimeframeChange = (newTimeframe: number) => {
    // console.log('[ Dashboard.tsx ] Timeframe changed to:', newTimeframe);
    onTimeframeChange(newTimeframe);
  };

  // Format sobriety date for display
  const getSobrietyDateDisplay = () => {
    if (!user?.sobrietyDate) return 'Not Set';
    return formatDateForDisplay(user.sobrietyDate);
  };

  const getSobrietyDaysDisplay = () => {
    const days = calculateSobrietyDays();
    if (days === 0) return 'Not Set';
    if (days === 1) return '1 Day';
    return `${days} Days`;
  };

  return (
    <div className="container max-w-md mx-auto bg-white dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="pt-6 pb-4 px-4">
        <div className="flex items-center mb-4">
          <img src={logoImg} alt="Logo" className="w-8 h-8 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Recovery Dashboard
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          Welcome back, {user?.name || 'Friend'}
        </p>
      </div>

      {/* Sobriety Counter */}
      <div className="px-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              Sobriety Journey
            </h2>
            <IconButton
              size="small"
              onClick={() => setCurrentView('profile')}
              className="text-blue-600 dark:text-blue-400"
            >
              ✏️
            </IconButton>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {calculateSobrietyDays()}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                Days Clean
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-blue-700 dark:text-blue-300">
                Since
              </div>
              <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                {getSobrietyDateDisplay()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spiritual Fitness Score */}
      <div className="px-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-green-900 dark:text-green-100">
              Spiritual Fitness
            </h2>
            <button
              ref={buttonRef}
              onClick={() => setShowScoreModal(!showScoreModal)}
              className="text-green-600 dark:text-green-400 text-sm underline"
            >
              Details
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-green-900 dark:text-green-100">
              {formattedScore}
            </div>
            <div className="text-right">
              <div className="text-sm text-green-700 dark:text-green-300">
                out of 100
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">
                Last {scoreTimeframe} days
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="contained"
            onClick={() => setShowActivityModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3"
          >
            Log Activity
          </Button>
          <Button
            variant="outlined"
            onClick={() => setCurrentView('meetings')}
            className="border-blue-600 text-blue-600 py-3"
          >
            View Meetings
          </Button>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Recent Activities
        </h2>
        <ActivityList
          activities={activities}
          daysFilter={activityDaysFilter}
          typeFilter={activityTypeFilter}
          onDaysFilterChange={setActivityDaysFilter}
          onTypeFilterChange={setActivityTypeFilter}
          darkMode={darkMode}
        />
      </div>

      {/* Spiritual Fitness Modal */}
      {showScoreModal && (
        <SpiritualFitnessModal
          ref={modalRef}
          score={currentScore}
          timeframe={scoreTimeframe}
          onTimeframeChange={handleTimeframeChange}
          onClose={() => setShowScoreModal(false)}
          darkMode={darkMode}
        />
      )}

      {/* Log Activity Modal */}
      {showActivityModal && (
        <LogActivityModal
          onClose={() => setShowActivityModal(false)}
          onSave={onSave}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}