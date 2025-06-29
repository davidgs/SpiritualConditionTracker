/**
 * Centralized Database Table Definitions
 * 
 * This file contains the exact SQL CREATE TABLE statements for all database tables.
 * All TypeScript types in database.ts must match these table schemas exactly.
 * 
 * Any changes to table structure must be made here first, then reflected in:
 * 1. database.ts types
 * 2. sqliteLoader.ts table creation
 * 3. Any migration scripts
 */

export const TABLE_DEFINITIONS = {
  users: `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      lastName TEXT,
      phoneNumber TEXT,
      email TEXT,
      sobrietyDate TEXT,
      homeGroups TEXT,
      preferences TEXT,
      privacySettings TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `,

  activities: `
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT DEFAULT 'default_user',
      type TEXT NOT NULL,
      title TEXT,
      text TEXT,
      date TEXT NOT NULL,
      notes TEXT,
      duration INTEGER DEFAULT 0,
      completed INTEGER DEFAULT 0,
      location TEXT,
      -- Meeting-specific fields (when type='meeting')
      meetingName TEXT,
      meetingId INTEGER,
      wasChair INTEGER DEFAULT 0,
      wasShare INTEGER DEFAULT 0,
      wasSpeaker INTEGER DEFAULT 0,
      -- Literature-specific fields (when type='literature')
      literatureTitle TEXT,
      stepNumber INTEGER,
      -- Service-specific fields (when type='service')
      serviceType TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `,

  meetings: `
    CREATE TABLE IF NOT EXISTS meetings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT DEFAULT 'default_user',
      name TEXT,
      days TEXT,
      time TEXT,
      schedule TEXT,
      address TEXT,
      locationName TEXT,
      streetAddress TEXT,
      city TEXT,
      state TEXT,
      zipCode TEXT,
      coordinates TEXT,
      phoneNumber TEXT,
      onlineUrl TEXT,
      isHomeGroup INTEGER DEFAULT 0,
      types TEXT,
      notes TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `,

  people: `
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
      relationship TEXT, -- 'sponsor', 'sponsee', 'member', 'friend', 'family', 'professional'
      isActive INTEGER DEFAULT 1,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `,

  contacts: `
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT DEFAULT 'default_user',
      personId INTEGER NOT NULL,
      contactType TEXT NOT NULL, -- 'call', 'meeting', 'coffee', 'text', 'service'
      date TEXT NOT NULL,
      note TEXT,
      topic TEXT,
      duration INTEGER DEFAULT 0,
      location TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (personId) REFERENCES people(id)
    )
  `,

  sponsors: `
    CREATE TABLE IF NOT EXISTS sponsors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT DEFAULT 'default_user',
      personId INTEGER NOT NULL,
      startDate TEXT,
      status TEXT DEFAULT 'active', -- 'active', 'former'
      notes TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (personId) REFERENCES people(id)
    )
  `,

  sponsees: `
    CREATE TABLE IF NOT EXISTS sponsees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT DEFAULT 'default_user',
      personId INTEGER NOT NULL,
      startDate TEXT,
      status TEXT DEFAULT 'active',
      notes TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (personId) REFERENCES people(id)
    )
  `,

  action_items: `
    CREATE TABLE IF NOT EXISTS action_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      text TEXT,
      notes TEXT,
      dueDate TEXT,
      completed INTEGER DEFAULT 0,
      deleted INTEGER DEFAULT 0,
      type TEXT DEFAULT 'action',
      contactId INTEGER, -- References contacts.id (simplified)
      personId INTEGER, -- References people.id (for direct person association)
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (contactId) REFERENCES contacts(id),
      FOREIGN KEY (personId) REFERENCES people(id)
    )
  `
} as const;

/**
 * Get all table creation statements as an array
 */
export function getAllTableStatements(): string[] {
  return Object.values(TABLE_DEFINITIONS);
}

/**
 * Get a specific table definition
 */
export function getTableDefinition(tableName: keyof typeof TABLE_DEFINITIONS): string {
  return TABLE_DEFINITIONS[tableName];
}

/**
 * Extract column names from a table definition (for validation)
 */
export function getTableColumns(tableName: keyof typeof TABLE_DEFINITIONS): string[] {
  const definition = TABLE_DEFINITIONS[tableName];
  const lines = definition.split('\n').map(line => line.trim());
  const columns: string[] = [];
  
  for (const line of lines) {
    // Skip CREATE TABLE, opening/closing parentheses, and constraint lines
    if (line.includes('CREATE TABLE') || 
        line.includes('(') || 
        line.includes(')') ||
        line.includes('FOREIGN KEY') ||
        line.trim() === '') {
      continue;
    }
    
    // Extract column name (first word before space)
    const parts = line.split(' ');
    if (parts.length > 1) {
      const columnName = parts[0].replace(',', '');
      if (columnName && !columnName.includes('--')) {
        columns.push(columnName);
      }
    }
  }
  
  return columns;
}