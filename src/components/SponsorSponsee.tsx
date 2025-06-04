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
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DatabaseService from '../services/DatabaseService';
import SponsorFormDialog from './SponsorFormDialog';
import SponseeFormDialog from './SponseeFormDialog';
import SponsorContactFormPage from './SponsorContactFormPage';
import { ActionItemsList } from './ActionItemsList';
import { ContactCard } from './ContactCard';
import { SponsorInfoSection } from './SponsorInfoSection';
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
  const [editingSponsor, setEditingSponsor] = useState(null);
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
      const databaseService = DatabaseService.getInstance();
      const allSponsors = await databaseService.getAll('sponsors');
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
      const databaseService = DatabaseService.getInstance();
      const allContacts = await databaseService.getAllSponsorContacts();
      console.log('Loaded sponsor contacts:', allContacts);
      
      // Ensure we have a valid array
      const contactsArray = Array.isArray(allContacts) ? allContacts : [];
      
      // Filter by sponsor ID if provided
      console.log('[SponsorSponsee.tsx:99] Before filter - contactsArray:', contactsArray, 'sponsorId:', sponsorId);
      const filteredContacts = sponsorId 
        ? contactsArray.filter((contact: any) => contact && contact.sponsorId === sponsorId)
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
      const databaseService = DatabaseService.getInstance();

      // Get action items that reference this specific contact
      const allActionItems = await databaseService.getAll('action_items');
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
      const databaseService = DatabaseService.getInstance();
      
      // Get all action items to find the one we're updating
      const allActionItems = await databaseService.getAll('action_items');
      const actionItem = allActionItems.find(item => item.id === actionItemId);
      
      if (!actionItem) {
        console.error('Action item not found for ID:', actionItemId);
        return;
      }
      
      // Toggle completion status
      const updatedActionItem = {
        ...actionItem,
        completed: actionItem.completed === 1 ? 0 : 1,
        updatedAt: new Date().toISOString()
      };
      
      console.log('Toggling completion for action item:', updatedActionItem);
      
      // Update the action item in the database
      await databaseService.update('action_items', actionItemId, updatedActionItem);
      
      // Refresh to get updated data
      setRefreshKey(prev => prev + 1);
      
    } catch (error) {
      console.error('Error toggling action item:', error);
    }
  };
  
  // Delete action item
  const handleDeleteActionItem = async (actionItemId) => {
    try {
      const databaseService = DatabaseService.getInstance();
      
      // Delete the action item from the database
      await databaseService.remove('action_items', actionItemId);
      
      console.log('Deleted action item with ID:', actionItemId);
      
      // Refresh to get updated data
      setRefreshKey(prev => prev + 1);
      
    } catch (error) {
      console.error('Error deleting action item:', error);
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

      const databaseService = DatabaseService.getInstance();
      const savedContact = await databaseService.addSponsorContact(newContact);
      console.log('[SponsorSponsee.tsx] Saved contact with ID:', savedContact?.id);

      // Verify the contact was saved and get the actual ID
      if (!savedContact || !savedContact.id) {
        console.error('[SponsorSponsee.tsx] Failed to save contact - no ID returned');
        return;
      }

      // Contact saved successfully, proceed with action items
      console.log('[SponsorSponsee.tsx] Contact saved, proceeding with action items');

      // Process all action items if any exist
      if (actionItems && actionItems.length > 0) {
        console.log('[SponsorSponsee.tsx] Processing', actionItems.length, 'action items with contactId:', savedContact.id);
        
        // Add a small delay to ensure the contact is fully committed to the database
        await new Promise(resolve => setTimeout(resolve, 100));
        
        for (const actionItemData of actionItems) {
          if (actionItemData && actionItemData.title) {
            // Remove the temporary negative ID and let AUTO_INCREMENT handle it
            const { id, ...actionItemWithoutId } = actionItemData;
            
            const actionItem = {
              contactId: savedContact.id, // Use the verified saved contact ID
              title: actionItemWithoutId.title,
              text: actionItemWithoutId.text || actionItemWithoutId.title,
              notes: actionItemWithoutId.notes || '',
              dueDate: actionItemWithoutId.dueDate || null,
              completed: (actionItemWithoutId.completed ? 1 : 0) as 0 | 1,
              type: actionItemWithoutId.type || 'todo',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            console.log('[SponsorSponsee.tsx] Saving action item:', actionItem);
            
            try {
              const savedActionItem = await databaseService.addActionItem(actionItem);
              console.log('[SponsorSponsee.tsx] Saved action item with ID:', savedActionItem?.id);
            } catch (actionItemError) {
              console.error('[SponsorSponsee.tsx] Failed to save action item:', actionItemError);
              // Continue with other action items even if one fails
            }
          }
        }
      }

      // Trigger UI refresh to show the new data
      console.log('[SponsorSponsee.tsx] Triggering UI refresh...');
      setRefreshKey(prev => prev + 1);
      console.log('[SponsorSponsee.tsx] UI refresh triggered');

    } catch (error) {
      console.error('[SponsorSponsee.tsx] Error adding contact:', error);
    } finally {
      // Always close the modal, even if there were errors
      console.log('[SponsorSponsee.tsx] Closing modal in finally block...');
      setShowContactForm(false);
      setEditingContact(null);
      setEditingActionItem(null);
      console.log('[SponsorSponsee.tsx] Modal should now be closed');
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

      const databaseService = DatabaseService.getInstance();
      await databaseService.updateSponsorContact(editingContact.id, updatedContact);

      // Handle action items if any
      for (const actionItemData of actionItems) {
        // Remove the temporary negative ID and let AUTO_INCREMENT handle it
        const { id, ...actionItemWithoutId } = actionItemData;
        
        const actionItem = {
          contactId: editingContact.id, // Link to the specific contact
          title: actionItemWithoutId.title,
          text: actionItemWithoutId.text || actionItemWithoutId.title,
          notes: actionItemWithoutId.notes || '',
          dueDate: actionItemWithoutId.dueDate || null,
          completed: (actionItemWithoutId.completed ? 1 : 0) as 0 | 1,
          type: actionItemWithoutId.type || 'todo',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await databaseService.addActionItem(actionItem);
      }

      // Refresh the contacts list
      setRefreshKey(prev => prev + 1);
      
    } catch (error) {
      console.error('Error editing contact:', error);
    } finally {
      // Always close the modal, even if there were errors
      setShowContactForm(false);
      setEditingContact(null);
      setEditingActionItem(null);
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
      const databaseService = DatabaseService.getInstance();

      // Add or update sponsor in sponsors table
      if (editingSponsor && editingSponsor.id) {
        // Update existing sponsor
        await databaseService.update('sponsors', editingSponsor.id, sponsorData);
      } else {
        // Add new sponsor
        await databaseService.add('sponsors', {
          ...sponsorData,
          sponsorType: 'sponsor', // Default type
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      // Reload sponsors
      await loadSponsors();
      setShowSponsorForm(false);
      setEditingSponsor(null);
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
      console.log('[ SponsorSponsee.tsx ] Deleting sponsor with ID:', sponsorId);
      const databaseService = DatabaseService.getInstance();

      // Delete sponsor from sponsors table
      await databaseService.remove('sponsors', sponsorId);
      console.log('[ SponsorSponsee.tsx ] Sponsor deleted successfully');
      
      // Also delete all related sponsor contacts
      const allContacts = await databaseService.getAllSponsorContacts();
      const sponsorContacts = allContacts.filter(contact => contact.sponsorId === sponsorId);
      
      for (const contact of sponsorContacts) {
        await databaseService.remove('sponsor_contacts', contact.id);
        console.log('[ SponsorSponsee.tsx ] Deleted sponsor contact:', contact.id);
      }
      
      // Reload sponsors
      await loadSponsors();
      
      // Reset to first tab if current sponsor was deleted
      const currentSponsor = sponsors[currentSponsorTab];
      if (currentSponsor && currentSponsor.id === sponsorId) {
        setCurrentSponsorTab(0);
      }
      
      console.log('[ SponsorSponsee.tsx ] Sponsor deletion completed');
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
          
          {/* Contact Information */}
          <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
            Contact Information
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            
            {sponsor.phoneNumber && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <IconButton 
                  size="small" 
                  component="a" 
                  href={`tel:${sponsor.phoneNumber}`}
                  sx={{ color: theme.palette.primary.main }}
                >
                  <i className="fa-solid fa-phone text-sm"></i>
                </IconButton>
                <IconButton 
                  size="small" 
                  component="a" 
                  href={`sms:${sponsor.phoneNumber}`}
                  sx={{ color: theme.palette.secondary.main }}
                >
                  <i className="fa-solid fa-message text-sm"></i>
                </IconButton>
                <Typography sx={{ color: theme.palette.text.primary, ml: 1 }}>
                  {sponsor.phoneNumber}
                </Typography>
              </Box>
            )}
            
            {sponsor.email && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <IconButton 
                  size="small" 
                  component="a" 
                  href={`mailto:${sponsor.email}`}
                  sx={{ color: theme.palette.primary.main }}
                >
                  <i className="fa-solid fa-envelope text-sm"></i>
                </IconButton>
                <Typography sx={{ color: theme.palette.text.primary, ml: 1 }}>
                  {sponsor.email}
                </Typography>
              </Box>
            )}
            
            {/* Show message if no contact info */}
            {!sponsor.phoneNumber && !sponsor.phone && !sponsor.email && (
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontStyle: 'italic' }}>
                No contact information available. Edit sponsor to add phone or email.
              </Typography>
            )}
          </Box>

          {/* Collapsible Info Section */}
          <SponsorInfoSection sponsor={sponsor} theme={theme} />
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
              {contactsForSponsor.map((contact, index) => (
                <ContactCard
                  key={contact.id || index}
                  contact={contact}
                  theme={theme}
                  refreshKey={refreshKey}
                  onContactClick={handleEditContact}
                />
              ))}
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
                    setEditingSponsor(null);
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
          <Box sx={{ 
            textAlign: 'center', 
            py: 6, 
            px: 3,
            margin: '16px',
            backgroundColor: theme.palette.background.paper,
            borderRadius: '8px',
            border: `1px solid ${theme.palette.divider}`
          }}>
            <Typography variant="body1" sx={{ color: theme.palette.text.primary, mb: 3 }}>
              You haven't added your sponsor yet.
            </Typography>
            
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => {
                setEditingSponsor(null);
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
          setEditingSponsor(null);
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