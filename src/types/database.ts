/**
 * TypeScript interfaces for database entities
 * Comprehensive type definitions matching SQLite schema
 * Last Updated: June 29, 2025
 */

// Contact types enum for strict validation
export type ContactType = 'phone' | 'in-person' | 'video' | 'text' | 'email' | 'other';

// Activity types - matches activities table type column constraints
export type ActivityType = 'prayer' | 'meditation' | 'literature' | 'meeting' | 'service' | 'call' | 'journaling' | 'sponsor-contact' | 'sponsee-contact' | 'action-item' | 'sponsor_action_item' | 'sponsee_action_item' | 'todo' | 'other';

// Action item types
export type ActionItemType = 'todo' | 'action' | 'reminder' | 'sponsor_action_item' | 'sponsee_action_item';

// Meeting format types
export type MeetingFormat = 'discussion' | 'speaker' | 'mens' | 'womens' | 'young_people' | 'beginners' | 'big_book' | 'step_study' | 'literature';

// Meeting location types
export type LocationType = 'in_person' | 'online' | 'hybrid';

// Meeting access types
export type AccessType = 'open' | 'closed';

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
  phoneNumber: string;
  email: string;
  sobrietyDate: string;
  notes: string;
}

// Sponsee interface for the sponsee entity
export interface SponseeData {
  name: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  sobrietyDate: string;
  notes: string;
}

// User interface - matches users table schema exactly
export interface User extends BaseEntity {
  name: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  sobrietyDate: string;
  homeGroups: string[]; // JSON parsed from TEXT column
  privacySettings: {
    allowMessages: boolean;
    shareLastName: boolean;
  }; // JSON parsed from TEXT column
  preferences: {
    use24HourFormat: boolean;
    darkMode: boolean;
    theme: string;
  }; // JSON parsed from TEXT column
  isDarkMode?: number; // SQLite boolean as integer (0 or 1), optional for compatibility
  // Sponsor fields from users table
  sponsor_name?: string;
  sponsor_lastName?: string;
  sponsor_phone?: string;
  sponsor_email?: string;
  sponsor_sobrietyDate?: string;
  sponsor_notes?: string;
}

// Legacy SponsorContact interface (keeping for backward compatibility)
export interface LegacySponsorContact extends BaseEntity {
  userId: string;
  type: ContactType;
  date: string;
  note: string;
}

// Action Item interface - matches action_items table schema exactly from tables.ts
export interface ActionItem extends BaseEntity {
  title: string;
  text?: string;
  notes?: string;
  dueDate?: string;
  completed: number; // Default 0, SQLite boolean as integer
  deleted: number; // Default 0, SQLite boolean as integer for soft deletion
  type: ActionItemType; // Default 'action'
  sponsorContactId?: number; // Foreign key to sponsor_contacts.id
  sponseeContactId?: number; // Foreign key to sponsee_contacts.id
  contactId?: number; // Foreign key to contact (general)
  sponsorId?: number;
  sponsorName?: string;
  sponseeId?: number;
  sponseeName?: string;
  // NOTE: No userId field - action items are linked via contacts, not directly to users
}

// Sponsors table interface - matches sponsors table schema exactly  
export interface Sponsor extends BaseEntity {
  userId: string; // References current user, defaults to 'default_user'
  name?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  sobrietyDate?: string;
  notes?: string;
  sponsorType: string; // Default 'sponsor'
}

// Sponsees table interface - matches sponsees table schema exactly
export interface Sponsee extends BaseEntity {
  userId: string; // References current user, defaults to 'default_user'
  name?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  sobrietyDate?: string;
  notes?: string;
  sponseeType: string; // Default 'sponsee'
}

// Sponsor Contacts table interface - matches sponsor_contacts table schema exactly
export interface SponsorContact extends BaseEntity {
  userId: string;
  sponsorId?: number; // Foreign key to sponsors.id
  type: string; // Contact type as string in database
  date: string;
  note?: string;
  topic?: string;
  duration?: number;
}

// Sponsee Contacts table interface - matches sponsee_contacts table schema exactly
export interface SponseeContact extends BaseEntity {
  userId: string;
  sponseeId: number; // Foreign key to sponsees.id - required
  type: string;
  date: string;
  note?: string;
  topic?: string;
  duration?: number;
}

// Activity interface - matches activities table schema exactly
export interface Activity extends BaseEntity {
  userId: string;
  type: ActivityType;
  title?: string; // Added to match schema
  text?: string; // Added to match schema
  date: string;
  notes?: string;
  duration: number; // Default 0 in schema, so not optional
  location?: string;
  meetingName?: string;
  meetingId?: number;
  wasChair: number; // Default 0, SQLite boolean as integer
  wasShare: number; // Default 0, SQLite boolean as integer
  wasSpeaker: number; // Default 0, SQLite boolean as integer
  literatureTitle?: string;
  isSponsorCall: number; // Default 0, SQLite boolean as integer
  isSponseeCall: number; // Default 0, SQLite boolean as integer
  isAAMemberCall: number; // Default 0, SQLite boolean as integer
  callType?: string;
  stepNumber?: number;
  personCalled?: string;
  serviceType?: string;
  completed: number; // Default 0, SQLite boolean as integer
  actionItemId?: number;
  sponsorContactId?: number;
  sponseeContactId?: number;
  sponsorId?: number;
  sponseeId?: number;
  // Runtime enrichment fields (not in database schema)
  actionItemData?: ActionItem;
  sponsorName?: string;
  sponseeName?: string;
  name?: string; // Generic name field for activities
}
// Meeting schedule item interface
export interface MeetingScheduleItem {
  day: string;
  time: string;
  format: MeetingFormat;
  locationType: LocationType;
  access: AccessType;
}

// Meeting interface - matches meetings table schema exactly
export interface Meeting extends BaseEntity {
  name?: string;
  days?: string; // JSON string, parsed to string[]
  time?: string;
  schedule?: string; // JSON string, parsed to MeetingScheduleItem[]
  address?: string;
  locationName?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  coordinates?: string;
  phoneNumber?: string;
  onlineUrl?: string;
  isHomeGroup: number; // Default 0, SQLite boolean as integer
  types?: string; // JSON string, parsed to string[]
}


// Contact interface for sponsor/sponsee contacts
export interface Contact extends BaseEntity {
  name?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  note?: string;
  topic?: string;
  type: string;
  date: string;
  duration?: number;
  sponsorId?: number;
  sponseeId?: number;
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

// Database operation utility types
export type InsertUser = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateUser = Partial<InsertUser>;

export type InsertActivity = Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateActivity = Partial<InsertActivity>;

export type InsertMeeting = Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateMeeting = Partial<InsertMeeting>;

export type InsertActionItem = Omit<ActionItem, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateActionItem = Partial<InsertActionItem>;

export type InsertSponsor = Omit<Sponsor, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateSponsor = Partial<InsertSponsor>;

export type InsertSponsee = Omit<Sponsee, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateSponsee = Partial<InsertSponsee>;

export type InsertSponsorContact = Omit<SponsorContact, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateSponsorContact = Partial<InsertSponsorContact>;

export type InsertSponseeContact = Omit<SponseeContact, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateSponseeContact = Partial<InsertSponseeContact>;

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
  type: ActionItemType;
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