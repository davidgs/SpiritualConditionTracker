import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useUser } from '../../contexts/UserContext';
import { formatDate, formatMessageTime } from '../../utils/dateFormat';

/**
 * Displays a list of messages in a conversation
 */
const MessageList = ({ messages, loading, participant }) => {
  const { theme } = useTheme();
  const { user } = useUser();
  const scrollViewRef = useRef();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollViewRef.current && messages?.length > 0) {
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Create themed styles
  const themedStyles = {
    container: {
      ...styles.container,
      backgroundColor: theme.background,
    },
    messageContainer: {
      ...styles.messageContainer,
    },
    messageBubble: {
      ...styles.messageBubble,
      backgroundColor: theme.card,
      ...theme.shadow,
    },
    myMessageBubble: {
      ...styles.messageBubble,
      ...styles.myMessageBubble,
      backgroundColor: theme.primary,
      ...theme.shadow,
    },
    messageText: {
      ...styles.messageText,
      color: theme.text,
    },
    myMessageText: {
      ...styles.messageText,
      color: '#FFFFFF',
    },
    timestampText: {
      ...styles.timestampText,
      color: theme.textSecondary,
    },
    myTimestampText: {
      ...styles.timestampText,
      color: 'rgba(255, 255, 255, 0.8)',
    },
    senderName: {
      ...styles.senderName,
      color: theme.textSecondary,
    },
    emptyContainer: {
      ...styles.emptyContainer,
    },
    emptyText: {
      ...styles.emptyText,
      color: theme.textSecondary,
    },
    dateSeparator: {
      ...styles.dateSeparator,
    },
    dateSeparatorLine: {
      ...styles.dateSeparatorLine,
      backgroundColor: theme.divider,
    },
    dateSeparatorText: {
      ...styles.dateSeparatorText,
      color: theme.textSecondary,
      backgroundColor: theme.background,
    },
  };

  // Show loading indicator if data is loading
  if (loading) {
    return (
      <View style={[themedStyles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={themedStyles.emptyText}>Loading messages...</Text>
      </View>
    );
  }

  // Show empty state if no messages
  if (!messages || messages.length === 0) {
    return (
      <View style={[themedStyles.container, themedStyles.emptyContainer]}>
        <Text style={themedStyles.emptyText}>
          No messages yet. Start the conversation!
        </Text>
      </View>
    );
  }

  // Group messages by date
  const groupMessagesByDate = () => {
    if (!messages || messages.length === 0) return [];
    
    const groups = [];
    let currentDate = null;
    let currentGroup = [];
    
    messages.forEach(message => {
      const messageDate = new Date(message.timestamp);
      const dateString = messageDate.toLocaleDateString();
      
      if (dateString !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, messages: currentGroup });
        }
        currentDate = dateString;
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    });
    
    if (currentGroup.length > 0) {
      groups.push({ date: currentDate, messages: currentGroup });
    }
    
    return groups;
  };

  const messageGroups = groupMessagesByDate();

  return (
    <ScrollView 
      style={themedStyles.container}
      ref={scrollViewRef}
      contentContainerStyle={styles.scrollContent}
    >
      {messageGroups.map((group, groupIndex) => (
        <View key={groupIndex}>
          {/* Date separator */}
          <View style={themedStyles.dateSeparator}>
            <View style={themedStyles.dateSeparatorLine} />
            <Text style={themedStyles.dateSeparatorText}>
              {formatDate(new Date(group.date))}
            </Text>
            <View style={themedStyles.dateSeparatorLine} />
          </View>

          {/* Messages for this date */}
          {group.messages.map((message, index) => {
            const isMyMessage = message.senderId === user?.id;
            const showSenderName = !isMyMessage && participant;
            
            return (
              <View 
                key={message.id || index} 
                style={[
                  themedStyles.messageContainer,
                  isMyMessage ? styles.myMessageContainer : null
                ]}
              >
                <View 
                  style={[
                    isMyMessage ? themedStyles.myMessageBubble : themedStyles.messageBubble,
                  ]}
                >
                  {showSenderName && (
                    <Text style={themedStyles.senderName}>
                      {participant.firstName || 'Member'}
                    </Text>
                  )}
                  <Text style={isMyMessage ? themedStyles.myMessageText : themedStyles.messageText}>
                    {message.content}
                  </Text>
                  <Text 
                    style={isMyMessage ? themedStyles.myTimestampText : themedStyles.timestampText}
                  >
                    {formatMessageTime(message.timestamp)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ))}
      
      {/* Extra space at bottom for new messages */}
      <View style={styles.bottomSpace} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  messageContainer: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  myMessageBubble: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  timestampText: {
    fontSize: 11,
    textAlign: 'right',
  },
  senderName: {
    fontSize: 12,
    marginBottom: 4,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
  },
  bottomSpace: {
    height: 20,
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  dateSeparatorLine: {
    flex: 1,
    height: 1,
  },
  dateSeparatorText: {
    paddingHorizontal: 10,
    fontSize: 12,
    fontWeight: '500',
  },
});

export default MessageList;