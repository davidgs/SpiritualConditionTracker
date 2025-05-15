import React, { useState, useEffect, useRef, useContext } from 'react';
import { connectionOperations, messageOperations } from '../utils/database';
import { encryptMessage, decryptMessage } from '../utils/encryption';
import { ThemeContext } from '../contexts/ThemeContext';

export default function Messages({ setCurrentView, user }) {
  const { theme } = useContext(ThemeContext);
  const darkMode = theme === 'dark';
  
  const [connections, setConnections] = useState([]);
  const [activeConnectionId, setActiveConnectionId] = useState(null);
  const [activeConnection, setActiveConnection] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConnectionForm, setShowConnectionForm] = useState(false);
  const [newConnectionData, setNewConnectionData] = useState({
    name: '',
    contactInfo: ''
  });
  
  const messagesEndRef = useRef(null);

  // Load connections when component mounts
  useEffect(() => {
    loadConnections();
  }, [user]);

  // Load messages when active connection changes
  useEffect(() => {
    if (activeConnectionId) {
      loadMessages(activeConnectionId);
    }
  }, [activeConnectionId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load all user connections
  const loadConnections = () => {
    try {
      setLoading(true);
      const userConnections = connectionOperations.getAll().filter(
        conn => conn.userId === user?.id || conn.contactId === user?.id
      );
      setConnections(userConnections);
      
      // Set active connection if none is selected and we have connections
      if (!activeConnectionId && userConnections.length > 0) {
        setActiveConnectionId(userConnections[0].id);
        setActiveConnection(userConnections[0]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading connections:', err);
      setError('Failed to load your connections. Please try again.');
      setLoading(false);
    }
  };

  // Load messages for a specific connection
  const loadMessages = async (connectionId) => {
    try {
      setLoading(true);
      
      // Find the active connection
      const connection = connections.find(c => c.id === connectionId);
      setActiveConnection(connection);
      
      if (!connection) {
        setMessages([]);
        setLoading(false);
        return;
      }
      
      // Get encrypted messages
      const encryptedMessages = messageOperations.getByConversationId(connectionId);
      
      // Decrypt messages if encryption key exists
      if (connection.encryptionKey) {
        const decryptedMessages = await Promise.all(
          encryptedMessages.map(async (msg) => {
            try {
              if (msg.encrypted) {
                return {
                  ...msg,
                  content: await decryptMessage(msg.content, connection.encryptionKey),
                  decrypted: true
                };
              }
              return msg;
            } catch (err) {
              console.error('Failed to decrypt message:', err);
              return {
                ...msg,
                content: '[Encrypted message - unable to decrypt]',
                decryptError: true
              };
            }
          })
        );
        setMessages(decryptedMessages);
      } else {
        // If no encryption key, just show the messages as is
        setMessages(encryptedMessages);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load messages. Please try again.');
      setLoading(false);
    }
  };

  // Send a new message
  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConnection) return;
    
    try {
      let messageContent = newMessage;
      let isEncrypted = false;
      
      // Encrypt the message if an encryption key exists
      if (activeConnection.encryptionKey) {
        messageContent = await encryptMessage(newMessage, activeConnection.encryptionKey);
        isEncrypted = true;
      }
      
      // Create message object
      const message = {
        id: Date.now().toString(),
        conversationId: activeConnection.id,
        senderId: user.id,
        receiverId: activeConnection.userId === user.id 
          ? activeConnection.contactId 
          : activeConnection.userId,
        content: messageContent,
        encrypted: isEncrypted,
        read: false,
        createdAt: new Date().toISOString()
      };
      
      // Save to database
      const savedMessage = messageOperations.create(message);
      
      // Update UI with decrypted version
      setMessages(prev => [...prev, {
        ...savedMessage,
        content: newMessage,
        decrypted: true
      }]);
      
      // Clear input
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send your message. Please try again.');
    }
  };

  // Create a new connection
  const createConnection = () => {
    if (!newConnectionData.name.trim()) {
      setError('Please enter a name for this connection');
      return;
    }
    
    try {
      // Generate a shared encryption key for this conversation
      const encryptionKey = window.btoa(
        Array.from(crypto.getRandomValues(new Uint8Array(32)))
          .map(byte => String.fromCharCode(byte))
          .join('')
      );
      
      // Create new connection
      const newConnection = {
        id: Date.now().toString(),
        userId: user.id,
        contactId: `contact-${Date.now()}`, // Temporary ID for the contact
        name: newConnectionData.name,
        contactInfo: newConnectionData.contactInfo,
        encryptionKey: encryptionKey,
        status: 'active',
        createdAt: new Date().toISOString()
      };
      
      // Save to database
      const savedConnection = connectionOperations.create(newConnection);
      
      // Update UI
      setConnections(prev => [...prev, savedConnection]);
      setActiveConnectionId(savedConnection.id);
      setActiveConnection(savedConnection);
      setShowConnectionForm(false);
      setNewConnectionData({ name: '', contactInfo: '' });
    } catch (err) {
      console.error('Error creating connection:', err);
      setError('Failed to create the connection. Please try again.');
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <div className="p-4 pb-20 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Messages</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Securely connect with your support network</p>
        </div>
        <button
          onClick={() => setShowConnectionForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full"
        >
          <i className="fa-solid fa-plus"></i>
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
          <span className="block sm:inline">{error}</span>
          <button
            className="absolute top-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </div>
      )}

      {loading && connections.length === 0 ? (
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      ) : connections.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
          <i className="fa-solid fa-comments text-gray-300 dark:text-gray-600 text-6xl mb-4"></i>
          <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">No Connections Yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Create a connection to start messaging securely with your AA support network.
          </p>
          <button
            onClick={() => setShowConnectionForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Create Connection
          </button>
        </div>
      ) : (
        <div className="flex-grow flex h-full overflow-hidden">
          {/* Connections sidebar */}
          <div className="w-1/3 pr-2 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            {connections.map(connection => (
              <div
                key={connection.id}
                onClick={() => setActiveConnectionId(connection.id)}
                className={`p-3 mb-2 rounded cursor-pointer transition-colors ${
                  activeConnectionId === connection.id
                    ? 'bg-blue-100 dark:bg-blue-900'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <div className="font-medium text-gray-800 dark:text-gray-200">
                  {connection.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {connection.lastMessageAt ? formatDate(connection.lastMessageAt) : 'No messages yet'}
                </div>
              </div>
            ))}
          </div>

          {/* Messages area */}
          <div className="w-2/3 pl-2 flex flex-col">
            {activeConnection ? (
              <>
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="font-medium text-gray-800 dark:text-gray-200">
                    {activeConnection.name}
                  </div>
                  {activeConnection.encryptionKey && (
                    <div className="text-xs text-green-500 flex items-center">
                      <i className="fa-solid fa-lock mr-1"></i> Encrypted
                    </div>
                  )}
                </div>

                <div className="flex-grow overflow-y-auto p-3">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <i className="fa-solid fa-envelope text-gray-300 dark:text-gray-600 text-4xl mb-2"></i>
                      <p className="text-gray-500 dark:text-gray-400">
                        No messages yet. Start the conversation!
                      </p>
                    </div>
                  ) : (
                    messages.map(message => (
                      <div
                        key={message.id}
                        className={`mb-3 max-w-[80%] ${
                          message.senderId === user.id
                            ? 'ml-auto bg-blue-500 text-white rounded-bl-lg rounded-tl-lg rounded-tr-lg'
                            : 'mr-auto bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-br-lg rounded-tr-lg rounded-tl-lg'
                        } p-3 relative`}
                      >
                        {message.decryptError && (
                          <div className="text-xs text-red-500 mb-1">
                            <i className="fa-solid fa-exclamation-triangle mr-1"></i>
                            Decryption error
                          </div>
                        )}
                        <div>{message.content}</div>
                        <div className="text-xs opacity-70 text-right mt-1">
                          {formatTime(message.createdAt)}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <input
                      type="text"
                      className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-l bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <button
                      onClick={sendMessage}
                      className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-r px-4"
                    >
                      <i className="fa-solid fa-paper-plane"></i>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">
                  Select a connection to view messages
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Connection Modal */}
      {showConnectionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-4">
            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-4">
              Create New Connection
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  placeholder="Enter name"
                  value={newConnectionData.name}
                  onChange={(e) => setNewConnectionData({
                    ...newConnectionData,
                    name: e.target.value
                  })}
                />
              </div>
              
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">
                  Contact Info (optional)
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  placeholder="Phone or email"
                  value={newConnectionData.contactInfo}
                  onChange={(e) => setNewConnectionData({
                    ...newConnectionData,
                    contactInfo: e.target.value
                  })}
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setShowConnectionForm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={createConnection}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}