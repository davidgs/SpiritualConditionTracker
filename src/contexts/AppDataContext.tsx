/**
 * App Data Context
 * Centralized state management for all app data
 */

import React, { createContext, useContext, useReducer, useEffect, useState, ReactNode } from 'react';
import DatabaseService, { DatabaseStatus } from '../services/DatabaseService';
import type { 
  User, Activity, Meeting, ActionItem, Sponsor, Sponsee, SponsorContact, SponseeContact,
  InsertUser, UpdateUser, InsertActivity, UpdateActivity, 
  InsertMeeting, UpdateMeeting, InsertActionItem, UpdateActionItem,
  InsertSponsor, InsertSponsee, InsertSponsorContact, InsertSponseeContact
} from '../types/database';
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
  
  // Data operations with proper typing
  loadUserData: () => Promise<void>;
  updateUser: (updates: UpdateUser) => Promise<User | null>;
  
  loadActivities: () => Promise<void>;
  getActivitiesForTimeframe: (timeframe: number) => Promise<Activity[]>;
  addActivity: (activity: InsertActivity) => Promise<Activity | null>;
  deleteActivity: (activityId: string | number) => Promise<boolean>;
  
  loadMeetings: () => Promise<void>;
  addMeeting: (meeting: InsertMeeting) => Promise<Meeting | null>;
  updateMeeting: (meetingId: string | number, updates: UpdateMeeting) => Promise<Meeting | null>;
  deleteMeeting: (meetingId: string | number) => Promise<boolean>;
  
  loadActionItems: () => Promise<void>;
  addActionItem: (item: InsertActionItem) => Promise<ActionItem | null>;
  updateActionItem: (itemId: string | number, updates: UpdateActionItem) => Promise<ActionItem | null>;
  deleteActionItem: (itemId: string | number) => Promise<boolean>;
  
  // Sponsor/Sponsee operations
  addSponsor: (sponsor: InsertSponsor) => Promise<Sponsor | null>;
  addSponsee: (sponsee: InsertSponsee) => Promise<Sponsee | null>;
  addSponsorContact: (contact: InsertSponsorContact) => Promise<SponsorContact | null>;
  addSponseeContact: (contact: InsertSponseeContact) => Promise<SponseeContact | null>;
  
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
          homeGroups: JSON.stringify([]),
          phoneNumber: '',
          email: '',
          privacySettings: JSON.stringify({
            allowMessages: true,
            shareLastName: true
          }),
          preferences: JSON.stringify({
            use24HourFormat: false,
            darkMode: false,
            theme: 'default'
          })
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

  const updateUser = async (updates: UpdateUser): Promise<User | null> => {
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
      // 1. Load all activities (prayer, meditation, literature, meeting, service, AA calls, journaling)
      const activities = await databaseService.getAllActivities();
      console.log('[ AppDataContext.tsx ] Loaded activities from activities table:', activities.length);
      
      // 2. Load sponsor contacts and transform them to activities
      const sponsorContacts = await databaseService.getAllSponsorContacts();
      console.log('[ AppDataContext.tsx ] Loaded sponsor contacts:', sponsorContacts.length);

      // 3. Load sponsee contacts and transform them to activities  
      const sponseeContacts = await databaseService.getAllSponseeContacts();
      console.log('[ AppDataContext.tsx ] Loaded sponsee contacts:', sponseeContacts.length);

      // Get sponsor and sponsee names for display
      const allSponsors = await databaseService.getAllSponsors();
      const allSponsees = await databaseService.getAllSponsees();
      
      let mainSponsorName = 'Sponsor';
      if (allSponsors && allSponsors.length > 0) {
        const sponsor = allSponsors[0];
        const firstName = sponsor.name || '';
        const lastName = sponsor.lastName || '';
        mainSponsorName = lastName ? `${firstName} ${lastName.charAt(0)}.` : firstName || 'Sponsor';
      }

      // Transform sponsor contacts to activity-like objects
      const sponsorContactActivities = sponsorContacts.map(contact => ({
        id: `sponsor_contact_${contact.id}`,
        userId: String(state.currentUserId || 'default_user'),
        type: 'sponsor-contact',
        title: 'Contact with Sponsor',
        text: contact.note || 'Contact with Sponsor',
        notes: contact.note || '',
        date: contact.date,
        duration: 0,
        completed: 0,
        createdAt: contact.createdAt || new Date().toISOString(),
        updatedAt: contact.updatedAt || new Date().toISOString(),
        sponsorContactId: contact.id,
        sponsorName: mainSponsorName,
        personCalled: mainSponsorName
      }));
      
      // Transform sponsee contacts to activity-like objects
      const sponseeContactActivities = sponseeContacts.map(contact => {
        // Find the sponsee for this contact
        const relatedSponsee = allSponsees.find(s => s.id === contact.sponseeId);
        const sponseeName = relatedSponsee 
          ? `${relatedSponsee.name || ''} ${(relatedSponsee.lastName || '').charAt(0)}.`.trim()
          : 'Sponsee';
        
        return {
          id: `sponsee_contact_${contact.id}`,
          userId: String(state.currentUserId || 'default_user'),
          type: 'sponsee-contact',
          title: 'Contact with Sponsee',
          text: contact.note || 'Contact with Sponsee',
          notes: contact.note || '',
          date: contact.date,
          duration: 0,
          completed: 0,
          createdAt: contact.createdAt || new Date().toISOString(),
          updatedAt: contact.updatedAt || new Date().toISOString(),
          sponseeContactId: contact.id,
          sponseeName: sponseeName,
          personCalled: sponseeName
        };
      });
      
      console.log('[ AppDataContext.tsx ] Transformed sponsor contacts to activities:', sponsorContactActivities.length);
      console.log('[ AppDataContext.tsx ] Transformed sponsee contacts to activities:', sponseeContactActivities.length);
      
      // 4. Load action items and filter for sponsor action items only
      const allDbActionItems = await databaseService.getAllActionItems();
      console.log('[ AppDataContext.tsx ] Loaded all action items from database:', allDbActionItems.length);

      // Transform ONLY sponsor action items to activity-like objects (exclude sponsee action items)
      const actionItemActivities = allDbActionItems
        .filter(actionItem => {
          // Include action items that are linked to sponsor contacts
          const isLinkedToSponsorContact = sponsorContacts.some(contact => contact.id === actionItem.contactId);
          const isSponsorActionItemType = actionItem.type === 'sponsor_action_item';
          
          console.log(`[ AppDataContext.tsx ] Filtering action item "${actionItem.title}":`, {
            actionItemId: actionItem.id,
            type: actionItem.type,
            contactId: actionItem.contactId,
            sponsorContactId: actionItem.sponsorContactId,
            isLinkedToSponsorContact,
            isSponsorActionItemType,
            willInclude: isLinkedToSponsorContact && isSponsorActionItemType
          });
          
          return isLinkedToSponsorContact && isSponsorActionItemType;
        })
        .map(actionItem => {
          const relatedContact = sponsorContacts.find(contact => contact.id === actionItem.contactId);
          return {
            id: `action_item_${actionItem.id}`,
            userId: String(state.currentUserId || 'default_user'),
            type: 'sponsor_action_item',
            title: actionItem.title,
            text: actionItem.text || actionItem.title,
            notes: actionItem.notes || '',
            date: relatedContact?.date || new Date().toISOString(),
            duration: 0,
            completed: actionItem.completed,
            createdAt: actionItem.createdAt || new Date().toISOString(),
            updatedAt: actionItem.updatedAt || new Date().toISOString(),
            actionItemId: actionItem.id,
            actionItemData: actionItem,
            sponsorName: mainSponsorName,
            sponsorContactId: actionItem.contactId
          };
        });
      
      console.log('[ AppDataContext.tsx ] Transformed action items to activities:', actionItemActivities.length);
      
      // 4. Filter out any existing activities that already reference sponsor/sponsee contacts or action items
      const filteredActivities = activities.filter(activity => {
        // Remove activities that reference action items we're adding separately
        if (activity.actionItemId) {
          const hasMatchingActionItem = actionItemActivities.some(ai => ai.actionItemId === activity.actionItemId);
          if (hasMatchingActionItem) {
            console.log('[ AppDataContext.tsx ] Removing duplicate activity that references action item:', activity.title);
            return false;
          }
        }
        
        // Remove activities that reference sponsor contacts we're adding separately
        if ((activity as any).sponsorContactId) {
          const hasMatchingSponsorContact = sponsorContactActivities.some(sc => sc.sponsorContactId === (activity as any).sponsorContactId);
          if (hasMatchingSponsorContact) {
            console.log('[ AppDataContext.tsx ] Removing duplicate activity that references sponsor contact:', activity.title);
            return false;
          }
        }
        
        // Keep sponsee contact activities (they SHOULD appear in Activity List)
        // Only remove sponsee action items, not sponsee contacts
        
        // Remove sponsee action items (they should NOT appear in Activity List)
        if (activity.type === 'sponsee_action_item') {
          console.log('[ AppDataContext.tsx ] Removing sponsee action item (should not appear in Activity List):', activity.title);
          return false;
        }
        
        return true;
      });
      
      // 5. Merge all data: activities + sponsor contacts + sponsee contacts + sponsor action items
      const allActivitiesData = [
        ...filteredActivities, // Real activities (minus duplicates)
        ...sponsorContactActivities, // Sponsor contacts as activities
        ...sponseeContactActivities, // Sponsee contacts as activities  
        ...actionItemActivities // Sponsor action items as activities (sponsee action items excluded)
      ] as Activity[];
      
      console.log('[ AppDataContext.tsx ] Total merged activities (deduplicated):', allActivitiesData.length);
      console.log('[ AppDataContext.tsx ] Activity types:', allActivitiesData.map(a => `${a.type}`));
      
      // Debug: Log activities by date to check for duplicates
      const dateGroups = allActivitiesData.reduce((groups, activity) => {
        const dateKey = new Date(activity.date).toDateString();
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(`${activity.type}: ${activity.title || activity.text || 'No title'}`);
        return groups;
      }, {} as Record<string, string[]>);
      
      console.log('[ AppDataContext.tsx ] Activities grouped by date:', dateGroups);
      
      // Debug: Check for potential duplicates
      const titleCounts = allActivitiesData.reduce((counts, activity) => {
        const title = activity.title || activity.text || 'No title';
        counts[title] = (counts[title] || 0) + 1;
        return counts;
      }, {} as Record<string, number>);
      
      const duplicateTitles = Object.entries(titleCounts).filter(([title, count]) => count > 1);
      if (duplicateTitles.length > 0) {
        console.warn('[ AppDataContext.tsx ] Found duplicate activity titles:', duplicateTitles);
      }
      
      // Always load last 180 days for base cache (fixed window for memory management)
      const CACHE_DAYS = 180;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - CACHE_DAYS);
      
      const cachedActivities = allActivitiesData.filter(activity => {
        const activityDate = new Date(activity.date);
        return activityDate >= cutoffDate;
      });
      
      dispatch({ type: 'SET_ACTIVITIES', payload: cachedActivities });
      console.log(`[ AppDataContext.tsx ] Activities cached (${CACHE_DAYS} days):`, cachedActivities.length, '(activities + action items)');
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
      
      const timeframeActivities = state.activities.filter(activity => {
        const activityDate = new Date(activity.date);
        return activityDate >= cutoffDate;
      });
      
      console.log(`[ AppDataContext.tsx:315 ] Using cached activities for ${timeframe} days:`, timeframeActivities.length);
      return timeframeActivities;
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

  const addActivity = async (activityData: InsertActivity): Promise<Activity | null> => {
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

  const addMeeting = async (meetingData: InsertMeeting): Promise<Meeting | null> => {
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

  const updateMeeting = async (meetingId: string | number, updates: UpdateMeeting): Promise<Meeting | null> => {
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
      
      // Clear the extended cache that persists old activity data
      console.log('[ AppDataContext.tsx:419 ] Clearing extended activity cache...');
      setExtendedCache(new Map());
      
      // Reset and reinitialize the database service
      console.log('[ AppDataContext.tsx:423 ] Resetting database service state...');
      databaseService.resetInitialization();
      
      console.log('[ AppDataContext.tsx:426 ] Reinitializing database service...');
      await databaseService.initialize();
      
      // Wait longer for database to be fully ready and tables to be created
      console.log('[ AppDataContext.tsx:428 ] Waiting for database to stabilize...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Increased from 500ms to 2000ms
      
      // Verify database is ready before loading data
      const dbStatus = databaseService.getStatus();
      console.log('[ AppDataContext.tsx:432 ] Database status after reset:', dbStatus);
      
      if (dbStatus !== 'ready') {
        console.warn('[ AppDataContext.tsx:434 ] Database not ready after reset, status:', dbStatus);
        dispatch({ type: 'SET_ERROR', payload: 'Database not ready after reset. Please restart the app.' });
        return;
      }
      
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
  const addActionItem = async (itemData: InsertActionItem): Promise<ActionItem | null> => {
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

  const updateActionItem = async (itemId: string | number, updates: UpdateActionItem): Promise<ActionItem | null> => {
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
  const addSponsor = async (sponsorData: InsertSponsor): Promise<Sponsor | null> => {
    try {
      const newSponsor = await databaseService.addSponsor(sponsorData);
      console.log('[ AppDataContext.tsx ] Sponsor added:', newSponsor.id);
      return newSponsor;
    } catch (error) {
      console.error('[ AppDataContext.tsx ] Failed to add sponsor:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add sponsor' });
      return null;
    }
  };

  // Sponsee operations
  const addSponsee = async (sponseeData: InsertSponsee): Promise<Sponsee | null> => {
    try {
      const newSponsee = await databaseService.addSponsee(sponseeData);
      console.log('[ AppDataContext.tsx ] Sponsee added:', newSponsee.id);
      return newSponsee;
    } catch (error) {
      console.error('[ AppDataContext.tsx ] Failed to add sponsee:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add sponsee' });
      return null;
    }
  };

  // Sponsor contact operations
  const addSponsorContact = async (contactData: InsertSponsorContact): Promise<SponsorContact | null> => {
    try {
      const newContact = await databaseService.addSponsorContact(contactData);
      // Reload activities to include the new sponsor contact
      await loadActivities();
      console.log('[ AppDataContext.tsx ] Sponsor contact added:', newContact.id);
      return newContact;
    } catch (error) {
      console.error('[ AppDataContext.tsx ] Failed to add sponsor contact:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add sponsor contact' });
      return null;
    }
  };

  // Sponsee contact operations
  const addSponseeContact = async (contactData: InsertSponseeContact): Promise<SponseeContact | null> => {
    try {
      const newContact = await databaseService.addSponseeContact(contactData);
      // Reload activities to include the new sponsee contact
      await loadActivities();
      console.log('[ AppDataContext.tsx ] Sponsee contact added:', newContact.id);
      return newContact;
    } catch (error) {
      console.error('[ AppDataContext.tsx ] Failed to add sponsee contact:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add sponsee contact' });
      return null;
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
    addSponsor,
    addSponsee,
    addSponsorContact,
    addSponseeContact,
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