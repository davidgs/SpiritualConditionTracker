/**
 * TypeScript interfaces for database entities
 * Strict typing to prevent data structure issues
 */

// Contact types enum for strict validation
export type ContactType = 'phone' | 'in-person' | 'video' | 'text' | 'email' | 'other';

// Activity types enum
export type ActivityType = 'prayer' | 'meditation' | 'reading' | 'meeting' | 'service' | 'inventory' | 'amends' | 'sponsor-contact' | 'action-item' | 'other';

// Base interface for database entities
export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt?: string;
}

// Sponsor interface for the sponsor entity
export interface SponsorData {
  name: string;
  lastName: string;
  phone: string;
  email: string;
  sobrietyDate: string;
  notes: string;
}

// User interface
export interface User extends BaseEntity {
  name: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  sobrietyDate: string;
  homeGroups: string[];
  privacySettings: {
    allowMessages: boolean;
    shareLastName: boolean;
  };
  preferences: {
    use24HourFormat: boolean;
  };
  // Sponsor fields (optional)
  sponsor_name?: string;
  sponsor_lastName?: string;
  sponsor_phone?: string;
  sponsor_email?: string;
  sponsor_sobrietyDate?: string;
  sponsor_notes?: string;
}

// Sponsor Contact interface
export interface SponsorContact extends BaseEntity {
  userId: string;
  type: ContactType;
  date: string;
  note: string;
}

// Action Item interface
export interface ActionItem extends BaseEntity {
  title: string;
  text: string;
  notes: string;
  dueDate: string | null;
  completed: 0 | 1; // SQLite boolean as integer
  type: 'todo' | 'action' | 'reminder';
}

// Join table for sponsor contacts and action items
export interface SponsorContactActionItem extends BaseEntity {
  contactId: number;
  actionItemId: number;
}

// Activity interface
export interface Activity extends BaseEntity {
  type: ActivityType;
  date: string;
  notes?: string;
  duration?: number; // minutes
  location?: string;
}

// Meeting interface
export interface Meeting extends BaseEntity {
  name: string;
  location: string;
  time: string;
  dayOfWeek: string;
  meetingType: string;
  locationType: 'in_person' | 'online' | 'hybrid';
  notes?: string;
}

// Contact Details (legacy table for backward compatibility)
export interface ContactDetail extends BaseEntity {
  contactId: number;
  actionItem: string;
  completed: 0 | 1;
  notes: string;
  dueDate: string | null;
  type: string;
  text: string;
}

// Database interface for window.db
export interface DatabaseInterface {
  schemaVersion: string;
  
  // CRUD operations
  getAll<T>(collection: string): Promise<T[]>;
  getById<T>(collection: string, id: number): Promise<T | null>;
  add<T extends Partial<BaseEntity>>(collection: string, item: T): Promise<T & BaseEntity>;
  update<T>(collection: string, id: number, updates: Partial<T>): Promise<T | null>;
  remove(collection: string, id: number): Promise<boolean>;
  query<T>(collection: string, predicate: (item: T) => boolean): Promise<T[]>;
  
  // Calculation functions
  calculateSobrietyDays(sobrietyDate: string): number;
  calculateSobrietyYears(sobrietyDate: string, decimalPlaces?: number): number;
  calculateSpiritualFitness(): Promise<number>;
  calculateSpiritualFitnessWithTimeframe(timeframe?: number): Promise<number>;
  
  // Preferences
  getPreference<T>(key: string): Promise<T | null>;
  setPreference<T>(key: string, value: T): Promise<void>;
}

// Extend Window interface to include our database
declare global {
  interface Window {
    db?: DatabaseInterface;
    dbInitialized?: boolean;
    Capacitor?: any;
    DEFAULT_SPIRITUAL_FITNESS_SCORE?: number;
  }
}

// Form data interfaces
export interface ContactFormData {
  type: ContactType;
  date: string;
  note: string;
}

export interface ActionItemFormData {
  id?: number; // Optional for new items
  title: string;
  text: string;
  notes: string;
  dueDate: string | null;
  completed: boolean;
  deleted?: boolean;
  type: 'todo' | 'action' | 'reminder';
}

// Component prop interfaces
export interface SponsorContactFormProps {
  open: boolean;
  userId: string;
  onSubmit: (contact: Omit<SponsorContact, 'id' | 'createdAt' | 'updatedAt'>, actionItems: ActionItemFormData[]) => void;
  onClose: () => void;
  initialData?: Partial<SponsorContact>;
  details?: ContactDetail[];
}

export interface SponsorContactDetailsProps {
  contact: SponsorContact;
  details?: ContactDetail[];
  onBack: () => void;
  onSaveDetails: (detail: ContactDetail) => void;
  onUpdateContact: (contact: SponsorContact) => void;
  onDeleteContact: (contactId: number) => void;
  onDeleteDetail: (detailId: number) => void;
}