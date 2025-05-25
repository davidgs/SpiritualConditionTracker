import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  IconButton, 
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  Fab,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { formatDateForDisplay } from '../utils/dateUtils';
// Not using UUIDs for database IDs
import SponsorContactTodo from './SponsorContactTodo';

export default function SponsorContactDetailsPage({ 
  contact, 
  details = [], 
  onBack, 
  onSaveDetails, 
  onUpdateContact,
  onDeleteContact,
  onDeleteDetail
}) {
  const theme = useTheme();
  const [contactDetails, setContactDetails] = useState(details);
  const [showAddActionForm, setShowAddActionForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddActionDialog, setShowAddActionDialog] = useState(false);
  
  // Form state for new action item
  const [newAction, setNewAction] = useState({
    actionItem: '',
    notes: '',
    dueDate: '',
    completed: false
  });
  
  // State for action items - using a ref to avoid infinite loops
  const [actionItems, setActionItems] = useState([]);
  const actionItemsRef = React.useRef([]);
  
  // Native iOS - Load action items when contact changes
  useEffect(() => {
    if (!contact || !contact.id) return;
    
    // Set contact details from props
    setContactDetails(details);
    
    // For native iOS environment - use SQLite via Capacitor
    // This will load action items directly from the database using a direct SQL approach
    async function loadActionItemsFromDatabase() {
      try {
        console.log(`[SponsorContactDetailsPage.js - loadActionItemsFromDatabase: 64] Loading action items for contact ID: ${contact.id}`);
        
        // Use direct SQLite access to avoid any wrapper issues
        const getSQLite = () => {
          if (!window.Capacitor?.Plugins?.CapacitorSQLite) {
            throw new Error('CapacitorSQLite plugin not available');
          }
          return window.Capacitor.Plugins.CapacitorSQLite;
        };
        
        const sqlite = getSQLite();
        const DB_NAME = 'spiritualTracker.db';
        
        // Ensure tables exist
        console.log(`[SponsorContactDetailsPage.js - loadActionItemsFromDatabase: 76] Ensuring tables exist`);
        await sqlite.execute({
          database: DB_NAME,
          statements: `
            CREATE TABLE IF NOT EXISTS action_items (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              title TEXT DEFAULT '',
              text TEXT DEFAULT '',
              notes TEXT DEFAULT '',
              dueDate TEXT DEFAULT NULL,
              completed INTEGER DEFAULT 0,
              type TEXT DEFAULT 'todo',
              createdAt TEXT,
              updatedAt TEXT
            )
          `
        });
        
        await sqlite.execute({
          database: DB_NAME,
          statements: `
            CREATE TABLE IF NOT EXISTS sponsor_contact_action_items (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              contactId INTEGER,
              actionItemId INTEGER,
              createdAt TEXT,
              FOREIGN KEY (contactId) REFERENCES sponsor_contacts(id),
              FOREIGN KEY (actionItemId) REFERENCES action_items(id)
            )
          `
        });
        
        // Direct SQL query to get action items
        console.log(`[SponsorContactDetailsPage.js - loadActionItemsFromDatabase: 103] Executing SQL query for contact's action items`);
        const sqlQuery = `
          SELECT ai.* 
          FROM action_items ai
          JOIN sponsor_contact_action_items scai ON ai.id = scai.actionItemId
          WHERE scai.contactId = ${contact.id}
          ORDER BY ai.createdAt DESC
        `;
        
        console.log(`[SponsorContactDetailsPage.js - loadActionItemsFromDatabase: 111] SQL: ${sqlQuery}`);
        
        const result = await sqlite.query({
          database: DB_NAME,
          statement: sqlQuery,
          values: []
        });
        
        console.log(`[SponsorContactDetailsPage.js - loadActionItemsFromDatabase: 118] Query result:`, JSON.stringify(result));
        
        let actionItemsFound = [];
        
        // Process the result based on the format
        if (result.values && result.values.length > 0) {
          if (result.values[0].ios_columns) {
            // iOS format - skip the first item with column info
            if (result.values.length > 1) {
              actionItemsFound = result.values.slice(1);
              console.log(`[SponsorContactDetailsPage.js - loadActionItemsFromDatabase: 128] Found ${actionItemsFound.length} action items (iOS format)`);
              
              // Log each item
              actionItemsFound.forEach((item, index) => {
                console.log(`[SponsorContactDetailsPage.js - loadActionItemsFromDatabase: 132] Item ${index}: ID=${item.id}, Title=${item.title}, Completed=${item.completed}`);
              });
            } else {
              console.log(`[SponsorContactDetailsPage.js - loadActionItemsFromDatabase: 135] No action items found (iOS format with only column info)`);
            }
          } else {
            // Standard format
            actionItemsFound = result.values;
            console.log(`[SponsorContactDetailsPage.js - loadActionItemsFromDatabase: 140] Found ${actionItemsFound.length} action items (standard format)`);
            
            // Log each item
            actionItemsFound.forEach((item, index) => {
              console.log(`[SponsorContactDetailsPage.js - loadActionItemsFromDatabase: 144] Item ${index}: ID=${item.id}, Title=${item.title}, Completed=${item.completed}`);
            });
          }
          
          // Set the found items to state
          setActionItems(actionItemsFound);
          actionItemsRef.current = actionItemsFound;
        } else {
          console.log(`[SponsorContactDetailsPage.js - loadActionItemsFromDatabase: 152] No action items found in database for contact: ${contact.id}`);
          
          // Check the join table directly to debug
          console.log(`[SponsorContactDetailsPage.js - loadActionItemsFromDatabase: 155] Checking join table entries`);
          const joinQuery = `
            SELECT * FROM sponsor_contact_action_items 
            WHERE contactId = ${contact.id}
          `;
          
          const joinResult = await sqlite.query({
            database: DB_NAME,
            statement: joinQuery,
            values: []
          });
          
          console.log(`[SponsorContactDetailsPage.js - loadActionItemsFromDatabase: 165] Join table result:`, JSON.stringify(joinResult));
          
          // Still show any todo items from contact details for backward compatibility
          const todoItems = details.filter(item => item.type === 'todo');
          if (todoItems.length > 0) {
            console.log(`[SponsorContactDetailsPage.js - loadActionItemsFromDatabase: 170] Found ${todoItems.length} legacy todo items`);
            
            // Log each legacy item for debugging
            todoItems.forEach((item, index) => {
              console.log(`[SponsorContactDetailsPage.js - loadActionItemsFromDatabase: 174] Legacy item ${index}: ID=${item.id}, Text=${item.text || item.actionItem}, Completed=${item.completed}`);
            });
            
            setActionItems(todoItems);
            actionItemsRef.current = todoItems;
          } else {
            // Initialize with empty array
            console.log(`[SponsorContactDetailsPage.js - loadActionItemsFromDatabase: 181] No legacy items found, initializing with empty array`);
            setActionItems([]);
            actionItemsRef.current = [];
          }
        }
      } catch (error) {
        console.error('[SponsorContactDetailsPage.js - loadActionItemsFromDatabase: 186] Error loading action items:', error);
      }
    }
    
    // Execute the function to load action items
    loadActionItemsFromDatabase();
    
    // Add a debug message when this effect runs
    console.log(`[SponsorContactDetailsPage.js - useEffect: 105] Action items loading effect triggered for contact ID: ${contact.id}`);
    
  }, [contact, details]);
  
  // Handle form changes for new action item
  const handleActionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAction(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Add new action directly from the form
  const handleAddActionFromForm = () => {
    // In SQLite, the ID will be generated automatically with AUTOINCREMENT
    // We'll use a temporary negative ID for the UI state only
    const tempId = -Math.floor(Math.random() * 10000) - 1;
    
    // Format the action item for our new action_items table
    const actionItem = {
      title: newAction.actionItem,
      text: newAction.actionItem,
      notes: newAction.notes || '',
      dueDate: newAction.dueDate || null,
      completed: newAction.completed ? 1 : 0,
      type: 'todo',
      id: tempId // Temporary ID for UI state
    };
    
    // Add to local state for immediate UI update
    setActionItems(prev => [actionItem, ...prev]);
    
    // Use async IIFE to handle the database operation
    (async () => {
      try {
        // Import is done inside to avoid circular dependencies
        const sponsorDB = await import('../utils/sponsor-database');
        
        // Save to database using the new addActionItem function
        const savedItem = await sponsorDB.addActionItem(actionItem, contact.id);
        console.log('Action item saved with ID:', savedItem.id);
        
        // Update the local state with the real ID
        setActionItems(prev => 
          prev.map(item => 
            item.id === tempId ? { ...item, id: savedItem.id } : item
          )
        );
      } catch (error) {
        console.error('Error saving action item:', error);
      }
    })();
    
    // Reset form and hide it
    setNewAction({
      actionItem: '',
      notes: '',
      dueDate: '',
      completed: false
    });
    setShowAddActionForm(false);
    setShowAddActionDialog(false);
  };
  
  // Toggle action item completion
  const handleToggleComplete = (id) => {
    const updatedDetails = contactDetails.map(detail => {
      if (detail.id === id) {
        const updatedDetail = {
          ...detail,
          completed: detail.completed ? 0 : 1 // Toggle between 0 and 1
        };
        // Update in database
        onSaveDetails(updatedDetail);
        return updatedDetail;
      }
      return detail;
    });
    
    setContactDetails(updatedDetails);
  };
  
  // Native iOS implementation for adding action items
  const handleAddActionItem = async (todoItem) => {
    // Generate a temporary ID for immediate UI update
    const tempId = -Math.floor(Math.random() * 10000) - 1;
    
    // Prepare the action item object for SQLite storage
    const newItem = {
      id: tempId,
      title: todoItem.title || todoItem.text || '',
      text: todoItem.text || todoItem.title || '',
      notes: todoItem.notes || '',
      dueDate: todoItem.dueDate || null,
      completed: 0,
      type: 'todo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log(`[SponsorContactDetailsPage - handleAddActionItem] Adding action item for contact ID: ${contact?.id}`);
    
    // Update UI immediately for responsiveness
    const updatedItems = [newItem, ...actionItemsRef.current];
    actionItemsRef.current = updatedItems;
    setActionItems(updatedItems);
    
    if (contact?.id) {
      try {
        // Use a direct import of the SQLite instance to ensure we bypass any wrapper issues
        const getSQLite = () => {
          if (!window.Capacitor?.Plugins?.CapacitorSQLite) {
            throw new Error('CapacitorSQLite plugin not available');
          }
          return window.Capacitor.Plugins.CapacitorSQLite;
        };
        
        // First, make sure the table exists
        console.log(`[SponsorContactDetailsPage.js - handleAddActionItem: 227] Ensuring action_items table exists`);
        const sqlite = getSQLite();
        
        // Database name must match what's used elsewhere
        const DB_NAME = 'spiritualTracker.db';
        
        // Create the table if it doesn't exist
        await sqlite.execute({
          database: DB_NAME,
          statements: `
            CREATE TABLE IF NOT EXISTS action_items (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              title TEXT DEFAULT '',
              text TEXT DEFAULT '',
              notes TEXT DEFAULT '',
              dueDate TEXT DEFAULT NULL,
              completed INTEGER DEFAULT 0,
              type TEXT DEFAULT 'todo',
              createdAt TEXT,
              updatedAt TEXT
            )
          `
        });
        
        console.log(`[SponsorContactDetailsPage.js - handleAddActionItem: 247] Creating join table if not exists`);
        await sqlite.execute({
          database: DB_NAME,
          statements: `
            CREATE TABLE IF NOT EXISTS sponsor_contact_action_items (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              contactId INTEGER,
              actionItemId INTEGER,
              createdAt TEXT,
              FOREIGN KEY (contactId) REFERENCES sponsor_contacts(id),
              FOREIGN KEY (actionItemId) REFERENCES action_items(id)
            )
          `
        });
        
        // Directly insert the action item using SQL
        console.log(`**********************************************************`);
        console.log(`************* INSERTING INTO ACTION_ITEMS TABLE ***********`);
        console.log(`**********************************************************`);
        
        const insertSQL = `
          INSERT INTO action_items 
          (title, text, notes, dueDate, completed, type, createdAt, updatedAt) 
          VALUES 
          ('${newItem.title.replace(/'/g, "''")}', 
           '${newItem.text.replace(/'/g, "''")}', 
           '${newItem.notes.replace(/'/g, "''")}', 
           ${newItem.dueDate ? `'${newItem.dueDate}'` : 'NULL'}, 
           ${newItem.completed}, 
           '${newItem.type}',
           '${newItem.createdAt}',
           '${newItem.updatedAt}')
        `;
        
        console.log(`[SponsorContactDetailsPage.js - handleAddActionItem: 276] EXECUTING SQL: ${insertSQL}`);
        
        // Execute the direct SQL insertion
        const insertResult = await sqlite.execute({
          database: DB_NAME,
          statements: insertSQL
        });
        
        console.log(`**********************************************************`);
        console.log(`************* ACTION ITEM SAVED SUCCESSFULLY *************`);
        console.log(`**********************************************************`);
        console.log(`[SponsorContactDetailsPage.js - handleAddActionItem: 283] INSERT RESULT:`, JSON.stringify(insertResult));
        
        // Get the ID of the inserted record
        const idResult = await sqlite.query({
          database: DB_NAME,
          statement: 'SELECT last_insert_rowid() as id',
          values: []
        });
        
        console.log(`[SponsorContactDetailsPage.js - handleAddActionItem: 291] ID query result:`, JSON.stringify(idResult));
        
        let newId = null;
        if (idResult.values && idResult.values.length > 0) {
          if (idResult.values[0].ios_columns) {
            // iOS format
            newId = idResult.values[1]?.id;
          } else {
            // Standard format
            newId = idResult.values[0]?.id;
          }
        }
        
        console.log(`[SponsorContactDetailsPage.js - handleAddActionItem: 303] Extracted ID: ${newId}`);
        
        // Create a savedItem object with the new ID
        const savedItem = { ...newItem, id: newId };
        
        if (newId) {
          console.log(`[SponsorContactDetailsPage.js - handleAddActionItem: 309] Action item saved with ID: ${newId}`);
          
          // Create the association directly in the join table
          console.log(`[SponsorContactDetailsPage.js - handleAddActionItem: 312] Creating join table entry for contact ${contact.id} and action item ${newId}`);
          
          const now = new Date().toISOString();
          const joinSQL = `
            INSERT INTO sponsor_contact_action_items
            (contactId, actionItemId, createdAt)
            VALUES
            (${contact.id}, ${newId}, '${now}')
          `;
          
          console.log(`[SponsorContactDetailsPage.js - handleAddActionItem: 321] Join SQL: ${joinSQL}`);
          
          const joinResult = await sqlite.execute({
            database: DB_NAME,
            statements: joinSQL
          });
          
          console.log(`[SponsorContactDetailsPage.js - handleAddActionItem: 327] Join result:`, JSON.stringify(joinResult));
          
          // Update local state with real database ID
          const itemsWithRealId = actionItems.map(item => 
            item.id === tempId ? { ...savedItem } : item
          );
          setActionItems(itemsWithRealId);
          actionItemsRef.current = itemsWithRealId;
          
          // Verify the items are now associated with the contact
          console.log(`[SponsorContactDetailsPage.js - handleAddActionItem: 335] Verifying items are associated with contact`);
          const verifySQL = `
            SELECT ai.*
            FROM action_items ai
            JOIN sponsor_contact_action_items scai ON ai.id = scai.actionItemId
            WHERE scai.contactId = ${contact.id}
          `;
          
          const verifyResult = await sqlite.query({
            database: DB_NAME,
            statement: verifySQL,
            values: []
          });
          
          console.log(`[SponsorContactDetailsPage.js - handleAddActionItem: 347] Verification result:`, JSON.stringify(verifyResult));
          
          // Log each found item
          if (verifyResult.values && verifyResult.values.length > 0) {
            if (verifyResult.values[0].ios_columns) {
              // iOS format
              console.log(`[SponsorContactDetailsPage.js - handleAddActionItem: 353] Found ${verifyResult.values.length - 1} action items for contact ${contact.id}`);
              for (let i = 1; i < verifyResult.values.length; i++) {
                console.log(`[SponsorContactDetailsPage.js - handleAddActionItem: 355] Item ${i}: ID=${verifyResult.values[i].id}, Title=${verifyResult.values[i].title}`);
              }
            } else {
              // Standard format
              console.log(`[SponsorContactDetailsPage.js - handleAddActionItem: 359] Found ${verifyResult.values.length} action items for contact ${contact.id}`);
              verifyResult.values.forEach((item, index) => {
                console.log(`[SponsorContactDetailsPage.js - handleAddActionItem: 361] Item ${index}: ID=${item.id}, Title=${item.title}`);
              });
            }
          } else {
            console.log(`[SponsorContactDetailsPage.js - handleAddActionItem: 365] No action items found for contact ${contact.id} after saving`);
          }
        }
      } catch (error) {
        console.error(`[SponsorContactDetailsPage - handleAddActionItem] Error saving to SQLite:`, error);
      }
    }
  };
  
  // Toggle action item completion - Native iOS implementation
  const handleToggleActionItem = async (actionItemId) => {
    // Update UI immediately for responsiveness
    setActionItems(prev => prev.map(item => 
      item.id === actionItemId 
        ? {...item, completed: item.completed === 1 ? 0 : 1}
        : item
    ));
    
    // Also update the ref to keep state consistent
    actionItemsRef.current = actionItemsRef.current.map(item => 
      item.id === actionItemId 
        ? {...item, completed: item.completed === 1 ? 0 : 1}
        : item
    );
    
    // Update in SQLite database
    try {
      console.log(`[SponsorContactDetailsPage - handleToggleActionItem] Toggling action item ${actionItemId} in database`);
      const { toggleActionItemCompletion } = await import('../utils/action-items');
      
      // Update in database
      const updatedItem = await toggleActionItemCompletion(actionItemId);
      console.log(`[SponsorContactDetailsPage - handleToggleActionItem] Database update result:`, JSON.stringify(updatedItem));
      
      if (contact?.id) {
        // Verify with database state
        const { getActionItemsForContact } = await import('../utils/action-items');
        const refreshedItems = await getActionItemsForContact(contact.id);
        console.log(`[SponsorContactDetailsPage - handleToggleActionItem] Refreshed items from database:`, refreshedItems.length);
      }
    } catch (error) {
      console.error(`[SponsorContactDetailsPage - handleToggleActionItem] Error updating in database:`, error);
    }
  };
  
  // Delete action item - Native iOS implementation
  const handleDeleteActionItem = async (actionItemId) => {
    // Update UI immediately for responsiveness
    setActionItems(prev => prev.filter(item => item.id !== actionItemId));
    actionItemsRef.current = actionItemsRef.current.filter(item => item.id !== actionItemId);
    
    // Delete from SQLite database
    try {
      console.log(`[SponsorContactDetailsPage - handleDeleteActionItem] Deleting action item ${actionItemId} from database`);
      const { deleteActionItem } = await import('../utils/action-items');
      
      // First delete the association, then the action item
      const success = await deleteActionItem(actionItemId);
      console.log(`[SponsorContactDetailsPage - handleDeleteActionItem] Database delete result: ${success}`);
      
      if (contact?.id) {
        // Verify current state from database
        const { getActionItemsForContact } = await import('../utils/action-items');
        const remainingItems = await getActionItemsForContact(contact.id);
        console.log(`[SponsorContactDetailsPage - handleDeleteActionItem] Remaining items in database: ${remainingItems.length}`);
      }
    } catch (error) {
      console.error(`[SponsorContactDetailsPage - handleDeleteActionItem] Error deleting from database:`, error);
    }
  };
  
  // Get contact type label for display
  const getContactTypeLabel = (type) => {
    const typeLabels = {
      'phone': 'Phone Call',
      'in-person': 'In Person',
      'video': 'Video Call',
      'text': 'Text Message',
      'email': 'Email',
      'other': 'Other'
    };
    
    return typeLabels[type] || 'Contact';
  };
  
  // Get icon for contact type
  const getContactTypeIcon = (type) => {
    const typeIcons = {
      'phone': 'fa-phone',
      'in-person': 'fa-people-arrows',
      'video': 'fa-video',
      'text': 'fa-comment-sms',
      'email': 'fa-envelope',
      'other': 'fa-handshake'
    };
    
    return typeIcons[type] || 'fa-handshake';
  };
  
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header with back button */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 3,
        mt: -1
      }}>
        <IconButton 
          onClick={onBack}
          sx={{ mr: 1, color: theme.palette.primary.main }}
        >
          <i className="fa-solid fa-arrow-left"></i>
        </IconButton>
        <Typography 
          variant="h5" 
          component="h1"
          sx={{ 
            fontWeight: 'bold',
            color: theme.palette.text.primary
          }}
        >
          Sponsor Contact Details
        </Typography>
      </Box>
      
      {/* Contact Summary Card */}
      <Paper
        elevation={1}
        sx={{ 
          p: 2.5, 
          mb: 3, 
          borderRadius: 2,
          bgcolor: theme.palette.background.paper,
          border: 1,
          borderColor: 'divider',
          borderLeft: 4,
          borderLeftColor: 'primary.main'
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 2
        }}>
          {/* Contact Type Icon */}
          <Box sx={{ 
            mt: 0.5,
            width: 50,
            height: 50,
            borderRadius: '50%',
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexShrink: 0
          }}>
            <i className={`fa-solid ${getContactTypeIcon(contact.type)} fa-lg`}></i>
          </Box>
          
          <Box sx={{ width: '100%' }}>
            {/* Contact Type and Date */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 1
            }}>
              <Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: theme.palette.text.primary
                  }}
                >
                  {getContactTypeLabel(contact.type)}
                </Typography>
                <Typography 
                  variant="body2"
                  sx={{ 
                    color: theme.palette.text.secondary,
                    mb: 1
                  }}
                >
                  {formatDateForDisplay(contact.date)}
                </Typography>
              </Box>
              
              {/* Action buttons */}
              <Box>
                <IconButton 
                  size="small"
                  onClick={() => setShowDeleteConfirm(true)}
                  sx={{ color: theme.palette.error.main }}
                >
                  <i className="fa-solid fa-trash"></i>
                </IconButton>
              </Box>
            </Box>
            
            {/* Contact Note */}
            {contact.note && (
              <Box sx={{ mt: 1.5 }}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    color: theme.palette.text.secondary,
                    mb: 0.5
                  }}
                >
                  Note
                </Typography>
                <Typography 
                  variant="body2"
                  sx={{ 
                    color: theme.palette.text.primary,
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {contact.note}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>
      
      {/* Action Items Section - Using SQLite structure */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1.5
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 'bold',
              color: theme.palette.text.primary
            }}
          >
            Action Items
          </Typography>
          <Button
            variant="outlined"
            startIcon={<i className="fa-solid fa-plus"></i>}
            onClick={() => setShowAddActionForm(true)}
            size="small"
            sx={{ textTransform: 'none' }}
          >
            Add Action
          </Button>
        </Box>
        
        <SponsorContactTodo 
          todos={actionItems} 
          onAddTodo={handleAddActionItem}
          onToggleTodo={handleToggleActionItem}
          onDeleteTodo={handleDeleteActionItem}
          showForm={showAddActionForm}
          onFormClose={() => setShowAddActionForm(false)}
          emptyMessage="No action items added yet. Click 'Add Action' to create one."
        />
      </Paper>
      
      {/* Legacy Action Items Section - Hidden */}
      <Box sx={{ display: 'none' }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1.5
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 'bold',
              color: theme.palette.text.primary
            }}
          >
            Action Items
          </Typography>
          <Button
            variant="outlined"
            startIcon={<i className="fa-solid fa-plus"></i>}
            onClick={() => setShowAddActionDialog(true)}
            size="small"
            sx={{ textTransform: 'none' }}
          >
            Add Action
          </Button>
        </Box>
        
        {/* Action Items List */}
        {contactDetails && contactDetails.length > 0 ? (
          <List sx={{ 
            p: 0,
            bgcolor: theme.palette.background.paper,
            borderRadius: 2,
            border: 1,
            borderColor: 'divider'
          }}>
            {contactDetails.map((detail, index) => (
              <React.Fragment key={detail.id}>
                <ListItem
                  sx={{ 
                    px: 2,
                    py: 1.5,
                    display: 'flex',
                    alignItems: 'flex-start'
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={!!detail.completed}
                        onChange={() => handleToggleComplete(detail.id)}
                        sx={{ 
                          color: theme.palette.primary.main,
                          '&.Mui-checked': {
                            color: theme.palette.primary.main,
                          },
                        }}
                      />
                    }
                    label=""
                    sx={{ ml: -1, mr: 0 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="body1"
                      sx={{ 
                        textDecoration: detail.completed ? 'line-through' : 'none',
                        color: detail.completed ? theme.palette.text.secondary : theme.palette.text.primary,
                        fontWeight: detail.completed ? 'normal' : 'medium'
                      }}
                    >
                      {detail.actionItem}
                    </Typography>
                    
                    {/* Due Date */}
                    {detail.dueDate && (
                      <Typography
                        variant="caption"
                        sx={{ 
                          display: 'block',
                          mt: 0.5,
                          color: theme.palette.text.secondary
                        }}
                      >
                        Due: {formatDateForDisplay(detail.dueDate)}
                      </Typography>
                    )}
                    
                    {/* Notes */}
                    {detail.notes && (
                      <Typography
                        variant="body2"
                        sx={{ 
                          mt: 1,
                          whiteSpace: 'pre-wrap',
                          color: theme.palette.text.secondary
                        }}
                      >
                        {detail.notes}
                      </Typography>
                    )}
                  </Box>
                </ListItem>
                {index < contactDetails.length - 1 && (
                  <Divider component="li" />
                )}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box sx={{ 
            p: 3, 
            textAlign: 'center', 
            bgcolor: theme.palette.background.paper,
            borderRadius: 2,
            border: 1,
            borderColor: 'divider'
          }}>
            <Typography variant="body2" color="text.secondary">
              No action items yet. Add items your sponsor asked you to complete.
            </Typography>
          </Box>
        )}
      </Box>
      
      {/* Add Action Dialog */}
      <Dialog
        open={showAddActionDialog}
        onClose={() => setShowAddActionDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
          Add Action Item
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <TextField
              name="actionItem"
              label="Action Item"
              value={newAction.actionItem}
              onChange={handleActionChange}
              fullWidth
              required
              sx={{ 
                '& .MuiInputBase-root': { 
                  height: '56px', 
                  borderRadius: '8px',
                }
              }}
            />
            
            <TextField
              name="dueDate"
              label="Due Date"
              type="date"
              value={newAction.dueDate}
              onChange={handleActionChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{ 
                '& .MuiInputBase-root': { 
                  height: '56px', 
                  borderRadius: '8px',
                }
              }}
            />
            
            <TextField
              name="notes"
              label="Notes"
              multiline
              rows={3}
              value={newAction.notes}
              onChange={handleActionChange}
              fullWidth
              sx={{ 
                '& .MuiInputBase-root': {
                  borderRadius: '8px',
                }
              }}
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  name="completed"
                  checked={newAction.completed}
                  onChange={handleActionChange}
                  sx={{ color: theme.palette.primary.main }}
                />
              }
              label="Already Completed"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button onClick={() => setShowAddActionDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddActionFromForm}
            variant="contained" 
            disabled={!newAction.actionItem}
          >
            Add Action
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Contact?</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this contact record? This will also delete all associated action items.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => {
              onDeleteContact(contact.id);
              setShowDeleteConfirm(false);
            }}
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Floating back button */}
      <Fab
        color="primary"
        aria-label="back"
        onClick={onBack}
        sx={{ 
          position: 'fixed',
          bottom: 20,
          right: 20
        }}
      >
        <i className="fa-solid fa-arrow-left"></i>
      </Fab>
    </Box>
  );
}