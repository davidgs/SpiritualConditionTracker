# Activities Table Redesign - Proper Database Architecture

## Current Problem
The `activities` table contains massive data duplication by trying to store:
- Core activity data
- Action item references 
- Sponsor/sponsee relationship data
- Meeting-specific fields
- Call tracking data
- Literature references
- Service type information

## Proposed Clean Architecture

### Core Activities Table (Simplified)
```sql
CREATE TABLE activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT DEFAULT 'default_user',
  type TEXT NOT NULL,  -- 'prayer', 'meeting', 'literature', 'service', 'contact'
  title TEXT,
  date TEXT NOT NULL,
  notes TEXT,
  duration INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### Separate Specialized Tables

#### Meeting Activities (when type='meeting')
```sql
CREATE TABLE meeting_activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  activityId INTEGER REFERENCES activities(id),
  meetingId INTEGER REFERENCES meetings(id),
  wasChair INTEGER DEFAULT 0,
  wasShare INTEGER DEFAULT 0,
  wasSpeaker INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
```

#### Literature Activities (when type='literature')  
```sql
CREATE TABLE literature_activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  activityId INTEGER REFERENCES activities(id),
  literatureTitle TEXT,
  pages TEXT,
  stepNumber INTEGER,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
```

#### Contact Activities (when type='contact')
```sql
CREATE TABLE contact_activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  activityId INTEGER REFERENCES activities(id),
  contactType TEXT, -- 'sponsor', 'sponsee', 'aa_member'
  contactId INTEGER, -- References sponsor_contacts or sponsee_contacts
  callType TEXT,
  personCalled TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
```

## Benefits of This Architecture

1. **Normalized Data**: Each table has a single responsibility
2. **No Duplication**: Related data stored once in appropriate tables
3. **Flexible**: Easy to add new activity types without bloating core table
4. **Maintainable**: Changes to specific activity types don't affect others
5. **Performant**: Smaller core table, joins only when needed
6. **Type Safety**: Clear data contracts for each activity type

## Migration Strategy

1. Create new normalized tables
2. Migrate existing data to appropriate tables
3. Update application code to use proper relationships
4. Remove redundant columns from activities table
5. Test data integrity

## Impact on Application Code

- Activities List: Query core activities, join specialized tables as needed
- Activity Creation: Insert into activities + specialized table
- Data Loading: Use proper JOIN queries instead of denormalized data

## Phase 1: Immediate Cleanup (COMPLETED)

### What Was Removed from Activities Table:
- **Contact tracking fields**: `isSponsorCall`, `isSponseeCall`, `isAAMemberCall`, `callType`, `personCalled`
- **Action item linkage**: `actionItemId`, `sponsorContactId`, `sponseeContactId`, `sponsorId`, `sponseeId`
- **Completion tracking**: `completed` (belongs in action_items table)

### What Was Kept in Activities Table:
- **Core activity fields**: `id`, `userId`, `type`, `title`, `text`, `date`, `notes`, `duration`, `location`
- **Meeting-specific fields**: `meetingName`, `meetingId`, `wasChair`, `wasShare`, `wasSpeaker`
- **Literature-specific fields**: `literatureTitle`, `stepNumber`
- **Service-specific fields**: `serviceType`

### Benefits:
1. **Eliminated data duplication** - Contact and action item data live in their proper tables
2. **Simplified schema** - Removed 15+ redundant fields from core activities table
3. **Better separation of concerns** - Activities track spiritual activities, not relationships
4. **Maintained compatibility** - AppDataContext still enriches activities with related data at runtime
5. **Improved maintainability** - Changes to contact/action item logic don't require activities table updates

### Current Data Flow (Post-Cleanup):
1. **Activities table**: Stores core spiritual activities (prayer, meetings, literature, service)
2. **Contacts tables**: Store sponsor/sponsee relationship interactions
3. **Action items table**: Stores action items linked to contacts
4. **AppDataContext**: Merges data from all tables into unified activity feed for UI
5. **Activity List**: Displays enriched activities with proper filtering and deduplication

The architecture is now cleaner while maintaining all existing functionality.