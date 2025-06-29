/**
 * TypeScript interfaces for database entities
 * Comprehensive type definitions matching SQLite schema
 * Last Updated: June 29, 2025
 */

// Contact types enum for strict validation
export type ContactType = 'phone' | 'in-person' | 'video' | 'text' | 'email' | 'other';

// Activity types - matches activities table type column constraints
export type ActivityType = 'prayer' | 'meditation' | 'literature' | 'meeting' | 'service' | 'call' | 'journaling' | 'sponsor-contact' | 'sponsee-contact' | 'action-item' | 'Action_item' | 'sponsor_action_item' | 'sponsee_action_item' | 'todo' | 'other';

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

// User preferences and privacy settings interfaces
export interface UserPreferences {
  use24HourFormat: boolean;
  darkMode: boolean;
  theme: string;
}

export interface PrivacySettings {
  allowMessages: boolean;
  shareLastName: boolean;
}

// User interface - matches users table schema exactly
export interface User extends BaseEntity {
  name: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  sobrietyDate: string;
  homeGroups: string; // JSON string stored in database, parsed to string[]
  preferences: string; // JSON string stored in database, parsed to UserPreferences
  privacySettings: string; // JSON string stored in database, parsed to PrivacySettings
}

// Parsed user interface for application use (with JSON fields parsed)
export interface ParsedUser extends Omit<User, 'homeGroups' | 'preferences' | 'privacySettings'> {
  homeGroups: string[];
  preferences: UserPreferences;
  privacySettings: PrivacySettings;
}

// Legacy SponsorContact interface (keeping for backward compatibility)
export interface LegacySponsorContact extends BaseEntity {
  userId: string;
  type: ContactType;
  date: string;
  note: string;
}

// Action Item interface - simplified for unified contact architecture
export interface ActionItem extends BaseEntity {
  title: string;
  text?: string;
  notes?: string;
  dueDate?: string;
  completed: number; // Default 0, SQLite boolean as integer
  deleted: number; // Default 0, SQLite boolean as integer for soft deletion
  type: ActionItemType; // Default 'action'
  contactId?: number; // Foreign key to contacts.id
  personId?: number; // Foreign key to people.id (for direct person association)
  // NOTE: No userId field - action items are linked via contacts/people, not directly to users
}

// People table interface - unified address book for all contacts
export interface Person extends BaseEntity {
  userId: string;
  firstName: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  sobrietyDate?: string;
  homeGroup?: string;
  notes?: string;
  relationship?: string; // 'sponsor', 'sponsee', 'member', 'friend', 'family', 'professional'
  isActive: number; // Default 1, SQLite boolean as integer
}

// Contacts table interface - unified interaction records
export interface Contact extends BaseEntity {
  userId: string;
  personId: number; // Foreign key to people.id
  contactType: string; // 'call', 'meeting', 'coffee', 'text', 'service'
  date: string;
  note?: string;
  topic?: string;
  duration?: number; // Default 0
  location?: string;
}

// Sponsors table interface - simplified to reference people
export interface Sponsor extends BaseEntity {
  userId: string;
  personId: number; // Foreign key to people.id
  startDate?: string;
  status: string; // Default 'active', values: 'active', 'former'
  notes?: string;
}

// Sponsees table interface - simplified to reference people
export interface Sponsee extends BaseEntity {
  userId: string;
  personId: number; // Foreign key to people.id
  startDate?: string;
  status: string; // Default 'active'
  notes?: string;
}

// Legacy interfaces for backward compatibility (to be removed after migration)
export interface SponsorContact extends BaseEntity {
  userId: string;
  sponsorId?: number;
  type: string;
  date: string;
  note?: string;
  topic?: string;
  duration?: number;
}

export interface SponseeContact extends BaseEntity {
  userId: string;
  sponseeId: number;
  type: string;
  date: string;
  note?: string;
  topic?: string;
  duration?: number;
}

// Activity interface - cleaned up to match proper table structure
export interface Activity extends BaseEntity {
  userId: string;
  type: ActivityType;
  title?: string;
  text?: string;
  date: string;
  notes?: string;
  duration: number; // Default 0 in schema, so not optional
  location?: string;
  // Meeting-specific fields (when type='meeting')
  meetingName?: string;
  meetingId?: number;
  wasChair: number; // Default 0, SQLite boolean as integer
  wasShare: number; // Default 0, SQLite boolean as integer
  wasSpeaker: number; // Default 0, SQLite boolean as integer
  // Literature-specific fields (when type='literature')
  literatureTitle?: string;
  stepNumber?: number;
  // Service-specific fields (when type='service')
  serviceType?: string;
  
  // Runtime enrichment fields (added by AppDataContext, not in database schema)
  // These are used when activities represent contacts or action items
  actionItemData?: ActionItem;
  sponsorName?: string;
  sponseeName?: string;
  sponsorContactId?: number;
  sponseeContactId?: number;
  actionItemId?: number;
  completed?: number; // For action items
  personCalled?: string; // For contact activities
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


// Legacy Contact interface (to be removed after migration)
export interface LegacyContact extends BaseEntity {
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

// Database operation utility types with proper JSON handling
export type InsertUser = Omit<User, 'id' | 'createdAt' | 'updatedAt'>; // Uses string types for JSON fields
export type UpdateUser = Partial<InsertUser>;

// Helper type for creating users with parsed types
export type CreateUserData = {
  name: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  sobrietyDate: string;
  homeGroups?: string[]; // Will be JSON.stringify'd
  preferences?: UserPreferences; // Will be JSON.stringify'd
  privacySettings?: PrivacySettings; // Will be JSON.stringify'd
};

export type InsertActivity = Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateActivity = Partial<InsertActivity>;

export type InsertMeeting = Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateMeeting = Partial<InsertMeeting>;

export type InsertActionItem = Omit<ActionItem, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateActionItem = Partial<InsertActionItem>;

// New unified types
export type InsertPerson = Omit<Person, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdatePerson = Partial<InsertPerson>;

export type InsertContact = Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateContact = Partial<InsertContact>;

export type InsertSponsor = Omit<Sponsor, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateSponsor = Partial<InsertSponsor>;

export type InsertSponsee = Omit<Sponsee, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateSponsee = Partial<InsertSponsee>;

// Legacy types for backward compatibility (to be removed after migration)
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