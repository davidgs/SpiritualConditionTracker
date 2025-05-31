/**
 * App Data Context
 * Centralized state management for all app data
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import DatabaseService, { DatabaseStatus } from '../services/DatabaseService';
import type { User, Activity, Meeting } from '../types/database';

// State interface
export interface AppState {
  // Database status
  databaseStatus: DatabaseStatus;
  
  // User data
  user: User | null;
  currentUserId: string | number | null;
  
  // Activities
  activities: Activity[];
  currentTimeframe: number;
  
  // Meetings
  meetings: Meeting[];
  
  // Spiritual fitness
  spiritualFitness: number;
  
  // UI state
  isLoading: boolean;
  error: string | null;
}

// Action types
type AppAction =
  | { type: 'SET_DATABASE_STATUS'; payload: DatabaseStatus }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_CURRENT_USER_ID'; payload: string | number | null }
  | { type: 'SET_ACTIVITIES'; payload: Activity[] }
  | { type: 'ADD_ACTIVITY'; payload: Activity }
  | { type: 'SET_MEETINGS'; payload: Meeting[] }
  | { type: 'ADD_MEETING'; payload: Meeting }
  | { type: 'SET_SPIRITUAL_FITNESS'; payload: number }
  | { type: 'SET_TIMEFRAME'; payload: number }
  | { type: 'RESET_ALL_DATA' };

// Initial state
const initialState: AppState = {
  databaseStatus: 'initializing',
  user: null,
  currentUserId: null,
  activities: [],
  currentTimeframe: 30,
  meetings: [],
  spiritualFitness: 5,
  isLoading: true,
  error: null,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_DATABASE_STATUS':
      return { ...state, databaseStatus: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'SET_CURRENT_USER_ID':
      return { ...state, currentUserId: action.payload };
    
    case 'SET_ACTIVITIES':
      return { ...state, activities: action.payload };
    
    case 'ADD_ACTIVITY':
      return { ...state, activities: [...state.activities, action.payload] };
    
    case 'SET_MEETINGS':
      return { ...state, meetings: action.payload };
    
    case 'ADD_MEETING':
      return { ...state, meetings: [...state.meetings, action.payload] };
    
    case 'SET_SPIRITUAL_FITNESS':
      return { ...state, spiritualFitness: action.payload };
    
    case 'SET_TIMEFRAME':
      return { ...state, currentTimeframe: action.payload };
    
    case 'RESET_ALL_DATA':
      return {
        ...initialState,
        databaseStatus: state.databaseStatus,
      };
    
    default:
      return state;
  }
}

// Context type
interface AppDataContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  
  // Data operations
  loadUserData: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<User | null>;
  
  loadActivities: () => Promise<void>;
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Activity | null>;
  
  loadMeetings: () => Promise<void>;
  addMeeting: (meeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Meeting | null>;
  
  updateTimeframe: (timeframe: number) => Promise<void>;
  calculateSpiritualFitness: () => void;
  
  resetAllData: () => Promise<void>;
}

// Create context
const AppDataContext = createContext<AppDataContextType | null>(null);

// Provider component
export function AppDataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const databaseService = DatabaseService.getInstance();

  // Initialize database on mount
  useEffect(() => {
    const initializeApp = async () => {
      console.log('[ AppDataContext ] Initializing app...');
      
      try {
        // Subscribe to database status changes
        const unsubscribe = databaseService.onStatusChange((status) => {
          console.log('[ AppDataContext ] Database status changed:', status);
          dispatch({ type: 'SET_DATABASE_STATUS', payload: status });
          
          // Load data when database becomes ready
          if (status === 'ready' || status === 'fallback') {
            loadInitialData();
          }
        });

        // Initialize database
        await databaseService.initialize();

        // Cleanup subscription on unmount
        return unsubscribe;
      } catch (error) {
        console.error('[ AppDataContext ] App initialization failed:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize app' });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    const unsubscribe = initializeApp();
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Load initial data when database is ready
  const loadInitialData = async () => {
    try {
      console.log('[ AppDataContext ] Loading initial data...');
      
      await loadUserData();
      await loadActivities();
      await loadMeetings();
      
      dispatch({ type: 'SET_LOADING', payload: false });
      console.log('[ AppDataContext ] Initial data load complete');
    } catch (error) {
      console.error('[ AppDataContext ] Failed to load initial data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load app data' });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // User operations
  const loadUserData = async () => {
    try {
      const users = await databaseService.getAllUsers();
      console.log('[ AppDataContext ] Loaded users:', users.length);
      
      if (users.length > 0) {
        // Find user with most data
        let bestUser = users[0];
        for (const user of users) {
          const hasData = (user.name && user.name.trim()) || 
                         (user.phoneNumber && user.phoneNumber.trim()) || 
                         (user.email && user.email.trim()) ||
                         (user.sobrietyDate && user.sobrietyDate.trim());
          
          if (hasData) {
            bestUser = user;
            break;
          }
        }
        
        dispatch({ type: 'SET_USER', payload: bestUser });
        dispatch({ type: 'SET_CURRENT_USER_ID', payload: bestUser.id });
        console.log('[ AppDataContext ] User data loaded:', bestUser.id);
      } else {
        // Create default user
        const newUser = await databaseService.addUser({
          name: '',
          lastName: '',
          sobrietyDate: '',
          homeGroups: [],
          phoneNumber: '',
          email: '',
          privacySettings: {
            allowMessages: true,
            shareLastName: true
          },
          preferences: {
            use24HourFormat: false
          }
        });
        
        dispatch({ type: 'SET_USER', payload: newUser });
        dispatch({ type: 'SET_CURRENT_USER_ID', payload: newUser.id });
        console.log('[ AppDataContext ] Created default user:', newUser.id);
      }
    } catch (error) {
      console.error('[ AppDataContext ] Failed to load user data:', error);
      throw error;
    }
  };

  const updateUser = async (updates: Partial<User>): Promise<User | null> => {
    try {
      if (!state.currentUserId) {
        throw new Error('No current user ID');
      }
      
      const updatedUser = await databaseService.updateUser(state.currentUserId, updates);
      if (updatedUser) {
        dispatch({ type: 'SET_USER', payload: updatedUser });
        console.log('[ AppDataContext ] User updated:', updatedUser.id);
      }
      return updatedUser;
    } catch (error) {
      console.error('[ AppDataContext ] Failed to update user:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update user profile' });
      return null;
    }
  };

  // Activity operations
  const loadActivities = async () => {
    try {
      const activities = await databaseService.getAllActivities();
      
      // Filter by current timeframe
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - state.currentTimeframe);
      
      const filteredActivities = activities.filter(activity => {
        const activityDate = new Date(activity.date);
        return activityDate >= cutoffDate;
      });
      
      dispatch({ type: 'SET_ACTIVITIES', payload: filteredActivities });
      console.log('[ AppDataContext ] Activities loaded:', filteredActivities.length);
      
      // Calculate spiritual fitness
      calculateSpiritualFitness();
    } catch (error) {
      console.error('[ AppDataContext ] Failed to load activities:', error);
      throw error;
    }
  };

  const addActivity = async (activityData: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>): Promise<Activity | null> => {
    try {
      const newActivity = await databaseService.addActivity(activityData);
      dispatch({ type: 'ADD_ACTIVITY', payload: newActivity });
      
      // Recalculate spiritual fitness
      calculateSpiritualFitness();
      
      console.log('[ AppDataContext ] Activity added:', newActivity.id);
      return newActivity;
    } catch (error) {
      console.error('[ AppDataContext ] Failed to add activity:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save activity' });
      return null;
    }
  };

  // Meeting operations
  const loadMeetings = async () => {
    try {
      const meetings = await databaseService.getAllMeetings();
      dispatch({ type: 'SET_MEETINGS', payload: meetings });
      console.log('[ AppDataContext ] Meetings loaded:', meetings.length);
    } catch (error) {
      console.error('[ AppDataContext ] Failed to load meetings:', error);
      throw error;
    }
  };

  const addMeeting = async (meetingData: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>): Promise<Meeting | null> => {
    try {
      const newMeeting = await databaseService.addMeeting(meetingData);
      dispatch({ type: 'ADD_MEETING', payload: newMeeting });
      console.log('[ AppDataContext ] Meeting added:', newMeeting.id);
      return newMeeting;
    } catch (error) {
      console.error('[ AppDataContext ] Failed to add meeting:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save meeting' });
      return null;
    }
  };

  // Timeframe operations
  const updateTimeframe = async (timeframe: number) => {
    dispatch({ type: 'SET_TIMEFRAME', payload: timeframe });
    await loadActivities(); // Reload activities with new timeframe
  };

  // Spiritual fitness calculation
  const calculateSpiritualFitness = () => {
    const activities = state.activities;
    
    if (activities.length === 0) {
      dispatch({ type: 'SET_SPIRITUAL_FITNESS', payload: 5 });
      return;
    }

    // Calculate score based on activities
    let score = 5; // Base score
    
    // Weight different activity types
    const activityWeights: { [key: string]: number } = {
      'prayer': 15,
      'meditation': 15,
      'meeting': 20,
      'stepwork': 25,
      'service': 20,
      'reading': 10,
      'sponsorship': 25,
      'inventory': 20,
      'amends': 30
    };

    activities.forEach(activity => {
      const weight = activityWeights[activity.type] || 10;
      score += weight * 0.1; // Scale down the impact
    });

    // Cap at 100
    score = Math.min(score, 100);
    
    dispatch({ type: 'SET_SPIRITUAL_FITNESS', payload: Math.round(score * 100) / 100 });
  };

  // Reset all data
  const resetAllData = async () => {
    try {
      dispatch({ type: 'RESET_ALL_DATA' });
      // Could implement database clearing here if needed
      console.log('[ AppDataContext ] All data reset');
    } catch (error) {
      console.error('[ AppDataContext ] Failed to reset data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to reset data' });
    }
  };

  const contextValue: AppDataContextType = {
    state,
    dispatch,
    loadUserData,
    updateUser,
    loadActivities,
    addActivity,
    loadMeetings,
    addMeeting,
    updateTimeframe,
    calculateSpiritualFitness,
    resetAllData,
  };

  return (
    <AppDataContext.Provider value={contextValue}>
      {children}
    </AppDataContext.Provider>
  );
}

// Hook for using the context
export function useAppData(): AppDataContextType {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}

export default AppDataContext;