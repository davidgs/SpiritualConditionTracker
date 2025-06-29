# Contacts Table Consolidation Proposal

## Current Problem
We have **2 separate contact tables** (`sponsor_contacts`, `sponsee_contacts`) but need to track contacts with:
- Sponsors
- Sponsees  
- Other AA members (not sponsors/sponsees)
- Service contacts
- General recovery community members

This creates maintenance overhead and requires complex queries across multiple tables.

## Proposed Unified Architecture with Address Book

### 1. People Table (Address Book)
```sql
CREATE TABLE IF NOT EXISTS people (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT DEFAULT 'default_user',
  firstName TEXT NOT NULL,
  lastName TEXT,
  phoneNumber TEXT,
  email TEXT,
  sobrietyDate TEXT,
  homeGroup TEXT,
  notes TEXT,
  relationship TEXT, -- 'sponsor', 'sponsee', 'member', 'friend', 'family'
  isActive INTEGER DEFAULT 1,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Contacts Table (Interaction Records)
```sql
CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT DEFAULT 'default_user',
  personId INTEGER NOT NULL, -- References people.id
  contactType TEXT NOT NULL, -- 'call', 'meeting', 'coffee', 'text', 'service'
  date TEXT NOT NULL,
  note TEXT,
  topic TEXT,
  duration INTEGER DEFAULT 0,
  location TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (personId) REFERENCES people(id)
);
```

### 3. Simplified Sponsors/Sponsees Tables
```sql
-- Sponsors table now just references people
CREATE TABLE IF NOT EXISTS sponsors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT DEFAULT 'default_user',
  personId INTEGER NOT NULL, -- References people.id
  startDate TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'former'
  notes TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (personId) REFERENCES people(id)
);

-- Sponsees table now just references people
CREATE TABLE IF NOT EXISTS sponsees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT DEFAULT 'default_user',
  personId INTEGER NOT NULL, -- References people.id
  startDate TEXT,
  status TEXT DEFAULT 'active',
  notes TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (personId) REFERENCES people(id)
);
```

## Benefits of Unified Architecture with Address Book

### 1. **Complete Contact Management**
- **Address Book**: Store all contact info (name, phone, email, sobriety date) in `people` table
- **Interaction History**: Track all communications in `contacts` table
- **Relationship Tracking**: sponsors/sponsees reference people with relationship status
- **Unified Experience**: One place to manage all recovery community contacts

### 2. **Powerful Queries**
```sql
-- All people in address book
SELECT * FROM people WHERE isActive = 1 ORDER BY firstName;

-- All sponsors with their contact info
SELECT p.*, s.startDate, s.status 
FROM people p 
JOIN sponsors s ON p.id = s.personId 
WHERE s.status = 'active';

-- Contact history with a specific person
SELECT c.*, p.firstName, p.lastName 
FROM contacts c 
JOIN people p ON c.personId = p.id 
WHERE p.id = ? 
ORDER BY c.date DESC;

-- All interactions this month
SELECT c.*, p.firstName, p.lastName, p.relationship
FROM contacts c 
JOIN people p ON c.personId = p.id 
WHERE c.date >= date('now', 'start of month');
```

### 3. **Address Book Features**
- **Search contacts** by name, phone, email
- **Filter by relationship** (sponsor, sponsee, member, friend)
- **Track sobriety dates** for anniversary reminders
- **Store home group** information
- **Notes and relationship status**
- **Active/inactive status** for people who've moved, etc.

### 3. **Simplified Action Items**
```sql
-- Action items table becomes simpler
CREATE TABLE IF NOT EXISTS action_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  text TEXT,
  notes TEXT,
  dueDate TEXT,
  completed INTEGER DEFAULT 0,
  deleted INTEGER DEFAULT 0,
  type TEXT DEFAULT 'action',
  contactId INTEGER, -- Single foreign key to contacts.id
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contactId) REFERENCES contacts(id)
);
```

### 4. **Single Source of Truth**
- One table to maintain
- Consistent schema across all contact types
- Single join for enriching activities with contact data
- Unified sorting and filtering logic

## Migration Strategy

### Phase 1: Create New Table
1. Create unified `contacts` table
2. Keep existing tables during transition

### Phase 2: Migrate Data
```sql
-- Migrate sponsor contacts
INSERT INTO contacts (userId, contactType, relatedPersonId, relatedPersonName, type, date, note, topic, duration, createdAt, updatedAt)
SELECT sc.userId, 'sponsor', sc.sponsorId, 
       COALESCE(s.name || ' ' || SUBSTR(s.lastName, 1, 1) || '.', 'Sponsor'), 
       sc.type, sc.date, sc.note, sc.topic, sc.duration, sc.createdAt, sc.updatedAt
FROM sponsor_contacts sc
LEFT JOIN sponsors s ON sc.sponsorId = s.id;

-- Migrate sponsee contacts  
INSERT INTO contacts (userId, contactType, relatedPersonId, relatedPersonName, type, date, note, topic, duration, createdAt, updatedAt)
SELECT sc.userId, 'sponsee', sc.sponseeId,
       COALESCE(s.name || ' ' || SUBSTR(s.lastName, 1, 1) || '.', 'Sponsee'),
       sc.type, sc.date, sc.note, sc.topic, sc.duration, sc.createdAt, sc.updatedAt  
FROM sponsee_contacts sc
LEFT JOIN sponsees s ON sc.sponseeId = s.id;
```

### Phase 3: Update Application Code
- Update DatabaseService methods
- Update AppDataContext loading logic
- Update UI components to use unified contacts
- Update action item creation/management

### Phase 4: Remove Old Tables
- Drop `sponsor_contacts` and `sponsee_contacts` tables
- Clean up related code

## Impact on Application Architecture

### DatabaseService Changes
```typescript
// Unified methods instead of separate ones
async getAllContacts(contactType?: string): Promise<Contact[]>
async getContactsByType(type: 'sponsor' | 'sponsee' | 'member' | 'service'): Promise<Contact[]>
async addContact(contact: InsertContact): Promise<Contact>
```

### AppDataContext Simplification
- Single contacts loading method
- Unified filtering and sorting logic
- Simplified activity enrichment

### UI Benefits
- Single contact list component
- Unified contact creation flow
- Consistent contact display logic
- Easier search across all contacts

## UI Features Enabled

### Address Book Screen
- **Contact List**: Alphabetical list of all people with photos, names, relationships
- **Search Bar**: Search by name, phone number, or home group
- **Filter Tabs**: All | Sponsors | Sponsees | Members | Friends | Family
- **Quick Actions**: Call, text, email directly from address book
- **Add Contact**: Simple form for new people

### Contact Detail Screen  
- **Personal Info**: Name, phone, email, sobriety date, home group
- **Relationship Status**: Current sponsor/sponsee status with dates
- **Interaction History**: Timeline of all contacts (calls, meetings, etc.)
- **Action Items**: Linked action items from this person
- **Quick Contact**: One-tap call/text/email buttons

### Enhanced Activity List
- **Rich Contact Display**: "Called John S. (Sponsor)" instead of generic contact
- **Person Photos**: Profile pictures in activity timeline
- **Contact Context**: See relationship and last contact date
- **Quick Follow-up**: Create action items directly from activity

## Future Extensibility

With unified people + contacts architecture, easily add:
- **Anniversary Reminders**: Track sobriety dates for congratulations
- **Contact Frequency Goals**: "Call sponsor 3x per week" tracking
- **Group Contacts**: Home group member directory
- **Emergency Contacts**: Quick access to key people
- **Professional Contacts**: Therapists, doctors, treatment center staff
- **Family Contacts**: Recovery-supportive family members

All without additional tables or complex schema changes.

## Migration Benefits

### Data Consolidation
- **Eliminate duplicate names** across sponsor/sponsee tables
- **Single contact info** per person (no sync issues)
- **Relationship history** (former sponsors, moved sponsees)
- **Complete interaction timeline** per person

### Performance Improvements  
- **Fewer JOIN operations** for contact enrichment
- **Better indexing** on single people table
- **Reduced data duplication** and storage needs
- **Faster contact lookups** and searches