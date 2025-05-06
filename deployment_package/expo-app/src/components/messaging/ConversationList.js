import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { formatConversationTime } from '../../utils/dateFormat';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * Displays a list of conversations
 */
const ConversationList = ({ 
  conversations, 
  onSelectConversation, 
  loading, 
  onRefresh,
  refreshing = false
}) => {
  const { theme } = useTheme();

  // Create themed styles
  const themedStyles = {
    container: {
      ...styles.container,
      backgroundColor: theme.background,
    },
    conversationItem: {
      ...styles.conversationItem,
      borderBottomColor: theme.divider,
    },
    participantName: {
      ...styles.participantName,
      color: theme.text,
    },
    lastMessage: {
      ...styles.lastMessage,
      color: theme.textSecondary,
    },
    timestamp: {
      ...styles.timestamp,
      color: theme.textSecondary,
    },
    unreadBadge: {
      ...styles.unreadBadge,
      backgroundColor: theme.primary,
    },
    unreadText: {
      ...styles.unreadText,
    },
    emptyContainer: {
      ...styles.emptyContainer,
    },
    emptyText: {
      ...styles.emptyText,
      color: theme.textSecondary,
    },
    emptySubText: {
      ...styles.emptySubText,
      color: theme.textSecondary,
    },
  };

  // Render each conversation item
  const renderConversationItem = ({ item }) => {
    // Get participant info
    const participantName = item.participant?.firstName 
      ? `${item.participant.firstName} ${item.participant.lastName || ''}`.trim()
      : 'AA Member';
    
    // Format timestamp
    const time = formatConversationTime(item.lastMessageTimestamp);
    
    // Check for unread messages
    const hasUnread = item.unreadCount > 0;
    
    return (
      <TouchableOpacity 
        style={themedStyles.conversationItem}
        onPress={() => onSelectConversation(item)}
      >
        <View style={styles.conversationContent}>
          <View style={styles.conversationInfo}>
            <Text 
              style={[
                themedStyles.participantName, 
                hasUnread && styles.bold
              ]}
              numberOfLines={1}
            >
              {participantName}
            </Text>
            <Text 
              style={themedStyles.lastMessage}
              numberOfLines={1}
            >
              {item.lastMessagePreview}
            </Text>
          </View>
          
          <View style={styles.conversationMeta}>
            <Text 
              style={[themedStyles.timestamp, hasUnread && styles.bold]}
            >
              {time}
            </Text>
            
            {hasUnread && (
              <View style={themedStyles.unreadBadge}>
                <Text style={themedStyles.unreadText}>
                  {item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Empty state if no conversations
  const renderEmptyComponent = () => {
    if (loading) {
      return (
        <View style={themedStyles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={themedStyles.emptyText}>Loading conversations...</Text>
        </View>
      );
    }
    
    return (
      <View style={themedStyles.emptyContainer}>
        <MaterialCommunityIcons 
          name="message-text-outline" 
          size={50} 
          color={theme.textSecondary} 
        />
        <Text style={themedStyles.emptyText}>No conversations yet</Text>
        <Text style={themedStyles.emptySubText}>
          Connect with members nearby to start messaging
        </Text>
      </View>
    );
  };

  return (
    <View style={themedStyles.container}>
      <FlatList
        data={conversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyComponent()}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  conversationItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  conversationContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  conversationInfo: {
    flex: 1,
    marginRight: 10,
  },
  participantName: {
    fontSize: 16,
    marginBottom: 5,
  },
  lastMessage: {
    fontSize: 14,
  },
  conversationMeta: {
    alignItems: 'flex-end',
  },
  timestamp: {
    fontSize: 12,
    marginBottom: 5,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bold: {
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: '80%',
  },
});

export default ConversationList;