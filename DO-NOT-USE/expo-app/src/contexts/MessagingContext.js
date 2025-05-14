import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useUser } from './UserContext';
import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { getConversations, getMessages, sendMessage, markMessagesAsRead, deleteConversation } from '../services/messagingService';
import { generateConversationId } from '../utils/encryption';

// Create context
const MessagingContext = createContext();

// Get database connection
let db;
if (Platform.OS === 'web') {
  // Web DB instance will be handled by the database.js file
  db = null;
} else {
  // Native DB
  db = SQLite.openDatabase('aa_recovery.db');
}

export const MessagingProvider = ({ children }) => {
  const { user } = useUser();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load all conversations for the current user
  const loadConversations = useCallback(async () => {
    if (!user || !user.id || !db) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const userConversations = await getConversations(db, user.id);
      setConversations(userConversations);
      
      // Calculate total unread messages
      const total = userConversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
      setUnreadCount(total);
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [user, db]);

  // Load messages for a specific conversation
  const loadMessages = useCallback(async (conversationId) => {
    if (!user || !user.id || !db || !conversationId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const conversationMessages = await getMessages(db, conversationId);
      setMessages(prev => ({
        ...prev,
        [conversationId]: conversationMessages
      }));
      
      // Mark messages as read when loading them
      await markMessagesAsRead(db, conversationId, user.id);
      
      // Update conversations to reflect read status
      loadConversations();
      
      return conversationMessages;
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load messages');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, db, loadConversations]);

  // Send a new message
  const sendNewMessage = useCallback(async (receiverId, content, type = 'text') => {
    if (!user || !user.id || !db || !receiverId || !content) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const conversationId = generateConversationId(user.id, receiverId);
      
      const newMessage = {
        senderId: user.id,
        receiverId,
        content,
        type,
        conversationId
      };
      
      const sentMessage = await sendMessage(db, newMessage);
      
      // Update messages in state
      setMessages(prev => {
        const conversationMessages = prev[conversationId] || [];
        return {
          ...prev,
          [conversationId]: [...conversationMessages, sentMessage]
        };
      });
      
      // Reload conversations to update last message preview
      loadConversations();
      
      return sentMessage;
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, db, loadConversations]);

  // Mark conversation messages as read
  const markAsRead = useCallback(async (conversationId) => {
    if (!user || !user.id || !db || !conversationId) return false;
    
    try {
      await markMessagesAsRead(db, conversationId, user.id);
      
      // Update conversations list to reflect new unread counts
      loadConversations();
      
      return true;
    } catch (err) {
      console.error('Error marking messages as read:', err);
      return false;
    }
  }, [user, db, loadConversations]);

  // Delete a conversation
  const deleteUserConversation = useCallback(async (conversationId) => {
    if (!user || !user.id || !db || !conversationId) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      await deleteConversation(db, conversationId);
      
      // Update state to remove deleted conversation
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      setMessages(prev => {
        const newMessages = { ...prev };
        delete newMessages[conversationId];
        return newMessages;
      });
      
      // If this was the active conversation, clear it
      if (activeConversation === conversationId) {
        setActiveConversation(null);
      }
      
      return true;
    } catch (err) {
      console.error('Error deleting conversation:', err);
      setError('Failed to delete conversation');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, db, activeConversation]);

  // Start a new conversation with a user
  const startConversation = useCallback((otherUserId) => {
    if (!user || !user.id || !otherUserId) return null;
    
    const conversationId = generateConversationId(user.id, otherUserId);
    setActiveConversation(conversationId);
    
    return conversationId;
  }, [user]);

  // Load initial data when user changes
  useEffect(() => {
    if (user && user.id) {
      loadConversations();
    }
  }, [user, loadConversations]);

  // Create context value
  const value = {
    conversations,
    messages,
    loading,
    error,
    unreadCount,
    activeConversation,
    setActiveConversation,
    loadConversations,
    loadMessages,
    sendMessage: sendNewMessage,
    markAsRead,
    deleteConversation: deleteUserConversation,
    startConversation
  };

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
};

// Custom hook for using the messaging context
export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};