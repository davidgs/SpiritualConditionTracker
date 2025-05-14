import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useMessaging } from '../contexts/MessagingContext';
import { useTheme } from '../contexts/ThemeContext';
import ConversationList from '../components/messaging/ConversationList';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * Screen to display all conversations
 */
const MessagingScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { 
    conversations, 
    loadConversations, 
    loading, 
    error,
    startConversation
  } = useMessaging();
  const [refreshing, setRefreshing] = useState(false);

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
    title: {
      ...styles.title,
      color: theme.text,
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

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  // Handle selecting a conversation
  const handleSelectConversation = (conversation) => {
    navigation.navigate('Conversation', {
      conversationId: conversation.id,
      participant: conversation.participant,
    });
  };

  return (
    <SafeAreaView style={themedStyles.container}>
      {/* Header */}
      <View style={themedStyles.header}>
        <Text style={themedStyles.title}>Messages</Text>
      </View>
      
      {/* Error message if any */}
      {error && (
        <View style={themedStyles.errorContainer}>
          <Text style={themedStyles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadConversations}
          >
            <Text style={[themedStyles.errorText, styles.retryText]}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Conversation list */}
      <ConversationList 
        conversations={conversations}
        onSelectConversation={handleSelectConversation}
        loading={loading && !refreshing}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 5,
  },
  errorText: {
    fontSize: 14,
    flex: 1,
  },
  retryButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  retryText: {
    fontWeight: 'bold',
    textAlign: 'right',
  },
});

export default MessagingScreen;