import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Button, 
  List, 
  ListItem, 
  IconButton, 
  Divider,
  Card,
  CardContent,
  Tabs,
  Tab,
  ListItemText,
  Checkbox
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SponsorFormDialog from './SponsorFormDialog';
import SponseeFormDialog from './SponseeFormDialog';
import SponsorContactFormPage from './SponsorContactFormPage';
import { formatDateForDisplay } from '../utils/dateUtils';

export default function SponsorSponsee({ user, onUpdate, onSaveActivity, activities = [] }) {
  const theme = useTheme();
  const darkMode = theme.palette.mode === 'dark';
  
  // Tab state
  const [currentTab, setCurrentTab] = useState(0);
  
  // State for sponsor and sponsees
  const [sponsor, setSponsor] = useState(null);
  const [sponsees, setSponsees] = useState([]);
  
  // State for sponsor contacts
  const [sponsorContacts, setSponsorContacts] = useState([]);
  const [showContactForm, setShowContactForm] = useState(false);
  
  // Dialog states
  const [showSponsorForm, setShowSponsorForm] = useState(false);
  const [showSponseeForm, setShowSponseeForm] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState(false);
  const [editingSponseeId, setEditingSponseeId] = useState(null);
  const [editingActionItem, setEditingActionItem] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Load sponsor and sponsees data from user
  useEffect(() => {
    if (user) {
      // Load sponsor data from flattened fields
      if (user.sponsor_name) {
        // Reconstruct sponsor object from flattened fields
        const sponsorData = {
          name: user.sponsor_name || '',
          lastName: user.sponsor_lastName || '',
          phone: user.sponsor_phone || '',
          email: user.sponsor_email || '',
          sobrietyDate: user.sponsor_sobrietyDate || '',
          notes: user.sponsor_notes || ''
        };
        setSponsor(sponsorData);
      }
      
      // Load sponsees if available
      if (user.sponsees && Array.isArray(user.sponsees)) {
        setSponsees(user.sponsees);
      }
    }
  }, [user]);

  // Load sponsor contacts whenever activities change
  useEffect(() => {
    loadSponsorContacts();
  }, [activities]);

  // Load sponsor contacts from activities (they should be stored as activities)
  const loadSponsorContacts = () => {
    // Filter activities to find sponsor contacts
    const sponsorContactActivities = activities.filter(activity => activity.type === 'sponsor-contact');
    
    // Convert activity format back to contact format for display
    const contacts = sponsorContactActivities.map(activity => {
      // Extract topic from notes if it exists
      const notesMatch = activity.notes?.match(/^(.*?) \[Contact: ([^,\]]+)(?:, Topic: ([^\]]+))?\]$/);
      const note = notesMatch ? notesMatch[1] : activity.notes || '';
      const topic = notesMatch ? notesMatch[3] : '';
      
      return {
        id: activity.id,
        type: activity.location || 'other', // Contact type stored in location field
        date: activity.date,
        note: note,
        duration: activity.duration ? activity.duration.toString() : '',
        topic: topic
      };
    });
    
    // console.log('Found sponsor contact activities:', sponsorContactActivities);
    //  console.log('Converted to contacts:', contacts);
    
    // Sort contacts by date - newest first
    const sortedContacts = contacts.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
    
    setSponsorContacts(sortedContacts);
  };

  // Get action items for a specific contact date from the unified activities list
  const getActionItemsForContact = (contactDate) => {
   // console.log('Getting action items for contact date:', contactDate);
   // console.log('All activities in database:', activities);
    
    const actionItemActivities = activities.filter(activity => activity.type === 'action-item');
    console.log('Found action-item activities:', actionItemActivities);
    
    const matchingActionItems = activities.filter(activity => {
      if (activity.type !== 'action-item') return false;
      
      // For new unified approach, check if notes contain ContactRef OR if this is a standalone action item
      const contactRefMatch = activity.notes?.match(/\[ContactRef: ([^\]]+)\]/);
      const referencedContactDate = contactRefMatch ? contactRefMatch[1] : null;
      
      console.log('Activity:', activity.id, 'references contact date:', referencedContactDate, 'looking for:', contactDate);
      
      // Match action items that reference this contact OR standalone action items near this contact's date
      if (referencedContactDate === contactDate) {
        return true;
      }
      
      // For standalone action items, match if they're within a day of the contact
      if (!contactRefMatch && activity.actionItemData) {
        const itemDate = activity.date;
        const daysDiff = Math.abs(new Date(itemDate).getTime() - new Date(contactDate).getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= 1; // Within 1 day
      }
      
      return false;
    }).map(activity => ({
      id: activity.id,
      title: activity.notes?.split(' - ')[0]?.replace('Action Item: ', '') || 'Action Item',
      text: activity.notes?.split(' - ')[1]?.split(' [Notes:')[0]?.split(' [ContactRef:')[0] || '',
      notes: activity.notes?.match(/\[Notes: (.*?)\]/)?.[1] || '',
      completed: activity.location === 'completed',
      deleted: activity.location === 'deleted',
      dueDate: activity.date,
      activityData: activity, // Keep reference to original activity
      actionItemId: activity.actionItemId // Reference to original action item in action_items table
    }));
    
    console.log('Matching action items found:', matchingActionItems);
    return matchingActionItems;
  };

  // Toggle action item completion
  const handleToggleActionItem = async (actionItem) => {
    try {
      console.log('[SponsorSponsee] handleToggleActionItem called with:', actionItem);
      
      // Always prioritize the proper action_items table over legacy activity-based storage
      if (actionItem.actionItemData?.id) {
        // This is a proper action item from action_items table
        console.log('[SponsorSponsee] Updating action item in action_items table, ID:', actionItem.actionItemData.id);
        
        const newCompleted = actionItem.actionItemData.completed ? 0 : 1;
        console.log('[SponsorSponsee] Toggling completed from', actionItem.actionItemData.completed, 'to', newCompleted);
        
        // Update in action_items table using window.db
        const updatedActionItem = {
          ...actionItem.actionItemData,
          completed: newCompleted,
          updatedAt: new Date().toISOString()
        };
        
        await window.db.update('action_items', actionItem.actionItemData.id, updatedActionItem);
        console.log('[SponsorSponsee] Action item updated successfully in action_items table');
        
      } else if (actionItem.activityData?.actionItemId) {
        // This activity references an action item - update the action_items table directly
        console.log('[SponsorSponsee] Updating action item via actionItemId:', actionItem.activityData.actionItemId);
        
        const currentCompleted = actionItem.completed ? 1 : 0;
        const newCompleted = currentCompleted === 1 ? 0 : 1;
        
        const updatedActionItem = {
          completed: newCompleted,
          updatedAt: new Date().toISOString()
        };
        
        await window.db.update('action_items', actionItem.activityData.actionItemId, updatedActionItem);
        console.log('[SponsorSponsee] Action item updated successfully via actionItemId');
        
      } else if (actionItem.activityData?.id) {
        // Legacy fallback - update the activity location field
        console.log('[SponsorSponsee] Updating legacy activity-based action item, ID:', actionItem.activityData.id);
        
        const currentLocation = actionItem.activityData.location || 'pending';
        const newLocation = currentLocation === 'completed' ? 'pending' : 'completed';
        
        const updatedActivity = {
          ...actionItem.activityData,
          location: newLocation,
          updatedAt: new Date().toISOString()
        };
        
        await onSaveActivity(updatedActivity);
        console.log('[SponsorSponsee] Legacy action item updated successfully');
      } else {
        console.error('[SponsorSponsee] No valid ID found for action item update');
        return;
      }
      
      console.log('[SponsorSponsee] Action item completion toggled successfully');
      
      // Trigger a reload of both contacts and activities to reflect the change
      loadSponsorContacts();
      
      // Manually trigger a re-render by updating a state value
      console.log('[SponsorSponsee] Triggering manual refresh...');
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('[SponsorSponsee] Error toggling action item completion:', error);
    }
  };

  // Delete action item
  const handleDeleteActionItem = async (actionItem) => {
    try {
      console.log('[SponsorSponsee] handleDeleteActionItem called with:', actionItem);
      
      // Check if this is a proper action item (has actionItemData) or legacy activity-based action item
      if (actionItem.actionItemData?.id) {
        // This is a proper action item from action_items table - delete it completely
        console.log('[SponsorSponsee] Deleting action item from action_items table, ID:', actionItem.actionItemData.id);
        
        await window.db.remove('action_items', actionItem.actionItemData.id);
        console.log('[SponsorSponsee] Action item deleted successfully from action_items table');
        
      } else if (actionItem.activityData?.id) {
        // This is a legacy activity-based action item - mark as deleted
        console.log('[SponsorSponsee] Marking legacy activity-based action item as deleted, ID:', actionItem.activityData.id);
        
        await onSaveActivity({
          ...actionItem.activityData,
          location: 'deleted',
          updatedAt: new Date().toISOString()
        });
        console.log('[SponsorSponsee] Legacy action item marked as deleted');
      } else {
        console.error('[SponsorSponsee] No valid ID found for action item deletion');
        return;
      }
      
      console.log('[SponsorSponsee] Action item deleted successfully');
      
      // Trigger a reload of contacts to reflect the change
      loadSponsorContacts();
    } catch (error) {
      console.error('[SponsorSponsee] Error deleting action item:', error);
    }
  };

  // Handle editing existing contact
  const handleEditContact = async (contactData, actionItems = []) => {
    try {
      console.log('Editing existing contact:', editingContact);
      console.log('Updated contact data:', contactData);
      
      const contactId = editingContact?.activityData?.id || editingContact?.id;
      if (!contactId) {
        console.error('No editing contact ID available');
        return;
      }

      // Update the existing contact activity
      const updatedActivityData = {
        type: 'sponsor-contact',
        date: contactData.date || editingContact.activityData?.date || editingContact.date,
        notes: `${contactData.note || ''} [Contact: ${contactData.type}${contactData.topic ? ', Topic: ' + contactData.topic : ''}]`,
        duration: contactData.duration ? parseInt(contactData.duration) : undefined,
        location: contactData.type,
        updatedAt: new Date().toISOString()
      };

      console.log('Updating existing contact activity:', updatedActivityData);
      
      // Update the existing activity
      await onSaveActivity({
        ...updatedActivityData,
        id: contactId
      });

      // Handle action items - remove old ones and add new ones
      if (actionItems && actionItems.length > 0) {
        // First remove existing action items for this contact
        const existingActionItems = getActionItemsForContact(editingContact);
        for (const existingItem of existingActionItems) {
          if (existingItem.activityData?.id) {
            await onSaveActivity({
              ...existingItem.activityData,
              type: 'action-item-deleted',
              updatedAt: new Date().toISOString()
            });
          }
        }

        // Add new action items to the action_items table instead of activities table
        for (const actionItem of actionItems) {
          const actionItemData = {
            title: actionItem.title,
            text: actionItem.text || '',
            notes: actionItem.notes || '',
            dueDate: actionItem.dueDate || contactData.date,
            completed: actionItem.completed ? 1 : 0,
            type: 'todo',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          console.log('Adding action item to action_items table:', actionItemData);
          
          try {
            // Save to action_items table instead of activities table
            await window.db.add('action_items', actionItemData);
            console.log('Action item saved successfully');
          } catch (error) {
            console.error('Error saving action item:', error);
          }
        }
      }

      console.log('Contact updated successfully');
      setShowContactForm(false);
      setEditingContact(null);
      loadSponsorContacts();
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };

  // Handle sponsor contact form submission with action items
  const handleAddContact = async (contactData, actionItems = []) => {
    try {
      console.log('Adding new sponsor contact with data:', contactData);
      console.log('Adding action items:', actionItems);
      
      // Convert sponsor contact to activity format
      const activityData = {
        type: 'sponsor-contact',
        date: contactData.date || new Date().toISOString(),
        notes: `${contactData.note || ''} [Contact: ${contactData.type}${contactData.topic ? ', Topic: ' + contactData.topic : ''}]`,
        duration: contactData.duration ? parseInt(contactData.duration) : undefined,
        location: contactData.type // Store contact type in location field for filtering
      };
      
      console.log('Saving sponsor contact as activity:', activityData);
      
      // Save using the shared database handler from App.tsx
      const savedActivity = await onSaveActivity(activityData);
      console.log('Contact saved successfully as activity:', savedActivity);
      
      // Save action items to the action_items table only
      if (actionItems && actionItems.length > 0) {
        try {
          const actionItemPromises = actionItems.map(async (actionItem) => {
            const actionItemData = {
              title: actionItem.title,
              text: actionItem.text || '',
              notes: actionItem.notes || '',
              dueDate: actionItem.dueDate || new Date().toISOString().split('T')[0],
              completed: actionItem.completed ? 1 : 0,
              type: 'todo',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            console.log('Saving action item to action_items table:', actionItemData);
            return await window.db.add('action_items', actionItemData);
          });
          
          await Promise.all(actionItemPromises);
          console.log('All action items saved successfully');
        } catch (actionItemError) {
          console.warn('Some action items failed to save:', actionItemError);
          // Don't let action item failures prevent the contact from being saved
        }
      }
      
      // Close the form
      setShowContactForm(false);
      
    } catch (error) {
      console.error('Error adding sponsor contact:', error);
    }
  };

  // Get contact type label and icon for display
  const getContactTypeInfo = (type) => {
    const typeInfo = {
      'phone': { label: 'Phone Call', icon: 'fa-solid fa-phone' },
      'in-person': { label: 'In Person', icon: 'fa-solid fa-handshake' }, 
      'video': { label: 'Video Call', icon: 'fa-solid fa-video' },
      'text': { label: 'Text Message', icon: 'fa-solid fa-message' },
      'email': { label: 'Email', icon: 'fa-solid fa-envelope' },
      'other': { label: 'Other', icon: 'fa-solid fa-comment' }
    };
    
    return typeInfo[type] || { label: 'Contact', icon: 'fa-solid fa-comment' };
  };
  
  // Handle sponsor form submission
  const handleSponsorSubmit = (sponsorData) => {
    // Create a copy of the current user data with flattened sponsor fields
    const userUpdate = {
      sponsor_name: sponsorData.name || '',
      sponsor_lastName: sponsorData.lastName || '',
      sponsor_phone: sponsorData.phone || '',
      sponsor_email: sponsorData.email || '',
      sponsor_sobrietyDate: sponsorData.sobrietyDate || '',
      sponsor_notes: sponsorData.notes || ''
    };
    
    // Update user in database through parent component
    onUpdate(userUpdate, { redirectToDashboard: false });
    
    // Update local state
    setSponsor(sponsorData);
    setShowSponsorForm(false);
  };
  
  // Handle sponsee form submission
  const handleSponseeSubmit = (sponseeData) => {
    let updatedSponsees;
    
    // Check if we're editing an existing sponsee or adding a new one
    if (editingSponseeId) {
      // Update existing sponsee
      updatedSponsees = sponsees.map(sponsee => 
        sponsee.id === editingSponseeId ? { ...sponsee, ...sponseeData } : sponsee
      );
    } else {
      // Add new sponsee with generated ID
      const newSponsee = {
        ...sponseeData,
        id: `sponsee_${Date.now()}`
      };
      updatedSponsees = [...sponsees, newSponsee];
    }
    
    // Create a copy of the current user data
    const userUpdate = {
      sponsees: updatedSponsees
    };
    
    // Update user in database through parent component
    onUpdate(userUpdate, { redirectToDashboard: false });
    
    // Update local state
    setSponsees(updatedSponsees);
    setShowSponseeForm(false);
    setEditingSponseeId(null);
  };
  
  // Open sponsor form for editing
  const handleEditSponsor = () => {
    setEditingSponsor(true);
    setShowSponsorForm(true);
  };
  
  // Open sponsee form for editing
  const handleEditSponsee = (sponseeId) => {
    setEditingSponseeId(sponseeId);
    setShowSponseeForm(true);
  };
  
  // Delete a sponsee
  const handleDeleteSponsee = (sponseeId) => {
    // Filter out the sponsee with the given ID
    const updatedSponsees = sponsees.filter(sponsee => sponsee.id !== sponseeId);
    
    // Create update for user data
    const userUpdate = {
      sponsees: updatedSponsees
    };
    
    // Update user in database
    onUpdate(userUpdate, { redirectToDashboard: false });
    
    // Update local state
    setSponsees(updatedSponsees);
  };
  
  // Delete sponsor
  const handleDeleteSponsor = () => {
    // Create update to remove all sponsor fields
    const userUpdate = {
      sponsor_name: '',
      sponsor_lastName: '',
      sponsor_phone: '',
      sponsor_email: '',
      sponsor_sobrietyDate: '',
      sponsor_notes: ''
    };
    
    // Update user in database
    onUpdate(userUpdate, { redirectToDashboard: false });
    
    // Update local state
    setSponsor(null);
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Custom TabPanel component
  function TabPanel({ children, value, index, ...other }) {
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`sponsorship-tabpanel-${index}`}
        aria-labelledby={`sponsorship-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ pt: 3 }}>
            {children}
          </Box>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Page Title */}
      <Typography 
        variant="h4" 
        component="h1" 
        className="mb-6"
        sx={{ color: theme.palette.text.primary, fontWeight: 'bold', textAlign: 'center' }}
      >
        Sponsorship Management
      </Typography>

      {/* Material-UI Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange} 
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600
            }
          }}
        >
          <Tab label="My Sponsor" />
          <Tab label="My Sponsees" />
        </Tabs>
      </Box>

      {/* Sponsor Tab Content */}
      <TabPanel value={currentTab} index={0}>
      
      <Paper 
        elevation={0}
        sx={{ 
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.shadows[2],
          borderRadius: 2,
          p: 1.5,
          mb: 1.5
        }}
      >
        {sponsor ? (
          <Box>
            <Box className="mb-4">
              <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
                {sponsor.name} {sponsor.lastName || ''}
              </Typography>
            </Box>
            
            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Contact Information */}
              <Box>
                <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                  Contact Information
                </Typography>
                
                <Box className="grid grid-cols-1 gap-2">
                  {sponsor.phone && (
                    <Typography sx={{ color: theme.palette.text.primary, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <i className="fa-solid fa-phone text-sm" style={{ color: theme.palette.text.secondary }}></i>
                      {sponsor.phone}
                    </Typography>
                  )}
                  
                  {sponsor.email && (
                    <Typography sx={{ color: theme.palette.text.primary, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <i className="fa-solid fa-envelope text-sm" style={{ color: theme.palette.text.secondary }}></i>
                      {sponsor.email}
                    </Typography>
                  )}
                  
                  {sponsor.sobrietyDate && (
                    <Typography sx={{ color: theme.palette.text.primary, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <i className="fa-solid fa-calendar-check text-sm" style={{ color: theme.palette.text.secondary }}></i>
                      {formatDateForDisplay(sponsor.sobrietyDate)}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
            
            {/* Notes Section */}
            {sponsor.notes && (
              <Box className="mt-4">
                <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                  Notes
                </Typography>
                
                <Typography sx={{ color: theme.palette.text.primary, whiteSpace: 'pre-wrap' }}>
                  {sponsor.notes}
                </Typography>
              </Box>
            )}
            
            {/* Action Buttons */}
            <Box className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <IconButton 
                onClick={handleEditSponsor}
                size="small"
                sx={{ color: theme.palette.primary.main }}
              >
                <i className="fa-solid fa-pen-to-square"></i>
              </IconButton>
              
              <IconButton 
                onClick={handleDeleteSponsor}
                size="small"
                sx={{ color: theme.palette.error.main }}
              >
                <i className="fa-solid fa-trash"></i>
              </IconButton>
            </Box>
          </Box>
        ) : (
          <Box className="text-center py-6">
            <Typography variant="body1" sx={{ color: theme.palette.text.primary, mb: 3 }}>
              You haven't added your sponsor yet.
            </Typography>
            
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => {
                setEditingSponsor(false);
                setShowSponsorForm(true);
              }}
              startIcon={<i className="fa-solid fa-plus"></i>}
            >
              Add Sponsor
            </Button>
          </Box>
        )}
      </Paper>

      {/* Sponsor Contacts Section - only show if sponsor exists */}
      {sponsor && (
        <Paper 
          elevation={0}
          sx={{ 
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[2],
            borderRadius: 2,
            p: 1.5,
            mt: 1.5
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
              Sponsor Contacts
            </Typography>
            
            <IconButton 
              onClick={() => setShowContactForm(true)}
              size="small"
              sx={{ 
                color: theme.palette.primary.main,
                padding: '4px',
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: theme.palette.primary.dark
                }
              }}
            >
              <i className="fa-solid fa-plus"></i>
            </IconButton>
          </Box>

          {/* Contact List */}
          {sponsorContacts.length > 0 ? (
            <List>
              {sponsorContacts.map((contact, index) => (
                <React.Fragment key={contact.id || index}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <i 
                              className={getContactTypeInfo(contact.type).icon}
                              style={{ 
                                color: theme.palette.primary.main,
                                fontSize: '16px',
                                width: '20px'
                              }}
                            />
                            <Typography sx={{ color: theme.palette.text.primary, fontWeight: 500 }}>
                              {getContactTypeInfo(contact.type).label}
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => {
                              console.log('Edit contact:', contact);
                              // Set the contact data for editing and open the form
                              setEditingContact(contact);
                              setShowContactForm(true);
                            }}
                            sx={{
                              p: 0.5,
                              color: theme.palette.text.secondary,
                              '&:hover': {
                                color: theme.palette.primary.main,
                                backgroundColor: 'transparent'
                              }
                            }}
                          >
                            <i className="fa-solid fa-pen" style={{ fontSize: '14px' }}></i>
                          </IconButton>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ ml: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <i 
                              className="fa-solid fa-calendar"
                              style={{ 
                                color: theme.palette.text.secondary,
                                fontSize: '12px'
                              }}
                            />
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                              {formatDateForDisplay(contact.date)}
                            </Typography>
                          </Box>
                          {contact.note && (
                            <Typography variant="body2" sx={{ color: theme.palette.text.primary, mt: 0.5 }}>
                              {contact.note}
                            </Typography>
                          )}
                          {contact.topic && (
                            <Typography variant="body2" sx={{ color: theme.palette.secondary.main, mt: 0.5, fontStyle: 'italic' }}>
                              Topic: {contact.topic}
                            </Typography>
                          )}
                          {contact.duration && (
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
                              Duration: {contact.duration} minutes
                            </Typography>
                          )}
                          
                          {/* Action Items Section */}
                          {(() => {
                            // Force recalculation when refreshKey changes
                            const actionItems = getActionItemsForContact(contact.date);
                            console.log('Action items for contact:', contact.date, actionItems, 'refreshKey:', refreshKey);
                            console.log('All activities:', activities);
                            return actionItems.length > 0 && (
                              <Box sx={{ mt: 1.5, pl: 0 }}>
                                <Typography variant="caption" sx={{ 
                                  color: theme.palette.text.secondary, 
                                  fontWeight: 600,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px'
                                }}>
                                  Action Items
                                </Typography>
                                <Box sx={{ mt: 0.5 }}>
                                  {actionItems.map((item) => (
                                    <Box 
                                      key={item.id} 
                                      sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 1, 
                                        py: 0.25
                                      }}
                                    >
                                      <Checkbox
                                        checked={item.completed || item.deleted}
                                        onChange={(e) => {
                                          e.stopPropagation();
                                          console.log('[SponsorSponsee] Checkbox clicked for item:', item);
                                          handleToggleActionItem(item);
                                        }}
                                        size="small"
                                        disabled={false}
                                        icon={item.deleted ? <i className="fa-solid fa-xmark" style={{ fontSize: '12px', color: theme.palette.error.main }} /> : undefined}
                                        checkedIcon={item.deleted ? <i className="fa-solid fa-xmark" style={{ fontSize: '12px', color: theme.palette.error.main }} /> : undefined}
                                        sx={{
                                          p: 0,
                                          '& .MuiSvgIcon-root': {
                                            fontSize: '16px',
                                            color: item.completed && !item.deleted ? theme.palette.success.main : 'inherit'
                                          }
                                        }}
                                      />
                                      <Typography 
                                        variant="body2" 
                                        sx={{ 
                                          color: item.deleted ? theme.palette.error.main : 
                                                 item.completed ? theme.palette.success.main : 
                                                 theme.palette.text.primary,
                                          textDecoration: item.deleted ? 'line-through' : 'none',
                                          flex: 1,
                                          fontSize: '0.8rem'
                                        }}
                                      >
                                        {item.title}
                                      </Typography>
                                      {!item.deleted && (
                                        <IconButton
                                          size="small"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            console.log('[SponsorSponsee] Delete button clicked for item:', item);
                                            handleDeleteActionItem(item);
                                          }}
                                          sx={{
                                            p: 0.25,
                                            color: theme.palette.error.main,
                                            '&:hover': {
                                              color: theme.palette.error.dark,
                                              backgroundColor: 'transparent'
                                            }
                                          }}
                                        >
                                          <i className="fa-solid fa-xmark" style={{ fontSize: '10px' }}></i>
                                        </IconButton>
                                      )}

                                    </Box>
                                  ))}
                                </Box>
                              </Box>
                            );
                          })()}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < sponsorContacts.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box className="text-center py-4">
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                No sponsor contacts recorded yet.
              </Typography>
            </Box>
          )}
        </Paper>
      )}
      
      </TabPanel>

      {/* Sponsees Tab Content */}
      <TabPanel value={currentTab} index={1}>
        <Box className="flex justify-between items-center mb-4">
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              setEditingSponseeId(null);
              setShowSponseeForm(true);
            }}
            startIcon={<i className="fa-solid fa-plus"></i>}
            size="small"
          >
            Add Sponsee
          </Button>
        </Box>
      
      {sponsees.length > 0 ? (
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sponsees.map(sponsee => (
            <Card 
              key={sponsee.id}
              sx={{ 
                backgroundColor: theme.palette.background.paper,
                boxShadow: theme.shadows[2],
                borderRadius: '0.5rem'
              }}
            >
              <CardContent>
                <Box className="mb-3">
                  <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
                    {sponsee.name} {sponsee.lastName || ''}
                  </Typography>
                </Box>
                
                <Box className="grid grid-cols-1 gap-2">
                  {/* Contact Information */}
                  <Box className="grid grid-cols-1 gap-2">
                    {sponsee.phone && (
                      <Typography sx={{ color: theme.palette.text.primary, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <i className="fa-solid fa-phone text-sm" style={{ color: theme.palette.text.secondary }}></i>
                        {sponsee.phone}
                      </Typography>
                    )}
                    
                    {sponsee.email && (
                      <Typography sx={{ color: theme.palette.text.primary, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <i className="fa-solid fa-envelope text-sm" style={{ color: theme.palette.text.secondary }}></i>
                        {sponsee.email}
                      </Typography>
                    )}
                    
                    {sponsee.sobrietyDate && (
                      <Typography sx={{ color: theme.palette.text.primary, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <i className="fa-solid fa-calendar-check text-sm" style={{ color: theme.palette.text.secondary }}></i>
                        {formatDateForDisplay(sponsee.sobrietyDate)}
                      </Typography>
                    )}
                  </Box>
                  
                  {/* Notes (if present) */}
                  {sponsee.notes && (
                    <Box className="mt-2">
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 0.5 }}>
                        Notes
                      </Typography>
                      <Typography sx={{ color: theme.palette.text.primary, fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
                        {sponsee.notes}
                      </Typography>
                    </Box>
                  )}
                  
                  {/* Action Buttons */}
                  <Box className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <IconButton 
                      onClick={() => handleEditSponsee(sponsee.id)}
                      size="small"
                      sx={{ color: theme.palette.primary.main }}
                    >
                      <i className="fa-solid fa-pen-to-square"></i>
                    </IconButton>
                    
                    <IconButton 
                      onClick={() => handleDeleteSponsee(sponsee.id)}
                      size="small"
                      sx={{ color: theme.palette.error.main }}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Paper 
          elevation={0}
          sx={{ 
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[2],
            borderRadius: 2,
            p: 1.5,
            textAlign: 'center'
          }}
        >
          <Typography variant="body1" sx={{ color: theme.palette.text.primary }}>
            You haven't added any sponsees yet.
          </Typography>
        </Paper>
      )}
      </TabPanel>
      
      {/* Sponsor Form Dialog */}
      <SponsorFormDialog 
        open={showSponsorForm} 
        onClose={() => {
          setShowSponsorForm(false);
          setEditingSponsor(false);
        }}
        onSubmit={handleSponsorSubmit}
        initialData={editingSponsor ? sponsor : null}
      />
      
      {/* Sponsee Form Dialog */}
      <SponseeFormDialog
        open={showSponseeForm}
        onClose={() => {
          setShowSponseeForm(false);
          setEditingSponseeId(null);
        }}
        onSubmit={handleSponseeSubmit}
        initialData={editingSponseeId ? sponsees.find(s => s.id === editingSponseeId) : null}
      />

      {/* Sponsor Contact Form Dialog */}
      <SponsorContactFormPage
        open={showContactForm}
        onClose={() => {
          setShowContactForm(false);
          setEditingActionItem(null);
          setEditingContact(null);
        }}
        onSubmit={editingContact ? handleEditContact : handleAddContact}
        userId={user?.id || 'default_user'}
        initialData={editingContact || (editingActionItem ? {
          type: 'phone', // Default type since action items don't store contact type
          date: editingActionItem.dueDate,
          note: editingActionItem.title
        } : null)}
      />
    </div>
  );
}