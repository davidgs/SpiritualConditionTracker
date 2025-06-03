/**
 * App Data Context
 * Centralized state management for all app data
 */

import React, { createContext, useContext, useReducer, useEffect, useState, ReactNode } from 'react';
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
  | { type: 'UPDATE_MEETING'; payload: { id: string | number; data: Partial<Meeting> } }
  | { type: 'DELETE_MEETING'; payload: string | number }
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
    
    case 'UPDATE_MEETING':
      return {
        ...state,
        meetings: state.meetings.map(meeting => 
          meeting.id === action.payload.id 
            ? { ...meeting, ...action.payload.data, updatedAt: new Date().toISOString() }
            : meeting
        )
      };
    
    case 'DELETE_MEETING':
      return { 
        ...state, 
        meetings: state.meetings.filter(meeting => meeting.id !== action.payload) 
      };
    
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
  getActivitiesForTimeframe: (timeframe: number) => Promise<Activity[]>;
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Activity | null>;
  
  loadMeetings: () => Promise<void>;
  addMeeting: (meeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Meeting | null>;
  updateMeeting: (meetingId: string | number, updates: Partial<Meeting>) => Promise<Meeting | null>;
  deleteMeeting: (meetingId: string | number) => Promise<boolean>;
  
  updateTimeframe: (timeframe: number) => Promise<void>;
  calculateSpiritualFitness: () => Promise<void>;
  
  resetAllData: () => Promise<void>;
}

// Create context
const AppDataContext = createContext<AppDataContextType | null>(null);

// Provider component
export function AppDataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [extendedCache, setExtendedCache] = useState<Map<number, Activity[]>>(new Map());
  const databaseService = DatabaseService.getInstance();

  // Initialize database on mount
  useEffect(() => {
    let unsubscribeFunction: (() => void) | null = null;

    const initializeApp = async () => {
      console.log('[ AppDataContext.tsx:151 ] Initializing app...');
      
      try {
        // Subscribe to database status changes
        unsubscribeFunction = databaseService.onStatusChange((status) => {
          console.log('[ AppDataContext.tsx:156 ] Database status changed:', status);
          dispatch({ type: 'SET_DATABASE_STATUS', payload: status });
          
          // Load data when database becomes ready
          if (status === 'ready' || status === 'fallback') {
            loadInitialData();
          }
        });

        // Initialize database
        await databaseService.initialize();
      } catch (error) {
        console.error('[ AppDataContext.tsx:168 ] App initialization failed:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize app' });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeApp();

    // Cleanup function
    return () => {
      if (unsubscribeFunction) {
        unsubscribeFunction();
      }
    };
  }, []);

  // Load initial data when database is ready
  const loadInitialData = async () => {
    try {
      console.log('[ AppDataContext.tsx:187 ] Loading initial data...');
      
      await loadUserData();
      await loadActivities();
      await loadMeetings();
      
      dispatch({ type: 'SET_LOADING', payload: false });
      console.log('[ AppDataContext.tsx:194 ] Initial data load complete');
    } catch (error) {
      console.error('[ AppDataContext.tsx:196 ] Failed to load initial data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load app data' });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // User operations
  const loadUserData = async () => {
    try {
      const users = await databaseService.getAllUsers();
      console.log('[ AppDataContext.tsx:206 ] Loaded users:', users.length);
      
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
        console.log('[ AppDataContext.tsx:225 ] User data loaded:', bestUser.id);
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
        console.log('[ AppDataContext.tsx:246 ] Created default user:', newUser.id);
      }
    } catch (error) {
      console.error('[ AppDataContext.tsx:249 ] Failed to load user data:', error);
      throw error;
    }
  };

  const updateUser = async (updates: Partial<User>): Promise<User | null> => {
    try {
      if (!state.currentUserId) {
        throw new Error('[AppDataContext: 257] No current user ID');
      }
      
      const updatedUser = await databaseService.updateUser(state.currentUserId, updates);
      if (updatedUser) {
        dispatch({ type: 'SET_USER', payload: updatedUser });
        console.log('[ AppDataContext.tsx:263 ] User updated:', updatedUser.id);
      }
      return updatedUser;
    } catch (error) {
      console.error('[ AppDataContext.tsx:267 ] Failed to update user:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update user profile' });
      return null;
    }
  };

  // Activity operations
  const loadActivities = async () => {
    try {
      const activities = await databaseService.getAllActivities();
      
      // Also fetch action items from action_items table and convert to activity format
      let actionItemActivities = [];
      try {
        const actionItems = await window.db.getAll('action_items');
        console.log('[ AppDataContext.tsx ] Fetched action items:', actionItems?.length || 0);
        
        // Convert action items to activity format for unified display
        const actionItemsArray = Array.isArray(actionItems) ? actionItems : [];
        actionItemActivities = actionItemsArray.map(item => ({
          id: `action-item-${item.id}`, // Prefix to avoid ID conflicts
          type: 'action-item',
          date: item.dueDate || item.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
          notes: `Action Item: ${item.title}${item.text ? ' - ' + item.text : ''}${item.notes ? ' [Notes: ' + item.notes + ']' : ''}`,
          duration: undefined,
          location: item.completed ? 'completed' : 'pending',
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
          // Keep reference to original action item
          actionItemId: item.id,
          actionItemData: item
        }));
        
        console.log('[ AppDataContext.tsx ] Converted action items to activities:', actionItemActivities.length);
      } catch (actionItemError) {
        console.warn('[ AppDataContext.tsx ] Failed to load action items:', actionItemError);
        // Continue without action items if they fail to load
      }
      
      // Also fetch sponsor contacts from sponsor_contacts table and convert to activity format
      let sponsorContactActivities = [];
      try {
        const sponsorContacts = await databaseService.getAllSponsorContacts();
        console.log('[ AppDataContext.tsx ] Fetched sponsor contacts:', sponsorContacts.length);
        
        // Convert sponsor contacts to activity format for unified display
        sponsorContactActivities = sponsorContacts.map(contact => ({
          id: `sponsor-contact-${contact.id}`, // Prefix to avoid ID conflicts
          type: 'sponsor-contact',
          date: contact.date || contact.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
          notes: `${contact.note || 'Sponsor contact'} [Contact: ${contact.type}]`,
          duration: undefined,
          location: contact.type, // Store contact type in location field for consistency
          createdAt: contact.createdAt || new Date().toISOString(),
          updatedAt: contact.updatedAt || new Date().toISOString(),
          // Keep reference to original sponsor contact
          sponsorContactId: contact.id,
          sponsorContactData: contact
        }));
        
        console.log('[ AppDataContext.tsx ] Converted sponsor contacts to activities:', sponsorContactActivities.length);
      } catch (sponsorContactError) {
        console.warn('[ AppDataContext.tsx ] Failed to load sponsor contacts:', sponsorContactError);
        // Continue without sponsor contacts if they fail to load
      }
      
      // Combine all activities from the 3 tables
      const allActivities = [...activities, ...actionItemActivities, ...sponsorContactActivities];
      
      // Always load last 180 days for base cache (fixed window for memory management)
      const CACHE_DAYS = 180;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - CACHE_DAYS);
      
      const cachedActivities = allActivities.filter(activity => {
        const activityDate = new Date(activity.date);
        return activityDate >= cutoffDate;
      });
      
      dispatch({ type: 'SET_ACTIVITIES', payload: cachedActivities });
      console.log(`[ AppDataContext.tsx:288 ] Activities cached (${CACHE_DAYS} days):`, cachedActivities.length, '(including action items)');
      
      // Calculate spiritual fitness
      await calculateSpiritualFitness();
    } catch (error) {
      console.error('[ AppDataContext.tsx:293 ] Failed to load activities:', error);
      throw error;
    }
  };

  // Smart caching function for timeframe-specific activities
  const getActivitiesForTimeframe = async (timeframe: number): Promise<Activity[]> => {
    const CACHE_DAYS = 180;
    
    // For timeframes within our base cache, use existing data
    if (timeframe <= CACHE_DAYS) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - timeframe);
      
      const filteredActivities = state.activities.filter(activity => {
        const activityDate = new Date(activity.date);
        return activityDate >= cutoffDate;
      });
      
      console.log(`[ AppDataContext.tsx:315 ] Using cached activities for ${timeframe} days:`, filteredActivities.length);
      return filteredActivities;
    }
    
    // For longer timeframes, check extended cache first
    if (extendedCache.has(timeframe)) {
      const cached = extendedCache.get(timeframe)!;
      console.log(`[ AppDataContext.tsx:322 ] Using extended cache for ${timeframe} days:`, cached.length);
      return cached;
    }
    
    // Fetch extended data for longer timeframes
    try {
      console.log(`[ AppDataContext.tsx:327 ] Fetching extended data for ${timeframe} days...`);
      const allActivities = await databaseService.getAllActivities();
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - timeframe);
      
      const extendedActivities = allActivities.filter(activity => {
        const activityDate = new Date(activity.date);
        return activityDate >= cutoffDate;
      });
      
      // Cache the result
      setExtendedCache(prev => new Map(prev).set(timeframe, extendedActivities));
      console.log(`[ AppDataContext.tsx:338 ] Extended cache updated for ${timeframe} days:`, extendedActivities.length);
      
      return extendedActivities;
    } catch (error) {
      console.error('[ AppDataContext.tsx:342 ] Failed to fetch extended activities:', error);
      throw error;
    }
  };

  const addActivity = async (activityData: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>): Promise<Activity | null> => {
    try {
      console.log('[ AppDataContext.tsx:300 addActivity ] Received activity data:', JSON.stringify(activityData, null, 2));
      console.log('[ AppDataContext.tsx:301 addActivity ] Calling databaseService.addActivity...');
      
      const newActivity = await databaseService.addActivity(activityData);
      
      console.log('[ AppDataContext.tsx:305 addActivity ] DatabaseService returned:', JSON.stringify(newActivity, null, 2));
      
      dispatch({ type: 'ADD_ACTIVITY', payload: newActivity });
      
      // Recalculate spiritual fitness
      calculateSpiritualFitness();
      
      console.log('[ AppDataContext.tsx:312 addActivity ] Activity added successfully with ID:', newActivity.id);
      return newActivity;
    } catch (error) {
      console.error('[ AppDataContext.tsx:315 addActivity ] Failed to add activity:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save activity' });
      return null;
    }
  };

  // Meeting operations
  const loadMeetings = async () => {
    try {
      const meetings = await databaseService.getAllMeetings();
      dispatch({ type: 'SET_MEETINGS', payload: meetings });
      console.log('[ AppDataContext.tsx:326 ] Meetings loaded:', meetings.length);
    } catch (error) {
      console.error('[ AppDataContext.tsx:328 ] Failed to load meetings:', error);
      throw error;
    }
  };

  const addMeeting = async (meetingData: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>): Promise<Meeting | null> => {
    try {
      const newMeeting = await databaseService.addMeeting(meetingData);
      dispatch({ type: 'ADD_MEETING', payload: newMeeting });
      console.log('[ AppDataContext.tsx:337 ] Meeting added:', newMeeting.id);
      return newMeeting;
    } catch (error) {
      console.error('[ AppDataContext.tsx:340 ] Failed to add meeting:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save meeting' });
      return null;
    }
  };

  const updateMeeting = async (meetingId: string | number, updates: Partial<Meeting>): Promise<Meeting | null> => {
    try {
      const updatedMeeting = await databaseService.updateMeeting(meetingId, updates);
      if (updatedMeeting) {
        dispatch({ type: 'UPDATE_MEETING', payload: { id: meetingId, data: updates } });
        console.log('[ AppDataContext.tsx:349 ] Meeting updated:', meetingId);
      }
      return updatedMeeting;
    } catch (error) {
      console.error('[ AppDataContext.tsx:353 ] Failed to update meeting:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update meeting' });
      return null;
    }
  };

  const deleteMeeting = async (meetingId: string | number): Promise<boolean> => {
    try {
      console.log('[ AppDataContext.tsx:373 ] Attempting to delete meeting with ID:', meetingId, 'Type:', typeof meetingId);
      
      const success = await databaseService.deleteMeeting(meetingId);
      console.log('[ AppDataContext.tsx:376 ] Database delete result:', success);
      
      if (success) {
        dispatch({ type: 'DELETE_MEETING', payload: meetingId });
        console.log('[ AppDataContext.tsx:379 ] Meeting deleted from UI state:', meetingId);
      } else {
        console.warn('[ AppDataContext.tsx:381 ] Database delete returned false - meeting may not exist or delete failed');
        dispatch({ type: 'SET_ERROR', payload: 'Meeting could not be deleted from database' });
      }
      return success;
    } catch (error) {
      console.error('[ AppDataContext.tsx:385 ] Failed to delete meeting:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete meeting' });
      return false;
    }
  };

  // Timeframe operations
  const updateTimeframe = async (timeframe: number) => {
    dispatch({ type: 'SET_TIMEFRAME', payload: timeframe });
    // No need to reload activities since we use smart caching now
    // Just recalculate spiritual fitness with the new timeframe
    await calculateSpiritualFitness();
  };

  // Spiritual fitness calculation
  const calculateSpiritualFitness = async () => {
    try {
      // Use smart caching to get activities for current timeframe
      const activities = await getActivitiesForTimeframe(state.currentTimeframe);
      console.log(`[ AppDataContext.tsx:454 ] Calculating spiritual fitness with ${activities.length} activities for ${state.currentTimeframe} days`);
      
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
    } catch (error) {
      console.error('[ AppDataContext.tsx:481 ] Failed to calculate spiritual fitness:', error);
      dispatch({ type: 'SET_SPIRITUAL_FITNESS', payload: 5 }); // Fallback to base score
    }
  };

  // Reset all data
  const resetAllData = async () => {
    try {
      console.log('[ AppDataContext.tsx:405 ] Starting complete app reset...');
      
      // Reset React state
      dispatch({ type: 'RESET_ALL_DATA' });
      
      // Set loading state to show we're reinitializing
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Reset and reinitialize the database service
      console.log('[ AppDataContext.tsx:415 ] Resetting database service state...');
      databaseService.resetInitialization();
      
      console.log('[ AppDataContext.tsx:418 ] Reinitializing database service...');
      await databaseService.initialize();
      
      // Reload all initial data
      console.log('[ AppDataContext.tsx:422 ] Reloading all data after reset...');
      await loadInitialData();
      
      console.log('[ AppDataContext.tsx:420 ] Complete app reset finished');
    } catch (error) {
      console.error('[ AppDataContext.tsx:422 ] Failed to reset data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to reset data' });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const contextValue: AppDataContextType = {
    state,
    dispatch,
    loadUserData,
    updateUser,
    loadActivities,
    getActivitiesForTimeframe,
    addActivity,
    loadMeetings,
    addMeeting,
    updateMeeting,
    deleteMeeting,
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