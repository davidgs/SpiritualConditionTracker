/**
 * Centralized Database Service
 * Handles all SQLite operations with proper initialization and error handling
 */

import initSQLiteDatabase from '../utils/sqliteLoader';
import { cleanupBrokenActivities } from '../utils/sqliteLoader';
import type { User, Activity, Meeting } from '../types/database';

export type DatabaseStatus = 'initializing' | 'ready' | 'error' | 'fallback';

export interface DatabaseOperation {
  id: string;
  operation: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

class DatabaseService {
  private static instance: DatabaseService;
  private status: DatabaseStatus = 'initializing';
  private database: any = null;
  private operationQueue: DatabaseOperation[] = [];
  private statusCallbacks: ((status: DatabaseStatus) => void)[] = [];
  private initializationPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Reset the initialization state (needed after database reset)
   */
  resetInitialization(): void {
    this.initializationPromise = null;
    this.database = null;
    this.setStatus('initializing');
  }

  /**
   * Initialize the database service
   */
  async initialize(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._performInitialization();
    return this.initializationPromise;
  }

  private async _performInitialization(): Promise<void> {
    try {
      console.log('[ DatabaseService: 50 ] Starting database initialization...');
      this.setStatus('initializing');

      // Initialize SQLite database
      const sqliteDb = await initSQLiteDatabase();
      console.log('[ DatabaseService: 55 ] SQLite database initialized successfully');

      // Verify database is accessible
      if (!window.db || !window.db.getAll) {
        throw new Error('Database interface not properly initialized: 59');
      }

      // Clean up any broken data
      console.log('[ DatabaseService: 63 ] Running database cleanup...');
      await cleanupBrokenActivities();

      // Store database reference
      this.database = window.db;
      this.setStatus('ready');

      console.log('[ DatabaseService: 70 ] Database initialization complete');

      // Process any queued operations
      await this.processOperationQueue();

    } catch (error) {
      console.error('[ DatabaseService: 76 ] Database initialization failed:', error);
      this.setStatus('error');
      throw error; // Don't use localStorage fallback in native app
    }
  }

  /**
   * Set up localStorage fallback when SQLite fails
   */
  private async setupFallbackDatabase(): Promise<void> {
    console.log('[ DatabaseService: 86 ] Setting up localStorage fallback...');
    
    this.database = {
      getAll: async (collection: string) => {
        try {
          return JSON.parse(localStorage.getItem(collection) || '[]');
        } catch (e) {
          console.error(`[ DatabaseService: 93 ] Error getting ${collection} from localStorage:`, e);
          return [];
        }
      },
      add: async (collection: string, item: any) => {
        try {
          const items = JSON.parse(localStorage.getItem(collection) || '[]');
          if (!item.id) {
            item.id = `${collection}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          }
          item.createdAt = item.createdAt || new Date().toISOString();
          item.updatedAt = new Date().toISOString();
          items.push(item);
          localStorage.setItem(collection, JSON.stringify(items));
          return item;
        } catch (e) {
          console.error(`[DatabaseService: 109 ] Error adding to ${collection} in localStorage:`, e);
          throw e;
        }
      },
      update: async (collection: string, id: string | number, updates: any) => {
        try {
          const items = JSON.parse(localStorage.getItem(collection) || '[]');
          const index = items.findIndex((item: any) => item.id === id);
          if (index !== -1) {
            items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
            localStorage.setItem(collection, JSON.stringify(items));
            return items[index];
          }
          return null;
        } catch (e) {
          console.error(`[DatabaseService: 124 ] Error updating ${collection} in localStorage:`, e);
          throw e;
        }
      },
      remove: async (collection: string, id: string | number) => {
        try {
          const items = JSON.parse(localStorage.getItem(collection) || '[]');
          const filteredItems = items.filter((item: any) => item.id !== id);
          localStorage.setItem(collection, JSON.stringify(filteredItems));
          return true;
        } catch (e) {
          console.error(`[ DatabaseService: 135 ] Error removing from ${collection} in localStorage:`, e);
          throw e;
        }
      }
    };

    // Set global reference for backward compatibility
    window.db = this.database;
    window.dbInitialized = true;
  }

  /**
   * Subscribe to database status changes
   */
  onStatusChange(callback: (status: DatabaseStatus) => void): () => void {
    this.statusCallbacks.push(callback);
    
    // Call immediately with current status
    callback(this.status);
    
    // Return unsubscribe function
    return () => {
      const index = this.statusCallbacks.indexOf(callback);
      if (index > -1) {
        this.statusCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get current database status
   */
  getStatus(): DatabaseStatus {
    return this.status;
  }

  /**
   * Check if database is ready for operations
   */
  isReady(): boolean {
    return this.status === 'ready' || this.status === 'fallback';
  }

  /**
   * Set database status and notify callbacks
   */
  private setStatus(status: DatabaseStatus): void {
    this.status = status;
    this.statusCallbacks.forEach(callback => callback(status));
  }

  /**
   * Queue an operation to be executed when database is ready
   */
  private queueOperation<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const operationId = `op_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      this.operationQueue.push({
        id: operationId,
        operation,
        resolve,
        reject
      });
    });
  }

  /**
   * Process all queued operations
   */
  private async processOperationQueue(): Promise<void> {
    console.log(`[ DatabaseService: 205 ] Processing ${this.operationQueue.length} queued operations`);
    
    while (this.operationQueue.length > 0) {
      const operation = this.operationQueue.shift();
      if (operation) {
        try {
          const result = await operation.operation();
          operation.resolve(result);
        } catch (error) {
          console.error('[ DatabaseService: 214 ] Queued operation failed:', error);
          operation.reject(error);
        }
      }
    }
  }

  /**
   * Execute a database operation (queue if not ready)
   */
  async executeOperation<T>(operation: () => Promise<T>): Promise<T> {
    if (this.isReady()) {
      return operation();
    } else {
      return this.queueOperation(operation);
    }
  }

  // Database operation methods

  async getAllUsers(): Promise<User[]> {
    return this.executeOperation(async () => {
      const users = await this.database.getAll('users');
      return users || [];
    });
  }

  async addUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    return this.executeOperation(async () => {
      return await this.database.add('users', user);
    });
  }

  async updateUser(id: string | number, updates: Partial<User>): Promise<User | null> {
    return this.executeOperation(async () => {
      return await this.database.update('users', id, updates);
    });
  }

  async getAllActivities(): Promise<Activity[]> {
    return this.executeOperation(async () => {
      const activities = await this.database.getAll('activities');
      return activities || [];
    });
  }

  async addActivity(activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>): Promise<Activity> {
    return this.executeOperation(async () => {
      console.log('[ DatabaseService.ts:261 addActivity ] Received activity:', JSON.stringify(activity, null, 2));
      console.log('[ DatabaseService.ts:262 addActivity ] Calling this.database.add...');
      
      const result = await this.database.add('activities', activity);
      
      console.log('[ DatabaseService.ts:266 addActivity ] this.database.add returned:', JSON.stringify(result, null, 2));
      return result;
    });
  }

  async getAllMeetings(): Promise<Meeting[]> {
    return this.executeOperation(async () => {
      const meetings = await this.database.getAll('meetings');
      return meetings || [];
    });
  }

  async addMeeting(meeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>): Promise<Meeting> {
    return this.executeOperation(async () => {
      return await this.database.add('meetings', meeting);
    });
  }

  async updateMeeting(id: string | number, updates: Partial<Meeting>): Promise<Meeting | null> {
    return this.executeOperation(async () => {
      return await this.database.update('meetings', id, updates);
    });
  }

  async deleteMeeting(meetingId: string | number): Promise<boolean> {
    return this.executeOperation(async () => {
      return await this.database.remove('meetings', meetingId);
    });
  }
}

export default DatabaseService;