/**
 * Encryption utilities for secure messaging
 * 
 * Note: This is a simplified encryption implementation
 * For production, a more robust end-to-end encryption system should be used
 */
import { v4 as uuidv4 } from 'uuid';

// A simple encryption key for demo purposes
// In a real app, this would be managed securely
const ENCRYPTION_KEY = 'AA_RECOVERY_SECURE_KEY';

/**
 * Generate a unique conversation ID from two user IDs
 * @param {string} userId1 - First user ID
 * @param {string} userId2 - Second user ID
 * @returns {string} - Unique conversation ID
 */
export const generateConversationId = (userId1, userId2) => {
  // Sort IDs to ensure the same conversation ID regardless of order
  const sortedIds = [userId1, userId2].sort();
  return `conv_${sortedIds[0]}_${sortedIds[1]}`;
};

/**
 * Generate a unique message ID
 * @returns {string} - Unique message ID
 */
export const generateMessageId = () => {
  return `msg_${uuidv4()}`;
};

/**
 * Simple encryption function for message content
 * @param {string} text - Message to encrypt
 * @returns {string} - Encrypted message
 */
export const encryptMessage = (text) => {
  if (!text) return '';
  
  try {
    // This is a very simple encryption method for demonstration
    // In a production app, use a proper encryption library
    
    // Convert the text to a Base64 string and then reverse it
    const base64 = Buffer.from(text).toString('base64');
    const reversed = base64.split('').reverse().join('');
    
    // Add a prefix to identify it as an encrypted message
    return `ENC:${reversed}`;
  } catch (error) {
    console.error('Encryption error:', error);
    return text;
  }
};

/**
 * Simple decryption function for message content
 * @param {string} encryptedText - Encrypted message
 * @returns {string} - Decrypted message
 */
export const decryptMessage = (encryptedText) => {
  if (!encryptedText) return '';
  
  try {
    // Check if the text is encrypted
    if (!encryptedText.startsWith('ENC:')) {
      return encryptedText;
    }
    
    // Remove the encryption prefix
    const encrypted = encryptedText.slice(4);
    
    // Reverse the string and convert from Base64
    const reversed = encrypted.split('').reverse().join('');
    const decrypted = Buffer.from(reversed, 'base64').toString('utf-8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedText;
  }
};