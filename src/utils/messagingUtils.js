/**
 * Messaging utility functions for handling connections and message operations
 */
import { messageOperations, connectionOperations } from './database';
import { encryptMessage, decryptMessage, generateEncryptionKey } from './encryption';

/**
 * Create a new connection between users
 * @param {Object} user - Current user
 * @param {Object} contactInfo - Contact information for the new connection
 * @returns {Promise<Object>} - The new connection
 */
export async function createConnection(user, contactInfo) {
  if (!user) throw new Error('User is required');
  if (!contactInfo.name) throw new Error('Contact name is required');
  
  try {
    // Generate a shared encryption key for this conversation
    const encryptionKey = generateEncryptionKey();
    
    // Create connection object
    const connection = {
      id: Date.now().toString(),
      userId: user.id,
      contactId: `contact-${Date.now()}`, // Placeholder ID for the contact
      name: contactInfo.name,
      contactInfo: contactInfo.contactInfo || '',
      encryptionKey,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    // Save to database
    return connectionOperations.create(connection);
  } catch (error) {
    console.error('[ messagingUtils.js ] Error creating connection:', error);
    throw new Error('Failed to create connection');
  }
}

/**
 * Send a message in a conversation
 * @param {Object} user - Current user
 * @param {Object} connection - The connection/conversation
 * @param {string} messageContent - The message content to send
 * @returns {Promise<Object>} - The sent message
 */
export async function sendMessage(user, connection, messageContent) {
  if (!user) throw new Error('User is required');
  if (!connection) throw new Error('Connection is required');
  if (!messageContent.trim()) throw new Error('Message content is required');
  
  try {
    let content = messageContent;
    let isEncrypted = false;
    
    // Encrypt message if possible
    if (connection.encryptionKey) {
      content = await encryptMessage(messageContent, connection.encryptionKey);
      isEncrypted = true;
    }
    
    // Create message object
    const message = {
      id: Date.now().toString(),
      conversationId: connection.id,
      senderId: user.id,
      receiverId: connection.userId === user.id 
        ? connection.contactId 
        : connection.userId,
      content,
      encrypted: isEncrypted,
      read: false,
      createdAt: new Date().toISOString()
    };
    
    // Save to database
    const savedMessage = messageOperations.create(message);
    
    // Update connection's lastMessageAt
    connectionOperations.update(connection.id, {
      lastMessageAt: new Date().toISOString()
    });
    
    return {
      ...savedMessage,
      content: messageContent, // Return decrypted content for UI display
      decrypted: isEncrypted // Mark as already decrypted
    };
  } catch (error) {
    console.error('[ messagingUtils.js ] Error sending message:', error);
    throw new Error('Failed to send message');
  }
}

/**
 * Get messages for a conversation and decrypt them
 * @param {string} conversationId - The conversation ID
 * @param {string} encryptionKey - The encryption key for the conversation
 * @returns {Promise<Array>} - Array of decrypted messages
 */
export async function getDecryptedMessages(conversationId, encryptionKey) {
  try {
    // Get encrypted messages
    const messages = messageOperations.getByConversationId(conversationId);
    
    if (!encryptionKey) {
      // If no encryption key, return as is
      return messages;
    }
    
    // Decrypt messages
    return Promise.all(
      messages.map(async (message) => {
        if (!message.encrypted) return message;
        
        try {
          return {
            ...message,
            content: await decryptMessage(message.content, encryptionKey),
            decrypted: true
          };
        } catch (error) {
          console.error('[ messagingUtils.js ] Failed to decrypt message:', error);
          return {
            ...message,
            content: '[Encrypted message - unable to decrypt]',
            decryptError: true
          };
        }
      })
    );
  } catch (error) {
    console.error('[ messagingUtils.js ] Error getting messages:', error);
    throw new Error('Failed to retrieve messages');
  }
}

/**
 * Mark messages as read
 * @param {Array} messageIds - Array of message IDs to mark as read
 * @returns {Promise<boolean>} - Success status
 */
export async function markMessagesAsRead(messageIds) {
  if (!messageIds || messageIds.length === 0) return true;
  
  try {
    // Update each message
    messageIds.forEach(id => {
      messageOperations.update(id, { read: true });
    });
    
    return true;
  } catch (error) {
    console.error('[ messagingUtils.js ] Error marking messages as read:', error);
    return false;
  }
}

/**
 * Delete a connection and all its messages
 * @param {string} connectionId - The connection ID to delete
 * @returns {Promise<boolean>} - Success status
 */
export async function deleteConnection(connectionId) {
  try {
    // Get all messages for this connection
    const messages = messageOperations.getByConversationId(connectionId);
    
    // Delete each message
    messages.forEach(message => {
      messageOperations.delete(message.id);
    });
    
    // Delete the connection
    return connectionOperations.delete(connectionId);
  } catch (error) {
    console.error('[ messagingUtils.js ] Error deleting connection:', error);
    return false;
  }
}

export default {
  createConnection,
  sendMessage,
  getDecryptedMessages,
  markMessagesAsRead,
  deleteConnection
};