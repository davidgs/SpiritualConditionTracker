# Contacts Table Consolidation Proposal

## Current Problem
We have **2 separate contact tables** (`sponsor_contacts`, `sponsee_contacts`) but need to track contacts with:
- Sponsors
- Sponsees  
- Other AA members (not sponsors/sponsees)
- Service contacts
- General recovery community members

This creates maintenance overhead and requires complex queries across multiple tables.

## Proposed Unified Contacts Table

```sql
CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT DEFAULT 'default_user',
  contactType TEXT NOT NULL, -- 'sponsor', 'sponsee', 'member', 'service'
  relatedPersonId INTEGER, -- References sponsors.id, sponsees.id, or NULL for general members
  relatedPersonName TEXT, -- Cached name for performance
  type TEXT NOT NULL, -- 'call', 'meeting', 'coffee', 'text', etc.
  date TEXT NOT NULL,
  note TEXT,
  topic TEXT,
  duration INTEGER DEFAULT 0,
  location TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);
```

## Benefits of Unified Table

### 1. **Supports All Contact Types**
- **Sponsor contacts**: `contactType='sponsor'`, `relatedPersonId` references `sponsors.id`  
- **Sponsee contacts**: `contactType='sponsee'`, `relatedPersonId` references `sponsees.id`
- **AA member contacts**: `contactType='member'`, `relatedPersonId=NULL`, store name in `relatedPersonName`
- **Service contacts**: `contactType='service'`, `relatedPersonId=NULL`

### 2. **Simplified Queries**
```sql
-- All contacts
SELECT * FROM contacts ORDER BY date DESC;

-- Only sponsor contacts  
SELECT * FROM contacts WHERE contactType = 'sponsor';

-- Only sponsee contacts
SELECT * FROM contacts WHERE contactType = 'sponsee';

-- All relationship contacts (sponsors + sponsees)
SELECT * FROM contacts WHERE contactType IN ('sponsor', 'sponsee');

-- General AA member contacts
SELECT * FROM contacts WHERE contactType = 'member';
```

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

## Future Extensibility

With unified contacts table, easily add:
- **Home group contacts**: `contactType='homegroup'`
- **Treatment center contacts**: `contactType='treatment'`
- **Therapist contacts**: `contactType='professional'`
- **Family contacts**: `contactType='family'`

All without additional tables or complex schema changes.