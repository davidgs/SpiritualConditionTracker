/**
 * Encryption utilities for secure messaging
 * This uses a simple AES-based encryption for messages
 */

/**
 * Generate a secure random key for encryption
 * @returns {string} Base64 encoded key
 */
export function generateEncryptionKey() {
  // Create array of random bytes
  const keyData = new Uint8Array(32); // 256 bits
  crypto.getRandomValues(keyData);
  
  // Convert to base64 for storage
  return btoa(String.fromCharCode.apply(null, keyData));
}

/**
 * Encrypt a message with a given key
 * @param {string} message - The message to encrypt
 * @param {string} key - Base64 encoded encryption key
 * @returns {Promise<string>} - The encrypted message
 */
export async function encryptMessage(message, key) {
  try {
    // Convert key from base64 to array buffer
    const keyData = Uint8Array.from(atob(key), c => c.charCodeAt(0));
    
    // Import the key
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );
    
    // Create an initialization vector
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Encode the message
    const encodedMessage = new TextEncoder().encode(message);
    
    // Encrypt the message
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      cryptoKey,
      encodedMessage
    );
    
    // Combine IV and encrypted data
    const result = new Uint8Array(iv.length + encryptedData.byteLength);
    result.set(iv);
    result.set(new Uint8Array(encryptedData), iv.length);
    
    // Convert to base64 for storage
    return btoa(String.fromCharCode.apply(null, result));
  } catch (error) {
    console.error('[ encryption.js ] Encryption error:', error);
    throw new Error('Failed to encrypt message');
  }
}

/**
 * Decrypt a message with a given key
 * @param {string} encryptedMessage - The encrypted message (base64)
 * @param {string} key - Base64 encoded encryption key
 * @returns {Promise<string>} - The decrypted message
 */
export async function decryptMessage(encryptedMessage, key) {
  try {
    // Convert key from base64 to array buffer
    const keyData = Uint8Array.from(atob(key), c => c.charCodeAt(0));
    
    // Convert encrypted message from base64 to array buffer
    const encryptedData = Uint8Array.from(atob(encryptedMessage), c => c.charCodeAt(0));
    
    // Extract IV (first 12 bytes)
    const iv = encryptedData.slice(0, 12);
    
    // Extract encrypted content
    const encryptedContent = encryptedData.slice(12);
    
    // Import the key
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    
    // Decrypt the message
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      cryptoKey,
      encryptedContent
    );
    
    // Decode the decrypted data to a string
    return new TextDecoder().decode(decryptedData);
  } catch (error) {
    console.error('[ encryption.js ] Decryption error:', error);
    throw new Error('Failed to decrypt message');
  }
}

/**
 * Generate connection key pair
 * @returns {Promise<{publicKey: string, privateKey: string}>} - Key pair
 */
export async function generateKeyPair() {
  try {
    // Generate RSA key pair
    const keyPair = await crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"]
    );
    
    // Export public key
    const publicKeyBuffer = await crypto.subtle.exportKey(
      "spki",
      keyPair.publicKey
    );
    
    // Export private key
    const privateKeyBuffer = await crypto.subtle.exportKey(
      "pkcs8",
      keyPair.privateKey
    );
    
    // Convert to base64
    const publicKey = btoa(String.fromCharCode.apply(null, new Uint8Array(publicKeyBuffer)));
    const privateKey = btoa(String.fromCharCode.apply(null, new Uint8Array(privateKeyBuffer)));
    
    return { publicKey, privateKey };
  } catch (error) {
    console.error('[ encryption.js ] Key pair generation error:', error);
    throw new Error('Failed to generate key pair');
  }
}

export default {
  generateEncryptionKey,
  encryptMessage,
  decryptMessage,
  generateKeyPair
};