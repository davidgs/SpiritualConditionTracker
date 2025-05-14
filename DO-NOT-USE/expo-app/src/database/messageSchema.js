/**
 * Database schema for the messaging feature
 */

/**
 * Schema for messages and conversations
 */
export const MESSAGES_SCHEMA = {
  /**
   * Messages table - stores individual messages
   */
  messages: {
    name: 'messages',
    primaryKey: 'id',
    columns: {
      id: { type: 'TEXT', primaryKey: true, notNull: true },
      senderId: { type: 'TEXT', notNull: true, indexed: true },
      receiverId: { type: 'TEXT', notNull: true, indexed: true },
      content: { type: 'TEXT', notNull: true },
      timestamp: { type: 'TEXT', notNull: true, indexed: true },
      isRead: { type: 'INTEGER', notNull: true, defaultValue: 0 },
      isEncrypted: { type: 'INTEGER', notNull: true, defaultValue: 1 },
      type: { type: 'TEXT', notNull: true, defaultValue: 'text' },
    },
  },
  
  /**
   * Conversations table - represents conversations between users
   */
  conversations: {
    name: 'conversations',
    primaryKey: 'id',
    columns: {
      id: { type: 'TEXT', primaryKey: true, notNull: true },
      lastMessageTimestamp: { type: 'TEXT', notNull: true, indexed: true },
      lastMessagePreview: { type: 'TEXT' },
      unreadCount: { type: 'INTEGER', defaultValue: 0 },
    },
  },
  
  /**
   * Conversation participants - links users to conversations
   */
  conversation_participants: {
    name: 'conversation_participants',
    primaryKey: ['conversationId', 'userId'],
    columns: {
      conversationId: { type: 'TEXT', notNull: true, indexed: true },
      userId: { type: 'TEXT', notNull: true, indexed: true },
    },
  },
};

/**
 * SQL statements to create the messaging tables
 */
export const MESSAGE_TABLES_SQL = [
  // Messages table
  `CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY NOT NULL,
    senderId TEXT NOT NULL,
    receiverId TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    isRead INTEGER NOT NULL DEFAULT 0,
    isEncrypted INTEGER NOT NULL DEFAULT 1,
    type TEXT NOT NULL DEFAULT 'text'
  )`,
  
  // Conversations table
  `CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY NOT NULL,
    lastMessageTimestamp TEXT NOT NULL,
    lastMessagePreview TEXT,
    unreadCount INTEGER DEFAULT 0
  )`,
  
  // Conversation participants table
  `CREATE TABLE IF NOT EXISTS conversation_participants (
    conversationId TEXT NOT NULL,
    userId TEXT NOT NULL,
    PRIMARY KEY (conversationId, userId)
  )`,
  
  // Create indexes for better performance
  `CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages (senderId)`,
  `CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages (receiverId)`,
  `CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages (timestamp)`,
  `CREATE INDEX IF NOT EXISTS idx_conversations_timestamp ON conversations (lastMessageTimestamp)`,
  `CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation ON conversation_participants (conversationId)`,
  `CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON conversation_participants (userId)`,
];

/**
 * Generate a SQL statement to drop all message-related tables
 * (Only used for development/testing)
 */
export const DROP_MESSAGE_TABLES_SQL = [
  `DROP TABLE IF EXISTS messages`,
  `DROP TABLE IF EXISTS conversations`,
  `DROP TABLE IF EXISTS conversation_participants`,
];

/**
 * Create messaging tables in the database
 * @param {Object} db - Database connection
 * @returns {Promise} - Promise that resolves when tables are created
 */
export const createMessageTables = (db) => {
  return new Promise((resolve, reject) => {
    try {
      db.transaction(tx => {
        // Create each table with its corresponding SQL
        MESSAGE_TABLES_SQL.forEach(sql => {
          tx.executeSql(
            sql,
            [],
            () => {}, // Success callback (empty as we'll resolve after all are done)
            (_, error) => {
              console.error('Error creating message table:', error);
              reject(error);
            }
          );
        });
        
        // If we got here, all tables were created successfully
        console.log('Message tables created or already exist');
        resolve();
      });
    } catch (error) {
      console.error('Error in createMessageTables:', error);
      reject(error);
    }
  });
};