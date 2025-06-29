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
      location TEXT,
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
      actionItemId INTEGER,
      sponsorContactId INTEGER,
      sponseeContactId INTEGER,
      sponsorId INTEGER,
      sponseeId INTEGER,
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
      address TEXT,
      city TEXT,
      state TEXT,
      zipCode TEXT,
      coordinates TEXT,
      locationName TEXT,
      onlineUrl TEXT,
      notes TEXT,
      types TEXT,
      schedule TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `,

  sponsors: `
    CREATE TABLE IF NOT EXISTS sponsors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT DEFAULT 'default_user',
      name TEXT,
      lastName TEXT,
      phoneNumber TEXT,
      email TEXT,
      sobrietyDate TEXT,
      notes TEXT,
      sponsorType TEXT DEFAULT 'sponsor',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `,

  sponsees: `
    CREATE TABLE IF NOT EXISTS sponsees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT DEFAULT 'default_user',
      name TEXT,
      lastName TEXT,
      phoneNumber TEXT,
      email TEXT,
      sobrietyDate TEXT,
      notes TEXT,
      sponseeType TEXT DEFAULT 'sponsee',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `,

  sponsor_contacts: `
    CREATE TABLE IF NOT EXISTS sponsor_contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      sponsorId INTEGER NOT NULL,
      type TEXT NOT NULL,
      date TEXT NOT NULL,
      note TEXT,
      topic TEXT,
      duration INTEGER,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `,

  sponsee_contacts: `
    CREATE TABLE IF NOT EXISTS sponsee_contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      sponseeId INTEGER NOT NULL,
      type TEXT NOT NULL,
      date TEXT NOT NULL,
      note TEXT,
      topic TEXT,
      duration INTEGER,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
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
      sponsorContactId INTEGER,
      sponseeContactId INTEGER,
      contactId INTEGER,
      sponsorId INTEGER,
      sponsorName TEXT,
      sponseeId INTEGER,
      sponseeName TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sponsorContactId) REFERENCES sponsor_contacts(id),
      FOREIGN KEY (sponseeContactId) REFERENCES sponsee_contacts(id)
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