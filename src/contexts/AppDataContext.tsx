/**
 * App Data Context
 * Centralized state management for all app data
 */

import React, { createContext, useContext, useReducer, useEffect, useState, ReactNode } from 'react';
import DatabaseService, { DatabaseStatus } from '../services/DatabaseService';
import type { User, Activity, Meeting, ActionItem } from '../types/database';
import type { ContactPerson } from '../types/ContactPerson';
import { fixCorruptedPreferences } from '../utils/fixDatabasePreferences';

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
  
  // Action Items
  actionItems: ActionItem[];
  
  // Sponsors and Sponsees
  sponsors: ContactPerson[];
  sponsees: ContactPerson[];
  
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
  | { type: 'DELETE_ACTIVITY'; payload: string | number }
  | { type: 'SET_MEETINGS'; payload: Meeting[] }
  | { type: 'ADD_MEETING'; payload: Meeting }
  | { type: 'UPDATE_MEETING'; payload: { id: string | number; data: Partial<Meeting> } }
  | { type: 'DELETE_MEETING'; payload: string | number }
  | { type: 'SET_ACTION_ITEMS'; payload: ActionItem[] }
  | { type: 'ADD_ACTION_ITEM'; payload: ActionItem }
  | { type: 'UPDATE_ACTION_ITEM'; payload: { id: string | number; data: Partial<ActionItem> } }
  | { type: 'DELETE_ACTION_ITEM'; payload: string | number }
  | { type: 'SET_SPONSORS'; payload: ContactPerson[] }
  | { type: 'ADD_SPONSOR'; payload: ContactPerson }
  | { type: 'UPDATE_SPONSOR'; payload: { id: string | number; data: Partial<ContactPerson> } }
  | { type: 'DELETE_SPONSOR'; payload: string | number }
  | { type: 'SET_SPONSEES'; payload: ContactPerson[] }
  | { type: 'ADD_SPONSEE'; payload: ContactPerson }
  | { type: 'UPDATE_SPONSEE'; payload: { id: string | number; data: Partial<ContactPerson> } }
  | { type: 'DELETE_SPONSEE'; payload: string | number }
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
  actionItems: [],
  sponsors: [],
  sponsees: [],
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
    
    case 'DELETE_ACTIVITY':
      return { 
        ...state, 
        activities: state.activities.filter(activity => activity.id !== action.payload) 
      };
    
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
    
    case 'SET_ACTION_ITEMS':
      return { ...state, actionItems: action.payload };
    
    case 'ADD_ACTION_ITEM':
      return { ...state, actionItems: [...state.actionItems, action.payload] };
    
    case 'UPDATE_ACTION_ITEM':
      return {
        ...state,
        actionItems: state.actionItems.map(item => 
          item.id === action.payload.id 
            ? { ...item, ...action.payload.data, updatedAt: new Date().toISOString() }
            : item
        )
      };
    
    case 'DELETE_ACTION_ITEM':
      return { 
        ...state, 
        actionItems: state.actionItems.filter(item => item.id !== action.payload) 
      };
    
    case 'SET_SPONSORS':
      return { ...state, sponsors: action.payload };
    
    case 'ADD_SPONSOR':
      return { ...state, sponsors: [...state.sponsors, action.payload] };
    
    case 'UPDATE_SPONSOR':
      return {
        ...state,
        sponsors: state.sponsors.map(sponsor => 
          sponsor.id === action.payload.id 
            ? { ...sponsor, ...action.payload.data, updatedAt: new Date().toISOString() }
            : sponsor
        )
      };
    
    case 'DELETE_SPONSOR':
      return { 
        ...state, 
        sponsors: state.sponsors.filter(sponsor => sponsor.id !== action.payload) 
      };
    
    case 'SET_SPONSEES':
      return { ...state, sponsees: action.payload };
    
    case 'ADD_SPONSEE':
      return { ...state, sponsees: [...state.sponsees, action.payload] };
    
    case 'UPDATE_SPONSEE':
      return {
        ...state,
        sponsees: state.sponsees.map(sponsee => 
          sponsee.id === action.payload.id 
            ? { ...sponsee, ...action.payload.data, updatedAt: new Date().toISOString() }
            : sponsee
        )
      };
    
    case 'DELETE_SPONSEE':
      return { 
        ...state, 
        sponsees: state.sponsees.filter(sponsee => sponsee.id !== action.payload) 
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
  deleteActivity: (activityId: string | number) => Promise<boolean>;
  
  loadMeetings: () => Promise<void>;
  addMeeting: (meeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Meeting | null>;
  updateMeeting: (meetingId: string | number, updates: Partial<Meeting>) => Promise<Meeting | null>;
  deleteMeeting: (meetingId: string | number) => Promise<boolean>;
  
  loadActionItems: () => Promise<void>;
  addActionItem: (item: Omit<ActionItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ActionItem | null>;
  updateActionItem: (itemId: string | number, updates: Partial<ActionItem>) => Promise<ActionItem | null>;
  deleteActionItem: (itemId: string | number) => Promise<boolean>;
  
  loadSponsors: () => Promise<void>;
  addSponsor: (sponsor: Omit<ContactPerson, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ContactPerson | null>;
  updateSponsor: (sponsorId: string | number, updates: Partial<ContactPerson>) => Promise<ContactPerson | null>;
  deleteSponsor: (sponsorId: string | number) => Promise<boolean>;
  
  loadSponsees: () => Promise<void>;
  addSponsee: (sponsee: Omit<ContactPerson, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ContactPerson | null>;
  updateSponsee: (sponseeId: string | number, updates: Partial<ContactPerson>) => Promise<ContactPerson | null>;
  deleteSponsee: (sponseeId: string | number) => Promise<boolean>;
  
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
      console.log('[ AppDataContext.tsx ] Platform:', navigator.userAgent);
      console.log('[ AppDataContext.tsx ] Is Capacitor:', !!(window as any).Capacitor);
      
      // Check if running on iOS device using Capacitor
      const isCapacitor = !!(window as any).Capacitor;
      const isIOS = (window as any).Capacitor?.getPlatform?.() === 'ios';
      
      if (!isCapacitor || !isIOS) {
        console.log('[ AppDataContext.tsx ] This app is designed for iOS only. Web platform not supported.');
        dispatch({ type: 'SET_ERROR', payload: 'This app requires iOS device with Capacitor' });
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }
      
      try {
        // Subscribe to database status changes
        unsubscribeFunction = databaseService.onStatusChange((status) => {
          console.log('[ AppDataContext.tsx:156 ] Database status changed:', status);
          dispatch({ type: 'SET_DATABASE_STATUS', payload: status });
          
          // Load data when database becomes ready
          if (status === 'ready' || status === 'fallback') {
            console.log('[ AppDataContext.tsx ] Database ready, loading initial data...');
            loadInitialData();
          }
        });

        console.log('[ AppDataContext.tsx ] About to initialize database service...');
        // Initialize database
        await databaseService.initialize();
        console.log('[ AppDataContext.tsx ] Database service initialization completed');
      } catch (error) {
        console.error('[ AppDataContext.tsx:168 ] App initialization failed:', error);
        console.error('[ AppDataContext.tsx ] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        dispatch({ type: 'SET_ERROR', payload: `Failed to initialize app: ${error instanceof Error ? error.message : String(error)}` });
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
      
      // Fix any corrupted preferences data first
      try {
        await fixCorruptedPreferences();
        console.log('[ AppDataContext.tsx ] Database preferences validated/fixed');
      } catch (error) {
        console.warn('[ AppDataContext.tsx ] Failed to fix preferences, continuing:', error);
      }
      
      await loadUserData();
      await loadActivities();
      await loadMeetings();
      await loadActionItems();
      await loadSponsors();
      await loadSponsees();
      
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
            use24HourFormat: false,
            darkMode: false,
            theme: 'default'
          }
        });
        
        if (!newUser) {
          throw new Error('Failed to create default user - addUser returned null');
        }
        
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
      const actionItems = await databaseService.getAllActionItems();
      const sponsorContacts = await databaseService.getAllSponsorContacts();
      const sponsors = await databaseService.getAllSponsors();
      
      // Get sponsee contacts using the table directly
      const sponseeContacts = await databaseService.getAll('sponsee_contacts');
      
      console.log('[ AppDataContext.tsx ] Raw activities from database:', activities.length);
      console.log('[ AppDataContext.tsx ] Raw action items from database:', actionItems.length);
      console.log('[ AppDataContext.tsx ] Raw sponsor contacts from database:', sponsorContacts.length);
      console.log('[ AppDataContext.tsx ] Raw sponsors from database:', sponsors.length);
      console.log('[ AppDataContext.tsx ] First sponsor:', sponsors[0]);
      console.log('[ AppDataContext.tsx ] Activities types:', activities.map(a => `${a.id}:${a.type}`));
      
      // Enrich activities with action item data for proper synchronization
      const enrichedActivities = activities.map(activity => {
        // Handle activities with direct actionItemId reference
        if (activity.actionItemId) {
          const actionItem = actionItems.find(ai => ai.id === activity.actionItemId);
          if (actionItem) {
            // Find the sponsor for this action item
            let sponsorName = '';
            if (actionItem.sponsorContactId) {
              console.log('[ AppDataContext.tsx ] Processing action item with actionItemId:', activity.actionItemId);
              console.log('[ AppDataContext.tsx ] Available sponsors:', sponsors);
              if (sponsors && sponsors.length > 0) {
                const sponsor = sponsors[0]; // Use first sponsor
                sponsorName = `${sponsor.name || ''} ${sponsor.lastName || ''}`.trim() || 'Sponsor';
                console.log('[ AppDataContext.tsx ] Assigned sponsor name:', sponsorName);
              }
            }

            return {
              ...activity,
              actionItemData: {
                ...actionItem,
                sponsorName: sponsorName, // Keep the concatenated name for backwards compatibility
                sponsorFirstName: sponsors[0]?.name || '',
                sponsorLastName: sponsors[0]?.lastName || ''
              },
              title: actionItem.title || activity.title,
              text: actionItem.text || activity.text,
              type: actionItem.sponsorContactId ? 'sponsor_action_item' : 
                    actionItem.sponseeContactId ? 'sponsee_action_item' : 
                    'action-item'
            };
          }
        }
        
        // Handle sponsor_action_item activities - enrich all with sponsor data
        if (activity.type === 'sponsor_action_item') {
          console.log('[ AppDataContext.tsx ] Processing sponsor_action_item activity:', {
            id: activity.id,
            type: activity.type,
            title: activity.title,
            text: activity.text,
            notes: activity.notes
          });
          
          if (sponsors && sponsors.length > 0) {
            const sponsor = sponsors[0];
            // Format as "First Name, Last initial" for activity display
            const firstName = sponsor.name || '';
            const lastName = sponsor.lastName || '';
            const sponsorName = lastName ? `${firstName} ${lastName.charAt(0)}.` : firstName || 'Sponsor';
            console.log('[ AppDataContext.tsx ] Enriching with sponsor name:', sponsorName);
            
            // Find matching action item if available
            const matchingActionItem = actionItems.find(ai => 
              ai.sponsorContactId && ai.type === 'sponsor_action_item'
            );
            
            console.log('[ AppDataContext.tsx ] Found matching action item:', matchingActionItem);
            
            const enrichedActivity = {
              ...activity,
              actionItemData: matchingActionItem ? {
                ...matchingActionItem,
                sponsorName
              } : { sponsorName },
              sponsorName: sponsorName,
              // Clean up the title to remove "Sponsor Action:" prefix here too
              title: activity.title && activity.title.startsWith('Sponsor Action:') 
                ? activity.title.replace('Sponsor Action:', '').trim()
                : activity.title
            };
            
            console.log('[ AppDataContext.tsx ] Final enriched activity:', {
              id: enrichedActivity.id,
              type: enrichedActivity.type,
              title: enrichedActivity.title,
              sponsorName: enrichedActivity.sponsorName,
              hasActionItemData: !!enrichedActivity.actionItemData
            });
            
            return enrichedActivity;
          }
        }
        
        return activity;
      });

      // Filter activities to only include those that should appear in Activity list:
      // 1. All regular activities (meetings, prayer, etc.)
      // 2. All sponsor contacts 
      // 3. All sponsee contacts
      // 4. Action items from SPONSOR contacts only (user gets credit for completing these)
      const filteredActivities = enrichedActivities.filter(activity => {
        // Include all non-action-item activities
        if (activity.type !== 'action-item' && activity.type !== 'sponsor_action_item' && activity.type !== 'sponsee_action_item') {
          return true;
        }
        
        // For sponsor action items, always include them (user gets credit for completing these)
        if (activity.type === 'sponsor_action_item') {
          return true;
        }
        
        // For other action items, only include those from sponsor contacts
        if (activity.actionItemId && activity.actionItemData) {
          // Include if it has sponsorContactId (from sponsor)
          // Exclude if it has sponseeContactId (from sponsee - user doesn't get credit)
          return activity.actionItemData.sponsorContactId && !activity.actionItemData.sponseeContactId;
        }
        
        return false;
      });
      
      // Always load last 180 days for base cache (fixed window for memory management)
      const CACHE_DAYS = 180;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - CACHE_DAYS);
      
      const cachedActivities = filteredActivities.filter(activity => {
        const activityDate = new Date(activity.date);
        return activityDate >= cutoffDate;
      });
      
      dispatch({ type: 'SET_ACTIVITIES', payload: cachedActivities });
      console.log(`[ AppDataContext.tsx:288 ] Activities cached (${CACHE_DAYS} days):`, cachedActivities.length, '(all contact activities)');
      console.log('[ AppDataContext.tsx ] Activity types in cache:', cachedActivities.map(a => a.type));

      
      // Calculate spiritual fitness
      await calculateSpiritualFitness();
    } catch (error) {
      console.error('[ AppDataContext.tsx:293 ] Failed to load activities:', error);
      console.error('[ AppDataContext.tsx ] Error details:', JSON.stringify(error, null, 2));
      console.error('[ AppDataContext.tsx ] Error stack:', error?.stack);
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

  // Delete activity
  const deleteActivity = async (activityId: string | number): Promise<boolean> => {
    try {
      // Delete from database
      const success = await databaseService.deleteActivity(activityId);
      
      if (success) {
        // Update local state
        dispatch({ type: 'DELETE_ACTIVITY', payload: activityId });
        
        // Recalculate spiritual fitness
        calculateSpiritualFitness();
        
        console.log('[ AppDataContext.tsx ] Activity deleted:', activityId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('[ AppDataContext.tsx ] Failed to delete activity:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete activity' });
      return false;
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

  // Action Items operations
  const loadActionItems = async () => {
    try {
      const actionItems = await databaseService.getAllActionItems();
      dispatch({ type: 'SET_ACTION_ITEMS', payload: actionItems || [] });
      console.log('[ AppDataContext.tsx ] Action items loaded:', actionItems?.length || 0);
    } catch (error) {
      console.error('[ AppDataContext.tsx ] Failed to load action items:', error);
      throw error;
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
      
      // Set loading state to show we're resetting
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      // CRITICAL: Actually reset the database by dropping and recreating tables
      console.log('[ AppDataContext.tsx:415 ] Calling DatabaseService.resetAllData to drop and recreate all tables...');
      await databaseService.resetAllData();
      console.log('[ AppDataContext.tsx:417 ] Database tables dropped and recreated successfully');
      
      // Reset React state after successful database reset
      dispatch({ type: 'RESET_ALL_DATA' });
      
      // Reset and reinitialize the database service
      console.log('[ AppDataContext.tsx:423 ] Resetting database service state...');
      databaseService.resetInitialization();
      
      console.log('[ AppDataContext.tsx:426 ] Reinitializing database service...');
      await databaseService.initialize();
      
      // Wait a moment for database to be fully ready
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Reload all initial data (should be empty now)
      console.log('[ AppDataContext.tsx:430 ] Reloading all data after reset...');
      await loadInitialData();
      
      console.log('[ AppDataContext.tsx:433 ] Complete app reset finished');
    } catch (error) {
      console.error('[ AppDataContext.tsx:435 ] Failed to reset data:', error);
      console.error('[ AppDataContext.tsx ] Reset error details:', error instanceof Error ? error.stack : 'No stack trace');
      dispatch({ type: 'SET_ERROR', payload: `Reset failed: ${error instanceof Error ? error.message : 'Unknown error'}` });
      dispatch({ type: 'SET_LOADING', payload: false });
      
      // Try to reinitialize the database even if reset failed
      try {
        console.log('[ AppDataContext.tsx ] Attempting to reinitialize database after reset failure...');
        await databaseService.initialize();
        await loadInitialData();
      } catch (recoveryError) {
        console.error('[ AppDataContext.tsx ] Recovery attempt also failed:', recoveryError);
      }
    }
  };

  // Action item operations
  const addActionItem = async (itemData: Omit<ActionItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ActionItem | null> => {
    try {
      const newActionItem = await databaseService.addActionItem(itemData);
      // Reload activities to include the new action item
      await loadActivities();
      console.log('[ AppDataContext.tsx ] Action item added:', newActionItem.id);
      return newActionItem;
    } catch (error) {
      console.error('[ AppDataContext.tsx ] Failed to add action item:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save action item' });
      return null;
    }
  };

  const updateActionItem = async (itemId: string | number, updates: Partial<ActionItem>): Promise<ActionItem | null> => {
    try {
      const updatedActionItem = await databaseService.updateActionItem(itemId, updates);
      if (updatedActionItem) {
        dispatch({ type: 'UPDATE_ACTION_ITEM', payload: { id: itemId, data: updates } });
        
        // Reload activities to ensure synchronization
        await loadActivities();
        
        console.log('[ AppDataContext.tsx ] Action item updated and activities reloaded:', itemId);
        return updatedActionItem;
      }
      return null;
    } catch (error) {
      console.error('[ AppDataContext.tsx ] Failed to update action item:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update action item' });
      return null;
    }
  };

  const deleteActionItem = async (itemId: string | number): Promise<boolean> => {
    try {
      const success = await databaseService.deleteActionItem(itemId);
      if (success) {
        // Reload activities to remove the deleted action item
        await loadActivities();
        console.log('[ AppDataContext.tsx ] Action item deleted:', itemId);
      }
      return success;
    } catch (error) {
      console.error('[ AppDataContext.tsx ] Failed to delete action item:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete action item' });
      return false;
    }
  };

  // Sponsor operations
  const loadSponsors = async () => {
    try {
      const sponsors = await databaseService.getAll('sponsors');
      dispatch({ type: 'SET_SPONSORS', payload: sponsors as ContactPerson[] || [] });
      console.log('[ AppDataContext.tsx ] Sponsors loaded:', sponsors?.length || 0);
    } catch (error) {
      console.error('[ AppDataContext.tsx ] Failed to load sponsors:', error);
      throw error;
    }
  };

  const addSponsor = async (sponsorData: Omit<ContactPerson, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContactPerson | null> => {
    try {
      const newSponsor = await databaseService.add('sponsors', {
        ...sponsorData,
        userId: state.currentUserId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      if (newSponsor) {
        dispatch({ type: 'ADD_SPONSOR', payload: newSponsor as ContactPerson });
        console.log('[ AppDataContext.tsx ] Sponsor added:', newSponsor.id);
      }
      return newSponsor as ContactPerson;
    } catch (error) {
      console.error('[ AppDataContext.tsx ] Failed to add sponsor:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save sponsor' });
      return null;
    }
  };

  const updateSponsor = async (sponsorId: string | number, updates: Partial<ContactPerson>): Promise<ContactPerson | null> => {
    try {
      const updatedSponsor = await databaseService.update('sponsors', sponsorId, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      
      if (updatedSponsor) {
        dispatch({ type: 'UPDATE_SPONSOR', payload: { id: sponsorId, data: updates } });
        console.log('[ AppDataContext.tsx ] Sponsor updated:', sponsorId);
      }
      return updatedSponsor as ContactPerson;
    } catch (error) {
      console.error('[ AppDataContext.tsx ] Failed to update sponsor:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update sponsor' });
      return null;
    }
  };

  const deleteSponsor = async (sponsorId: string | number): Promise<boolean> => {
    try {
      const success = await databaseService.remove('sponsors', sponsorId);
      if (success) {
        dispatch({ type: 'DELETE_SPONSOR', payload: sponsorId });
        console.log('[ AppDataContext.tsx ] Sponsor deleted:', sponsorId);
      }
      return success;
    } catch (error) {
      console.error('[ AppDataContext.tsx ] Failed to delete sponsor:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete sponsor' });
      return false;
    }
  };

  // Sponsee operations
  const loadSponsees = async () => {
    try {
      const sponsees = await databaseService.getAll('sponsees');
      dispatch({ type: 'SET_SPONSEES', payload: sponsees as ContactPerson[] || [] });
      console.log('[ AppDataContext.tsx ] Sponsees loaded:', sponsees?.length || 0);
    } catch (error) {
      console.error('[ AppDataContext.tsx ] Failed to load sponsees:', error);
      throw error;
    }
  };

  const addSponsee = async (sponseeData: Omit<ContactPerson, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContactPerson | null> => {
    try {
      const newSponsee = await databaseService.add('sponsees', {
        ...sponseeData,
        userId: state.currentUserId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      if (newSponsee) {
        dispatch({ type: 'ADD_SPONSEE', payload: newSponsee as ContactPerson });
        console.log('[ AppDataContext.tsx ] Sponsee added:', newSponsee.id);
      }
      return newSponsee as ContactPerson;
    } catch (error) {
      console.error('[ AppDataContext.tsx ] Failed to add sponsee:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save sponsee' });
      return null;
    }
  };

  const updateSponsee = async (sponseeId: string | number, updates: Partial<ContactPerson>): Promise<ContactPerson | null> => {
    try {
      const updatedSponsee = await databaseService.update('sponsees', sponseeId, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      
      if (updatedSponsee) {
        dispatch({ type: 'UPDATE_SPONSEE', payload: { id: sponseeId, data: updates } });
        console.log('[ AppDataContext.tsx ] Sponsee updated:', sponseeId);
      }
      return updatedSponsee as ContactPerson;
    } catch (error) {
      console.error('[ AppDataContext.tsx ] Failed to update sponsee:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update sponsee' });
      return null;
    }
  };

  const deleteSponsee = async (sponseeId: string | number): Promise<boolean> => {
    try {
      const success = await databaseService.remove('sponsees', sponseeId);
      if (success) {
        dispatch({ type: 'DELETE_SPONSEE', payload: sponseeId });
        console.log('[ AppDataContext.tsx ] Sponsee deleted:', sponseeId);
      }
      return success;
    } catch (error) {
      console.error('[ AppDataContext.tsx ] Failed to delete sponsee:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete sponsee' });
      return false;
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
    deleteActivity,
    loadMeetings,
    addMeeting,
    updateMeeting,
    deleteMeeting,
    loadActionItems,
    addActionItem,
    updateActionItem,
    deleteActionItem,
    loadSponsors,
    addSponsor,
    updateSponsor,
    deleteSponsor,
    loadSponsees,
    addSponsee,
    updateSponsee,
    deleteSponsee,
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