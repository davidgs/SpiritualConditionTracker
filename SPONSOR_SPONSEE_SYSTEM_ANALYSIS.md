# Sponsor/Sponsee Contact and Action Item System Analysis

## Current System Requirements

### 1. Sponsors
- **a)** Sponsor contact calls show up on the appropriate page for the named sponsor and are stored in the `sponsor_contacts` table
- **b)** Sponsor Action items show up on the contact card for the call they were associated with and are stored in the `action_items` table
- **c)** Sponsor calls show up in the Activity Log and are counted towards the Spiritual Fitness score
- **d)** Sponsor Action items show up in the Activity logs and are counted towards Spiritual Fitness score

### 2. Sponsees
- **a)** Sponsee contact calls show up on the appropriate page for the named sponsee and are stored in the `sponsee_contacts` table
- **b)** Sponsee Action items show up on the contact card for the call they were associated with and are stored in the `action_items` table
- **c)** Sponsee calls show up in the activity log and count towards the Spiritual Fitness score
- **d)** Sponsee Action items DO NOT show up in the Activity log and do NOT count towards the Spiritual Fitness Score

## Database Tables and Schema

### Sponsors Table (`sponsors`)
```sql
CREATE TABLE IF NOT EXISTS sponsors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT DEFAULT 'default_user',           -- ⚠️ TEXT TYPE
  name TEXT,
  lastName TEXT,
  phoneNumber TEXT,
  email TEXT,
  sobrietyDate TEXT,
  notes TEXT,
  sponsorType TEXT DEFAULT 'sponsor',
  createdAt TEXT,
  updatedAt TEXT
)
```

### Sponsees Table (`sponsees`)
```sql
CREATE TABLE IF NOT EXISTS sponsees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT DEFAULT 'default_user',           -- ⚠️ TEXT TYPE
  name TEXT,
  lastName TEXT,
  phoneNumber TEXT,
  email TEXT,
  sobrietyDate TEXT,
  notes TEXT,
  sponseeType TEXT DEFAULT 'sponsee',
  createdAt TEXT,
  updatedAt TEXT
)
```

### Sponsor Contacts Table (`sponsor_contacts`)
```sql
CREATE TABLE IF NOT EXISTS sponsor_contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT DEFAULT 'default_user',
  sponsorId INTEGER,                            -- ⚠️ INTEGER TYPE - MISMATCH
  date TEXT,
  type TEXT DEFAULT 'general',
  note TEXT DEFAULT '',
  topic TEXT,
  duration INTEGER,
  createdAt TEXT,
  updatedAt TEXT
)
```

### Sponsee Contacts Table (`sponsee_contacts`)
```sql
CREATE TABLE IF NOT EXISTS sponsee_contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT DEFAULT 'default_user',
  sponseeId INTEGER,                            -- ⚠️ INTEGER TYPE - MISMATCH
  date TEXT,
  type TEXT DEFAULT 'general',
  note TEXT DEFAULT '',
  topic TEXT,
  duration INTEGER,
  createdAt TEXT,
  updatedAt TEXT
)
```

### Action Items Table (`action_items`)
```sql
CREATE TABLE IF NOT EXISTS action_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contactId INTEGER,
  title TEXT,
  text TEXT,
  notes TEXT,
  dueDate TEXT,
  completed INTEGER DEFAULT 0,
  deleted INTEGER DEFAULT 0,
  type TEXT DEFAULT 'todo',
  sponsorId INTEGER,                            -- ⚠️ INTEGER TYPE - MISMATCH
  sponsorName TEXT,
  sponseeId INTEGER,                            -- ⚠️ INTEGER TYPE - MISMATCH
  sponseeName TEXT,
  createdAt TEXT,
  updatedAt TEXT
)
```

### Activities Table (`activities`)
```sql
CREATE TABLE IF NOT EXISTS activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  date TEXT,
  notes TEXT,
  location TEXT,
  duration INTEGER,
  meetingName TEXT,
  meetingId INTEGER,
  wasChair INTEGER DEFAULT 0,
  wasShare INTEGER DEFAULT 0,
  wasSpeaker INTEGER DEFAULT 0,
  literatureTitle TEXT,
  isSponsorCall INTEGER DEFAULT 0,
  isSponseeCall INTEGER DEFAULT 0,
  isAAMemberCall INTEGER DEFAULT 0,
  callType TEXT,
  stepNumber INTEGER,
  personCalled TEXT,
  serviceType TEXT,
  completed INTEGER DEFAULT 0,
  createdAt TEXT,
  updatedAt TEXT
)
```

## Critical Data Type Inconsistencies

### 🚨 PRIMARY ISSUE: Foreign Key Type Mismatches

**1. Sponsors System:**
- `sponsors.id` is `INTEGER PRIMARY KEY AUTOINCREMENT`
- `sponsors.userId` is `TEXT`
- `sponsor_contacts.sponsorId` is `INTEGER` ✅ (Should reference `sponsors.id`)
- `action_items.sponsorId` is `INTEGER` ✅ (Should reference `sponsors.id`)

**2. Sponsees System:**
- `sponsees.id` is `INTEGER PRIMARY KEY AUTOINCREMENT`
- `sponsees.userId` is `TEXT`
- `sponsee_contacts.sponseeId` is `INTEGER` ✅ (Should reference `sponsees.id`)
- `action_items.sponseeId` is `INTEGER` ✅ (Should reference `sponsees.id`)

**Analysis:** The foreign key relationships are actually CORRECT. The `sponsorId`/`sponseeId` columns should reference the `id` (INTEGER) columns of their respective tables, not the `userId` (TEXT) columns.

### Intended vs Actual Relationships

**Intended Relationships:**
- `sponsor_contacts.sponsorId` → `sponsors.id` (INTEGER to INTEGER) ✅
- `sponsee_contacts.sponseeId` → `sponsees.id` (INTEGER to INTEGER) ✅
- `action_items.sponsorId` → `sponsors.id` (INTEGER to INTEGER) ✅
- `action_items.sponseeId` → `sponsees.id` (INTEGER to INTEGER) ✅

**User Relationship (for data filtering):**
- `sponsors.userId` → Current user identifier (TEXT)
- `sponsees.userId` → Current user identifier (TEXT)
- `sponsor_contacts.userId` → Current user identifier (TEXT)
- `sponsee_contacts.userId` → Current user identifier (TEXT)

## Current Implementation Status

### Contact Storage Logic
**Sponsor Contacts:**
- Stored in `sponsor_contacts` table
- Linked to specific sponsor via `sponsorId` (INTEGER) foreign key
- Filtered by current user via `userId` (TEXT)
- Handled by `handleContactWithActionItems()` with `personType: 'sponsor'`

**Sponsee Contacts:**
- Stored in `sponsee_contacts` table
- Linked to specific sponsee via `sponseeId` (INTEGER) foreign key
- Filtered by current user via `userId` (TEXT)
- Handled by `handleContactWithActionItems()` with `personType: 'sponsee'`

### Contact Display Logic
**Sponsor Contact Display:**
- Component: `SubTabComponent` with `personType="sponsor"`
- Data loaded via `loadSponsorContacts()` function
- Queries `sponsor_contacts` table filtered by `userId`
- Displays in `ContactCard` components with `sponsorId` and `personType="sponsor"`

**Sponsee Contact Display:**
- Component: `SubTabComponent` with `personType="sponsee"`
- Data loaded via `loadSponseeContacts()` function
- Queries `sponsee_contacts` table filtered by `userId`
- Displays in `ContactCard` components with `sponseeId` and `personType="sponsee"`

### Action Item Relationships
**Current Implementation:**
- Action items link to contacts via `contactId` field (INTEGER)
- Additional sponsor/sponsee association through `sponsorId`/`sponseeId` fields (INTEGER)
- Action item types: `'sponsor_action_item'` or `'sponsee_action_item'`

**Storage Process:**
1. Contact saved to appropriate table (`sponsor_contacts` or `sponsee_contacts`)
2. Action items saved to `action_items` table with:
   - `contactId` pointing to the contact (INTEGER)
   - `sponsorId`/`sponsorName` for sponsor action items (INTEGER/TEXT)
   - `sponseeId`/`sponseeName` for sponsee action items (INTEGER/TEXT)
   - `type` set to `'sponsor_action_item'` or `'sponsee_action_item'`

### Activity Log Integration Issues

**Missing Functionality:**
1. ❌ Sponsor contacts are NOT automatically added to `activities` table
2. ❌ Sponsee contacts are NOT automatically added to `activities` table
3. ❌ Inconsistent action item activity record creation
4. ❌ No filtering logic for excluding sponsee action items from Activity Log
5. ❌ No proper activity types for sponsor/sponsee contacts

**Expected Activity Log Behavior:**
- Sponsor contacts should create activity records with `type: 'sponsor-contact'`
- Sponsee contacts should create activity records with `type: 'sponsee-contact'`
- Sponsor action items should appear in Activity Log
- Sponsee action items should NOT appear in Activity Log

### Components and Data Pipelines

**Saving Pipeline:**
1. `ContactFormDialog` → collects contact + action item data
2. `SponsorSponsee.handleContactWithActionItems()` → saves to database
3. `databaseService.add()` → writes to SQLite tables

**Querying Pipeline:**
1. `AppDataContext` → manages shared state
2. `loadSponsorContacts()`/`loadSponseeContacts()` → fetch contact data
3. `ActivityList` component → queries activities table for Activity Log

**Display Pipeline:**
1. `SubTabComponent` → renders person tabs and contact lists
2. `ContactCard` → renders individual contacts
3. `ActionItemsList` → renders action items within contact cards

## Key Issues to Address

### 1. Activity Log Integration
- Contacts are not being added to `activities` table
- No automatic creation of activity records for sponsor/sponsee calls
- Missing activity types in schema for sponsor/sponsee contacts

### 2. Action Item Activity Log Filtering
- Need logic to include sponsor action items in Activity Log
- Need logic to exclude sponsee action items from Activity Log
- Inconsistent activity record creation for action items

### 3. Spiritual Fitness Scoring
- No clear pipeline for including sponsor contacts and action items in scoring
- No clear pipeline for excluding sponsee action items from scoring

### 4. Data Type Clarification Needed
- Confirm whether foreign key relationships are correct (INTEGER to INTEGER)
- Clarify if `userId` fields are meant for user-level filtering only

## Recommended Next Steps

1. **Clarify Foreign Key Relationships:** Confirm that `sponsorId`/`sponseeId` should reference the `id` columns (INTEGER) not `userId` columns (TEXT)
2. **Implement Activity Log Integration:** Add automatic activity record creation for contacts and action items
3. **Add Activity Type Support:** Extend activity types to include 'sponsor-contact' and 'sponsee-contact'
4. **Implement Filtering Logic:** Create proper filtering for Activity Log to include/exclude appropriate items
5. **Test Data Integrity:** Verify all foreign key relationships work correctly with current data types

---
*Generated: June 14, 2025*
*Status: Analysis Complete - Implementation Required*