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
  console.log('[SponsorSponsee.tsx:24] Component loaded with activities:', activities, 'type:', typeof activities);
  const theme = useTheme();
  const darkMode = theme.palette.mode === 'dark';
  
  // Tab state
  const [currentTab, setCurrentTab] = useState(0);
  const [currentSponsorTab, setCurrentSponsorTab] = useState(0);
  const [currentSponseeTab, setCurrentSponseeTab] = useState(0);
  
  // State for sponsors (multiple) and sponsees
  const [sponsors, setSponsors] = useState([]);
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
  
  // Load sponsors and sponsees data from user
  useEffect(() => {
    if (user) {
      loadSponsors();
      
      // Load sponsees if available
      if (user.sponsees && Array.isArray(user.sponsees)) {
        setSponsees(user.sponsees);
      }
    }
  }, [user]);

  // Load sponsors from sponsors table
  const loadSponsors = async () => {
    try {
      if (!window.db) {
        console.error('Database not initialized');
        return;
      }

      const allSponsors = await window.db.getAll('sponsors');
      console.log('Loaded sponsors:', allSponsors);
      setSponsors(allSponsors || []);
    } catch (error) {
      console.error('Error loading sponsors:', error);
      setSponsors([]);
    }
  };

  // Load sponsor contacts whenever activities change
  useEffect(() => {
    loadSponsorContacts();
  }, [activities]);

  // Load sponsor contacts from sponsor_contacts table for a specific sponsor
  const loadSponsorContacts = async (sponsorId = null) => {
    try {
      if (!window.db) {
        console.error('Database not initialized');
        return [];
      }

      const allContacts = await window.db.getAll('sponsor_contacts');
      console.log('Loaded sponsor contacts:', allContacts);
      
      // Ensure we have a valid array
      const contactsArray = Array.isArray(allContacts) ? allContacts : [];
      
      // Filter by sponsor ID if provided
      console.log('[SponsorSponsee.tsx:99] Before filter - contactsArray:', contactsArray, 'sponsorId:', sponsorId);
      const filteredContacts = sponsorId 
        ? contactsArray.filter(contact => contact && contact.sponsorId === sponsorId)
        : contactsArray;
      
      // Sort contacts by date - newest first, but only if we have valid contacts
      const sortedContacts = filteredContacts.length > 0 ? filteredContacts.sort((a, b) => {
        if (!a.date || !b.date) return 0;
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      }) : [];
      
      return sortedContacts;
    } catch (error) {
      console.error('Error loading sponsor contacts:', error);
      return [];
    }
  };

  // Get action items for a specific sponsor contact
  const getActionItemsForContact = async (contactId) => {
    try {
      if (!window.db) {
        console.error('Database not initialized');
        return [];
      }

      // Get action items that reference this specific contact
      const allActionItems = await window.db.getAll('action_items');
      console.log('[SponsorSponsee.tsx:125] Before filter - allActionItems:', allActionItems, 'contactId:', contactId);
      const actionItemsArray = Array.isArray(allActionItems) ? allActionItems : [];
      const contactActionItems = actionItemsArray.filter(item => 
        item && (item.contactId === contactId || item.sponsorContactId === contactId)
      );
      
      return contactActionItems;
    } catch (error) {
      console.error('Error loading action items for contact:', error);
      return [];
    }
  };
  
  // Toggle action item completion (checkbox)
  const handleToggleActionItem = async (actionItemId) => {
    console.log('[ SponsorSponsee ] Checkbox clicked for item id:', actionItemId);
    
    try {
      // Check if activities is null or undefined
      if (!activities || !Array.isArray(activities)) {
        console.error('Activities is null or not an array');
        return;
      }
      
      // Find the activity in the activities list
      const activity = activities.find(act => act.id === actionItemId);
      if (!activity) {
        console.error('Activity not found for ID:', actionItemId);
        return;
      }
      
      // Toggle completion status
      const updatedActivity = {
        ...activity,
        completed: activity.completed === 1 ? 0 : 1
      };
      
      console.log('Toggling completion for activity:', updatedActivity);
      
      // Save the updated activity
      await onSaveActivity(updatedActivity);
      
      // Refresh to get updated data
      setRefreshKey(prev => prev + 1);
      
    } catch (error) {
      console.error('Error toggling action item:', error);
    }
  };
  
  // Delete action item
  const handleDeleteActionItem = (actionItemId) => {
    // Find the action item in activities list and mark as deleted
    const activity = activities.find(act => act.id === actionItemId);
    if (activity) {
      const deletedActivity = {
        ...activity,
        deleted: true
      };
      
      // Save the deleted status
      onSaveActivity(deletedActivity);
      
      // Refresh to get updated data
      setRefreshKey(prev => prev + 1);
    }
  };
  
  // Handle Add Contact button click
  const handleAddContact = () => {
    setEditingContact(null);
    setEditingActionItem(null);
    setShowContactForm(true);
  };
  
  // Handle editing an existing contact
  const handleEditContact = (contact, actionItem = null) => {
    setEditingContact(contact);
    setEditingActionItem(actionItem);
    setShowContactForm(true);
  };
  
  // Add contact with optional action item
  const handleAddContactWithActionItem = async (contactData, actionItems = []) => {
    try {
      if (!window.db) {
        console.error('Database not initialized');
        return;
      }

      console.log('[SponsorSponsee.tsx] Adding contact with data:', contactData, 'actionItems:', actionItems);

      // Get the currently selected sponsor
      const currentSponsor = sponsors[currentSponsorTab];
      if (!currentSponsor) {
        console.error('No sponsor selected');
        return;
      }

      // Add contact to sponsor_contacts table first
      const newContact = {
        ...contactData,
        sponsorId: currentSponsor.id, // Associate with currently selected sponsor
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const savedContact = await window.db.add('sponsor_contacts', newContact);
      console.log('[SponsorSponsee.tsx] Saved contact with ID:', savedContact?.id);

      // Verify the contact was saved and get the actual ID
      if (!savedContact || !savedContact.id) {
        console.error('[SponsorSponsee.tsx] Failed to save contact - no ID returned');
        return;
      }

      // Double-check that the contact exists in the database
      try {
        const verifyContact = await window.db.getById('sponsor_contacts', savedContact.id);
        console.log('[SponsorSponsee.tsx] Verified contact exists:', verifyContact);
        if (!verifyContact) {
          console.error('[SponsorSponsee.tsx] Contact verification failed - contact not found in database');
          return;
        }
      } catch (verifyError) {
        console.error('[SponsorSponsee.tsx] Error verifying contact:', verifyError);
        return;
      }

      // Process all action items if any exist
      if (actionItems && actionItems.length > 0) {
        console.log('[SponsorSponsee.tsx] Processing', actionItems.length, 'action items with contactId:', savedContact.id);
        
        // Add a small delay to ensure the contact is fully committed to the database
        await new Promise(resolve => setTimeout(resolve, 100));
        
        for (const actionItemData of actionItems) {
          if (actionItemData && actionItemData.title) {
            const actionItem = {
              contactId: savedContact.id, // Use the verified saved contact ID
              title: actionItemData.title,
              text: actionItemData.text || actionItemData.title,
              notes: actionItemData.notes || '',
              dueDate: actionItemData.dueDate || null,
              completed: actionItemData.completed ? 1 : 0,
              type: actionItemData.type || 'todo',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            console.log('[SponsorSponsee.tsx] Saving action item:', actionItem);
            
            try {
              const savedActionItem = await window.db.add('action_items', actionItem);
              console.log('[SponsorSponsee.tsx] Saved action item with ID:', savedActionItem?.id);
            } catch (actionItemError) {
              console.error('[SponsorSponsee.tsx] Failed to save action item:', actionItemError);
              // Continue with other action items even if one fails
            }
          }
        }
      }

      // Refresh contacts to show the new data
      await loadSponsorContacts();

      setShowContactForm(false);
      setEditingContact(null);
      setEditingActionItem(null);
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  };

  // Handle editing existing contact with action items
  const handleEditContactWithActionItem = async (contactData, actionItems = []) => {
    try {
      console.log('[SponsorSponsee.tsx] Editing contact with data:', contactData, 'actionItems:', actionItems);
      
      if (!editingContact || !editingContact.id) {
        console.error('No contact being edited');
        return;
      }

      // Update the existing contact
      const updatedContact = {
        ...editingContact,
        type: contactData.type,
        date: contactData.date,
        note: contactData.note || '',
        updatedAt: new Date().toISOString()
      };

      await window.db.update('sponsor_contacts', editingContact.id, updatedContact);

      // Handle action items if any
      for (const actionItemData of actionItems) {
        // Create action item directly in action_items table
        const actionItem = {
          contactId: editingContact.id, // Link to the specific contact
          title: actionItemData.title,
          text: actionItemData.text || actionItemData.title,
          notes: actionItemData.notes || '',
          dueDate: actionItemData.dueDate || null,
          completed: 0,
          type: 'todo',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await window.db.add('action_items', actionItem);
      }

      setShowContactForm(false);
      setEditingContact(null);
      setEditingActionItem(null);
      
      // Refresh the contacts list
      setRefreshKey(prev => prev + 1);
      
    } catch (error) {
      console.error('Error editing contact:', error);
    }
  };
  
  // Edit existing sponsor
  const handleEditSponsor = (sponsor) => {
    setEditingSponsor(sponsor);
    setShowSponsorForm(true);
  };
  
  // Edit existing sponsee
  const handleEditSponsee = (sponsee) => {
    setEditingSponseeId(sponsee.id);
    setShowSponseeForm(true);
  };
  
  // Delete sponsee
  const handleDeleteSponsee = (sponseeId) => {
    console.log('[SponsorSponsee.tsx:274] Before filter - sponsees:', sponsees, 'sponseeId:', sponseeId);
    const sponseesArray = Array.isArray(sponsees) ? sponsees : [];
    const updatedSponsees = sponseesArray.filter(sponsee => sponsee && sponsee.id !== sponseeId);
    
    // Create a copy of the current user data
    const userUpdate = {
      sponsees: updatedSponsees
    };
    
    // Update user in database through parent component
    onUpdate(userUpdate, { redirectToDashboard: false });
    
    // Update local state
    setSponsees(updatedSponsees);
  };
  
  // Get contact type information (icon and label)
  const getContactTypeInfo = (type) => {
    const typeInfo = {
      'phone': { label: 'Phone Call', icon: 'fa-solid fa-phone' },
      'video': { label: 'Video Call', icon: 'fa-solid fa-video' },
      'text': { label: 'Text Message', icon: 'fa-solid fa-message' },
      'email': { label: 'Email', icon: 'fa-solid fa-envelope' },
      'other': { label: 'Other', icon: 'fa-solid fa-comment' }
    };
    
    return typeInfo[type] || { label: 'Contact', icon: 'fa-solid fa-comment' };
  };
  
  // Handle sponsor form submission
  const handleSponsorSubmit = async (sponsorData) => {
    try {
      if (!window.db) {
        console.error('Database not initialized');
        return;
      }

      // Add or update sponsor in sponsors table
      if (editingSponsor && editingSponsor.id) {
        // Update existing sponsor
        await window.db.update('sponsors', editingSponsor.id, sponsorData);
      } else {
        // Add new sponsor
        await window.db.add('sponsors', {
          ...sponsorData,
          sponsorType: 'sponsor', // Default type
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      // Reload sponsors
      await loadSponsors();
      setShowSponsorForm(false);
      setEditingSponsor(false);
    } catch (error) {
      console.error('Error saving sponsor:', error);
    }
  };
  
  // Handle sponsee form submission
  const handleSponseeSubmit = (sponseeData) => {
    let updatedSponsees;
    
    // Ensure sponsees is an array
    const sponseesArray = Array.isArray(sponsees) ? sponsees : [];
    
    // Check if we're editing an existing sponsee or adding a new one
    if (editingSponseeId) {
      // Update existing sponsee
      console.log('[SponsorSponsee.tsx:345] Before map - sponseesArray:', sponseesArray, 'editingSponseeId:', editingSponseeId);
      updatedSponsees = sponseesArray.map(sponsee => 
        sponsee && sponsee.id === editingSponseeId ? { ...sponsee, ...sponseeData } : sponsee
      );
    } else {
      // Add new sponsee with generated ID
      const newSponsee = {
        ...sponseeData,
        id: `sponsee_${Date.now()}`
      };
      updatedSponsees = [...sponseesArray, newSponsee];
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
  
  // Delete sponsor
  const handleDeleteSponsor = async (sponsorId) => {
    try {
      if (!window.db) {
        console.error('Database not initialized');
        return;
      }

      // Delete sponsor from sponsors table
      await window.db.remove('sponsors', sponsorId);
      
      // Reload sponsors
      await loadSponsors();
    } catch (error) {
      console.error('Error deleting sponsor:', error);
    }
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Handle sponsor tab change
  const handleSponsorTabChange = (event, newValue) => {
    setCurrentSponsorTab(newValue);
  };

  // Handle sponsee tab change
  const handleSponseeTabChange = (event, newValue) => {
    setCurrentSponseeTab(newValue);
  };

  // Custom TabPanel component
  function TabPanel({ children, value, index, ...other }) {
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ pt: 2 }}>
            {children}
          </Box>
        )}
      </div>
    );
  }

  // Individual Sponsor Content Component
  function SponsorContent({ 
    sponsor, 
    theme, 
    onEdit, 
    onDelete, 
    onAddContact, 
    loadSponsorContacts,
    getActionItemsForContact,
    getContactTypeInfo,
    handleEditContact,
    handleToggleActionItem,
    handleDeleteActionItem,
    refreshKey,
    formatDateForDisplay
  }) {
    const [contactsForSponsor, setContactsForSponsor] = React.useState([]);

    // Load contacts for this specific sponsor
    React.useEffect(() => {
      const loadContacts = async () => {
        const contacts = await loadSponsorContacts(sponsor.id);
        setContactsForSponsor(contacts);
      };
      loadContacts();
    }, [sponsor.id, refreshKey]);

    return (
      <Box>
        {/* Sponsor Information */}
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
          <Box className="mb-4" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
              {(sponsor.name || 'Sponsor').trim()} {(sponsor.lastName || '').trim()}
              {sponsor.sponsorType && sponsor.sponsorType !== 'sponsor' && (
                <Typography component="span" variant="caption" sx={{ ml: 1, color: theme.palette.text.secondary }}>
                  ({sponsor.sponsorType})
                </Typography>
              )}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton 
                size="small" 
                onClick={onEdit}
                sx={{ color: theme.palette.primary.main }}
              >
                <i className="fa-solid fa-pen-to-square"></i>
              </IconButton>
              <IconButton 
                size="small" 
                onClick={onDelete}
                sx={{ color: theme.palette.error.main }}
              >
                <i className="fa-solid fa-trash"></i>
              </IconButton>
            </Box>
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
            
            {/* Notes Section */}
            {sponsor.notes && (
              <Box>
                <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                  Notes
                </Typography>
                
                <Typography sx={{ color: theme.palette.text.primary, whiteSpace: 'pre-wrap' }}>
                  {sponsor.notes}
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>

        {/* Sponsor Contacts Section */}
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
          <Box className="flex justify-between items-center mb-4">
            <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
              Contacts with {sponsor.name}
            </Typography>
            
            <Button 
              variant="contained" 
              color="primary"
              size="small"
              onClick={onAddContact}
              startIcon={<i className="fa-solid fa-plus"></i>}
              sx={{ 
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                }
              }}
            >
              Add Contact
            </Button>
          </Box>
          
          {contactsForSponsor.length === 0 ? (
            <Box className="text-center py-4">
              <Typography sx={{ color: theme.palette.text.secondary }}>
                No contacts recorded with {sponsor.name} yet.
              </Typography>
            </Box>
          ) : (
            <List className="space-y-3">
              {contactsForSponsor.map((contact, index) => {
                const contactTypeInfo = getContactTypeInfo(contact.type);
                
                return (
                  <ListItem
                    key={contact.id || index}
                    className="rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    sx={{
                      backgroundColor: theme.palette.background.default,
                      mb: 1,
                      p: 2,
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      console.log('[SponsorSponsee.tsx:598] Contact clicked:', contact);
                      handleEditContact(contact);
                    }}
                  >
                    <Box className="w-full">
                      <Box className="flex justify-between items-start mb-2">
                        <Box className="flex items-center gap-2">
                          <i className={contactTypeInfo.icon} style={{ color: theme.palette.text.secondary }}></i>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            {contactTypeInfo.label}
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          {formatDateForDisplay(contact.date)}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body1" sx={{ color: theme.palette.text.primary, mb: 1 }}>
                        {contact.note}
                      </Typography>
                      
                      {contact.topic && (
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                          Topic: {contact.topic}
                        </Typography>
                      )}
                      
                      {contact.duration && (
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Duration: {contact.duration} minutes
                        </Typography>
                      )}
                      
                      {/* Action Items for this contact */}
                      {(() => {
                        // For now, don't show action items in the contact cards since we need async data
                        // This will be handled by a separate state management solution
                        const actionItems = [];
                        return actionItems.length > 0 && (
                          <Box className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                            <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                              Action Items:
                            </Typography>
                            
                            {actionItems.map((actionItem) => (
                              <Box 
                                key={actionItem.id}
                                className="flex items-center justify-between py-1"
                                sx={{
                                  '&:hover': {
                                    backgroundColor: theme.palette.action.hover,
                                  }
                                }}
                              >
                                <Box className="flex items-center gap-2 flex-1">
                                  <Checkbox
                                    checked={actionItem.completed === 1}
                                    onChange={() => handleToggleActionItem(actionItem.id)}
                                    size="small"
                                    sx={{
                                      color: theme.palette.text.secondary,
                                      '&.Mui-checked': {
                                        color: theme.palette.primary.main,
                                      }
                                    }}
                                  />
                                  
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      color: theme.palette.text.primary,
                                      textDecoration: actionItem.completed === 1 ? 'line-through' : 'none',
                                      opacity: actionItem.completed === 1 ? 0.7 : 1
                                    }}
                                  >
                                    {actionItem.title}
                                  </Typography>
                                </Box>
                                
                                <IconButton 
                                  size="small" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteActionItem(actionItem.id);
                                  }}
                                  sx={{ 
                                    color: theme.palette.error.main,
                                    '&:hover': {
                                      backgroundColor: theme.palette.error.light + '20',
                                    }
                                  }}
                                >
                                  <i className="fa-solid fa-trash text-xs"></i>
                                </IconButton>
                              </Box>
                            ))}
                          </Box>
                        );
                      })()}
                    </Box>
                  </ListItem>
                );
              })}
            </List>
          )}
        </Paper>
      </Box>
    );
  }

  return (
    <div className="sponsor-sponsee-page">
      <Tabs 
        value={currentTab} 
        onChange={handleTabChange}
        sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          mb: 2,
          '& .MuiTabs-indicator': {
            backgroundColor: theme.palette.primary.main,
          },
          '& .MuiTab-root': {
            color: theme.palette.text.secondary,
            '&.Mui-selected': {
              color: theme.palette.primary.main,
            },
          },
        }}
      >
        <Tab label="Sponsor" />
        <Tab label="Sponsees" />
      </Tabs>

      {/* Sponsor Tab */}
      <TabPanel value={currentTab} index={0}>
        {sponsors.length > 0 ? (
          <Box>
            {/* Nested tabs for multiple sponsors */}
            <Tabs 
              value={currentSponsorTab} 
              onChange={handleSponsorTabChange}
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                mb: 2,
                '& .MuiTabs-indicator': {
                  backgroundColor: theme.palette.secondary.main,
                },
                '& .MuiTab-root': {
                  color: theme.palette.text.secondary,
                  '&.Mui-selected': {
                    color: theme.palette.secondary.main,
                  },
                },
              }}
            >
              {sponsors.map((sponsor, index) => (
                <Tab 
                  key={sponsor.id} 
                  label={`${sponsor.name || 'Sponsor'} ${sponsor.lastName || ''}`.trim()} 
                />
              ))}
              <Tab label="+ Add Sponsor" />
            </Tabs>

            {/* Sponsor content panels */}
            {sponsors.map((sponsor, index) => (
              <TabPanel key={sponsor.id} value={currentSponsorTab} index={index}>
                <SponsorContent 
                  sponsor={sponsor}
                  theme={theme}
                  onEdit={() => handleEditSponsor(sponsor)}
                  onDelete={() => handleDeleteSponsor(sponsor.id)}
                  onAddContact={handleAddContact}
                  loadSponsorContacts={loadSponsorContacts}
                  getActionItemsForContact={getActionItemsForContact}
                  getContactTypeInfo={getContactTypeInfo}
                  handleEditContact={handleEditContact}
                  handleToggleActionItem={handleToggleActionItem}
                  handleDeleteActionItem={handleDeleteActionItem}
                  refreshKey={refreshKey}
                  formatDateForDisplay={formatDateForDisplay}
                />
              </TabPanel>
            ))}

            {/* Add Sponsor panel */}
            <TabPanel value={currentSponsorTab} index={sponsors.length}>
              <Box className="text-center py-6">
                <Typography variant="body1" sx={{ color: theme.palette.text.primary, mb: 3 }}>
                  Add another sponsor or service sponsor.
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
            </TabPanel>
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
      </TabPanel>

      {/* Sponsee Tab */}
      <TabPanel value={currentTab} index={1}>
        <Box className="text-center py-6">
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              setEditingSponseeId(null);
              setShowSponseeForm(true);
            }}
            startIcon={<i className="fa-solid fa-plus"></i>}
          >
            Add Sponsee
          </Button>
        </Box>
        
        {sponsees.length === 0 ? (
          <Box className="text-center py-8">
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
              No sponsees added yet.
            </Typography>
          </Box>
        ) : (
          <List className="space-y-4">
            {sponsees.map((sponsee) => (
              <ListItem
                key={sponsee.id}
                sx={{
                  backgroundColor: theme.palette.background.paper,
                  boxShadow: theme.shadows[1],
                  borderRadius: 2,
                  p: 2,
                  mb: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  }
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
                      {sponsee.name} {sponsee.lastName || ''}
                    </Typography>
                  }
                  secondary={
                    <Box className="mt-2">
                      {sponsee.phone && (
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <i className="fa-solid fa-phone text-sm"></i>
                          {sponsee.phone}
                        </Typography>
                      )}
                      
                      {sponsee.email && (
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <i className="fa-solid fa-envelope text-sm"></i>
                          {sponsee.email}
                        </Typography>
                      )}
                      
                      {sponsee.sobrietyDate && (
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <i className="fa-solid fa-calendar-check text-sm"></i>
                          Sobriety Date: {formatDateForDisplay(sponsee.sobrietyDate)}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                
                <Box className="flex gap-2">
                  <IconButton 
                    onClick={() => handleEditSponsee(sponsee)}
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
              </ListItem>
            ))}
          </List>
        )}
      </TabPanel>

      {/* Dialog Components */}
      <SponsorFormDialog
        open={showSponsorForm}
        onClose={() => {
          setShowSponsorForm(false);
          setEditingSponsor(false);
        }}
        onSubmit={handleSponsorSubmit}
        initialData={editingSponsor && sponsors.length > 0 ? sponsors[0] : null}
      />
      
      <SponseeFormDialog
        open={showSponseeForm}
        onClose={() => {
          setShowSponseeForm(false);
          setEditingSponseeId(null);
        }}
        onSubmit={handleSponseeSubmit}
        initialData={editingSponseeId ? sponsees.find(s => s.id === editingSponseeId) : null}
      />
      
      <SponsorContactFormPage
        open={showContactForm}
        onClose={() => {
          setShowContactForm(false);
          setEditingActionItem(null);
          setEditingContact(null);
        }}
        onSubmit={editingContact ? handleEditContactWithActionItem : handleAddContactWithActionItem}
        userId={user ? user.id : null}
        initialData={editingContact ? editingContact : null}
        details={editingActionItem ? {
          dueDate: editingActionItem.dueDate,
          notes: editingActionItem.notes
        } : null}
      />
    </div>
  );
}