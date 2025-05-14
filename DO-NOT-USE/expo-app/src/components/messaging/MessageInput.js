import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Component for inputting and sending messages
 */
const MessageInput = ({ onSend, loading, placeholder = "Type a message..." }) => {
  const { theme } = useTheme();
  const [message, setMessage] = useState('');

  // Create themed styles
  const themedStyles = {
    container: {
      ...styles.container,
      backgroundColor: theme.card,
      borderTopColor: theme.divider,
    },
    inputContainer: {
      ...styles.inputContainer,
      backgroundColor: theme.background,
      borderColor: theme.border,
    },
    input: {
      ...styles.input,
      color: theme.text,
    },
    sendButton: {
      ...styles.sendButton,
      backgroundColor: message.trim() ? theme.primary : theme.divider,
    },
  };

  const handleSend = () => {
    if (message.trim() && !loading) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const keyboardBehavior = Platform.OS === 'ios' ? 'padding' : 'height';

  return (
    <KeyboardAvoidingView behavior={keyboardBehavior}>
      <View style={themedStyles.container}>
        <View style={themedStyles.inputContainer}>
          <TextInput
            style={themedStyles.input}
            value={message}
            onChangeText={setMessage}
            placeholder={placeholder}
            placeholderTextColor={theme.textSecondary}
            multiline
            maxLength={1000}
            autoCapitalize="sentences"
            onSubmitEditing={handleSend}
            editable={!loading}
          />
          
          <TouchableOpacity
            style={themedStyles.sendButton}
            onPress={handleSend}
            disabled={!message.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <MaterialCommunityIcons name="send" size={22} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});

export default MessageInput;