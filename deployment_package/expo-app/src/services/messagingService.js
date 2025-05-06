/**
 * Messaging service for handling database operations related to messaging
 */
import { encryptMessage, decryptMessage, generateConversationId, generateMessageId } from '../utils/encryption';

/**
 * Get all conversations for a user
 * @param {object} db - Database connection
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - List of conversations
 */
export const getConversations = (db, userId) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT c.id, c.lastMessageTimestamp, c.lastMessagePreview, c.unreadCount,
         cp.userId as participantId
         FROM conversations c
         JOIN conversation_participants cp ON c.id = cp.conversationId
         WHERE c.id IN (
           SELECT conversationId FROM conversation_participants WHERE userId = ?
         )
         AND cp.userId != ?
         ORDER BY c.lastMessageTimestamp DESC`,
        [userId, userId],
        (_, { rows }) => {
          const conversations = [];
          for (let i = 0; i < rows.length; i++) {
            conversations.push(rows.item(i));
          }
          
          // Get participant details for each conversation
          const participantPromises = conversations.map(conv => {
            return new Promise((resolveParticipant) => {
              tx.executeSql(
                'SELECT id, firstName, lastName FROM users WHERE id = ?',
                [conv.participantId],
                (_, { rows: userRows }) => {
                  if (userRows.length > 0) {
                    resolveParticipant({
                      ...conv,
                      participant: userRows.item(0)
                    });
                  } else {
                    resolveParticipant(conv);
                  }
                },
                (_, error) => {
                  console.error('Error fetching participant details:', error);
                  resolveParticipant(conv);
                }
              );
            });
          });
          
          Promise.all(participantPromises)
            .then(conversationsWithParticipants => {
              resolve(conversationsWithParticipants);
            })
            .catch(error => {
              console.error('Error resolving participants:', error);
              resolve(conversations);
            });
        },
        (_, error) => {
          console.error('Error fetching conversations:', error);
          reject(error);
        }
      );
    });
  });
};

/**
 * Get messages for a conversation
 * @param {object} db - Database connection
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Array>} - List of messages
 */
export const getMessages = (db, conversationId) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM messages 
         WHERE senderId IN (
           SELECT userId FROM conversation_participants WHERE conversationId = ?
         )
         AND receiverId IN (
           SELECT userId FROM conversation_participants WHERE conversationId = ?
         )
         ORDER BY timestamp ASC`,
        [conversationId, conversationId],
        (_, { rows }) => {
          const messages = [];
          for (let i = 0; i < rows.length; i++) {
            const message = rows.item(i);
            
            // Decrypt message content if it's encrypted
            if (message.isEncrypted) {
              message.content = decryptMessage(message.content);
            }
            
            messages.push(message);
          }
          resolve(messages);
        },
        (_, error) => {
          console.error('Error fetching messages:', error);
          reject(error);
        }
      );
    });
  });
};

/**
 * Send a message
 * @param {object} db - Database connection
 * @param {object} message - Message object
 * @returns {Promise<object>} - Sent message
 */
export const sendMessage = (db, message) => {
  return new Promise((resolve, reject) => {
    const messageId = message.id || generateMessageId();
    const timestamp = message.timestamp || new Date().toISOString();
    const conversationId = message.conversationId || 
                           generateConversationId(message.senderId, message.receiverId);
    
    // Encrypt the message
    const encryptedContent = encryptMessage(message.content);
    
    db.transaction(tx => {
      // Ensure conversation exists
      tx.executeSql(
        'SELECT id FROM conversations WHERE id = ?',
        [conversationId],
        (_, { rows }) => {
          if (rows.length === 0) {
            // Create new conversation
            tx.executeSql(
              `INSERT INTO conversations (
                id, lastMessageTimestamp, lastMessagePreview, unreadCount
              ) VALUES (?, ?, ?, ?)`,
              [conversationId, timestamp, message.content.substring(0, 50), 1],
              () => {
                // Add participants to conversation
                tx.executeSql(
                  `INSERT INTO conversation_participants (conversationId, userId)
                   VALUES (?, ?)`,
                  [conversationId, message.senderId],
                  () => {
                    tx.executeSql(
                      `INSERT INTO conversation_participants (conversationId, userId)
                       VALUES (?, ?)`,
                      [conversationId, message.receiverId],
                      () => {
                        // Insert the message
                        insertMessage(tx, messageId, message.senderId, message.receiverId, 
                                      encryptedContent, timestamp, conversationId, resolve, reject);
                      },
                      (_, error) => {
                        console.error('Error adding receiver to conversation:', error);
                        reject(error);
                      }
                    );
                  },
                  (_, error) => {
                    console.error('Error adding sender to conversation:', error);
                    reject(error);
                  }
                );
              },
              (_, error) => {
                console.error('Error creating conversation:', error);
                reject(error);
              }
            );
          } else {
            // Update existing conversation
            tx.executeSql(
              `UPDATE conversations 
               SET lastMessageTimestamp = ?, 
                   lastMessagePreview = ?,
                   unreadCount = unreadCount + 1
               WHERE id = ?`,
              [timestamp, message.content.substring(0, 50), conversationId],
              () => {
                // Insert the message
                insertMessage(tx, messageId, message.senderId, message.receiverId, 
                              encryptedContent, timestamp, conversationId, resolve, reject);
              },
              (_, error) => {
                console.error('Error updating conversation:', error);
                reject(error);
              }
            );
          }
        },
        (_, error) => {
          console.error('Error checking conversation existence:', error);
          reject(error);
        }
      );
    });
  });
};

/**
 * Helper function to insert a message
 */
const insertMessage = (tx, id, senderId, receiverId, content, timestamp, conversationId, resolve, reject) => {
  tx.executeSql(
    `INSERT INTO messages (
      id, senderId, receiverId, content, timestamp, isRead, isEncrypted, type
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, senderId, receiverId, content, timestamp, 0, 1, 'text'],
    () => {
      resolve({
        id,
        senderId,
        receiverId,
        content: decryptMessage(content),
        timestamp,
        isRead: false,
        isEncrypted: true,
        type: 'text',
        conversationId
      });
    },
    (_, error) => {
      console.error('Error sending message:', error);
      reject(error);
    }
  );
};

/**
 * Mark messages as read
 * @param {object} db - Database connection
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID (recipient)
 * @returns {Promise<boolean>} - Success status
 */
export const markMessagesAsRead = (db, conversationId, userId) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE messages 
         SET isRead = 1
         WHERE receiverId = ? 
         AND senderId IN (
           SELECT userId FROM conversation_participants 
           WHERE conversationId = ? AND userId != ?
         )`,
        [userId, conversationId, userId],
        () => {
          // Reset unread count for this conversation
          tx.executeSql(
            'UPDATE conversations SET unreadCount = 0 WHERE id = ?',
            [conversationId],
            () => {
              resolve(true);
            },
            (_, error) => {
              console.error('Error resetting unread count:', error);
              reject(error);
            }
          );
        },
        (_, error) => {
          console.error('Error marking messages as read:', error);
          reject(error);
        }
      );
    });
  });
};

/**
 * Delete a conversation and its messages
 * @param {object} db - Database connection
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<boolean>} - Success status
 */
export const deleteConversation = (db, conversationId) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Delete all messages in the conversation
      tx.executeSql(
        `DELETE FROM messages 
         WHERE senderId IN (
           SELECT userId FROM conversation_participants WHERE conversationId = ?
         )
         AND receiverId IN (
           SELECT userId FROM conversation_participants WHERE conversationId = ?
         )`,
        [conversationId, conversationId],
        () => {
          // Delete participants
          tx.executeSql(
            'DELETE FROM conversation_participants WHERE conversationId = ?',
            [conversationId],
            () => {
              // Delete the conversation
              tx.executeSql(
                'DELETE FROM conversations WHERE id = ?',
                [conversationId],
                () => {
                  resolve(true);
                },
                (_, error) => {
                  console.error('Error deleting conversation:', error);
                  reject(error);
                }
              );
            },
            (_, error) => {
              console.error('Error deleting conversation participants:', error);
              reject(error);
            }
          );
        },
        (_, error) => {
          console.error('Error deleting messages:', error);
          reject(error);
        }
      );
    });
  });
};