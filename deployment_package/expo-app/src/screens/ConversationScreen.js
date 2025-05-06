import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, Text, TouchableOpacity } from 'react-native';
import { useMessaging } from '../contexts/MessagingContext';
import { useTheme } from '../contexts/ThemeContext';
import MessageList from '../components/messaging/MessageList';
import MessageInput from '../components/messaging/MessageInput';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * Screen for an individual conversation
 */
const ConversationScreen = ({ route, navigation }) => {
  const { conversationId, participant } = route.params || {};
  const { theme } = useTheme();
  const { 
    messages, 
    loadMessages, 
    sendMessage, 
    loading, 
    error,
    activeConversation,
    setActiveConversation,
    markAsRead
  } = useMessaging();
  
  const [localParticipant, setLocalParticipant] = useState(participant);
  
  // Create themed styles
  const themedStyles = {
    container: {
      ...styles.container,
      backgroundColor: theme.background,
    },
    header: {
      ...styles.header,
      backgroundColor: theme.card,
      borderBottomColor: theme.divider,
    },
    headerTitle: {
      ...styles.headerTitle,
      color: theme.text,
    },
    headerSubtitle: {
      ...styles.headerSubtitle,
      color: theme.textSecondary,
    },
    errorContainer: {
      ...styles.errorContainer,
      backgroundColor: theme.error + '20', // Add transparency
    },
    errorText: {
      ...styles.errorText,
      color: theme.error,
    },
  };

  // Load conversation messages
  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
      setActiveConversation(conversationId);
      
      // Mark messages as read when opening conversation
      markAsRead(conversationId);
    }
    
    // Cleanup: Clear active conversation when leaving
    return () => {
      setActiveConversation(null);
    };
  }, [conversationId, loadMessages, setActiveConversation, markAsRead]);

  // Handle send message
  const handleSendMessage = useCallback((content) => {
    if (localParticipant?.id) {
      sendMessage(localParticipant.id, content);
    }
  }, [sendMessage, localParticipant]);

  // Get conversation messages
  const conversationMessages = messages[conversationId] || [];

  // Get participant name
  const participantName = localParticipant?.firstName 
    ? `${localParticipant.firstName} ${localParticipant.lastName || ''}`.trim()
    : 'AA Member';
    
  return (
    <SafeAreaView style={themedStyles.container}>
      {/* Header with participant info */}
      <View style={themedStyles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons 
            name="arrow-left" 
            size={24} 
            color={theme.text} 
          />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={themedStyles.headerTitle}>{participantName}</Text>
          {localParticipant?.sobrietyYears && (
            <Text style={themedStyles.headerSubtitle}>
              {localParticipant.sobrietyYears.toFixed(1)} years sober
            </Text>
          )}
        </View>
      </View>
      
      {/* Error message if any */}
      {error && (
        <View style={themedStyles.errorContainer}>
          <Text style={themedStyles.errorText}>{error}</Text>
        </View>
      )}
      
      {/* Messages list */}
      <MessageList 
        messages={conversationMessages} 
        loading={loading}
        participant={localParticipant}
      />
      
      {/* Message input */}
      <MessageInput 
        onSend={handleSendMessage}
        loading={loading}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 15,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
  },
  errorContainer: {
    padding: 10,
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 5,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ConversationScreen;