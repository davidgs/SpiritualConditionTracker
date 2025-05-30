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
    
    console.log('Found sponsor contact activities:', sponsorContactActivities);
    console.log('Converted to contacts:', contacts);
    setSponsorContacts(contacts);
  };

  // Get action items for a specific contact date
  const getActionItemsForContact = (contactDate) => {
    const contactDateObj = new Date(contactDate);
    const contactDateString = contactDateObj.toISOString().split('T')[0];
    
    return activities.filter(activity => {
      if (activity.type !== 'action-item') return false;
      
      const activityDateObj = new Date(activity.date);
      const activityDateString = activityDateObj.toISOString().split('T')[0];
      
      // Match action items created on the same day as the contact
      return activityDateString === contactDateString;
    }).map(activity => ({
      id: activity.id,
      title: activity.notes?.split(' - ')[0]?.replace('Action Item: ', '') || 'Action Item',
      text: activity.notes?.split(' - ')[1]?.split(' [Notes:')[0] || '',
      notes: activity.notes?.match(/\[Notes: (.*?)\]/)?.[1] || '',
      completed: activity.location === 'completed',
      dueDate: activity.date,
      activityData: activity // Keep reference to original activity
    }));
  };

  // Toggle action item completion
  const handleToggleActionItem = async (actionItem) => {
    try {
      // Use the database update function to change completion status
      if (window.db && window.db.update) {
        await window.db.update('activities', actionItem.id, {
          location: actionItem.completed ? 'pending' : 'completed'
        });
        
        // Trigger a reload of contacts to reflect the change
        loadSponsorContacts();
        
        console.log('Action item completion toggled:', actionItem.id, !actionItem.completed);
      }
    } catch (error) {
      console.error('Error toggling action item completion:', error);
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
      
      // Save action items as individual activities if any were provided
      if (actionItems && actionItems.length > 0) {
        try {
          const actionItemPromises = actionItems.map(actionItem => {
            const todoActivityData = {
              userId: user?.id || 1, // Ensure userId is provided
              type: 'action-item', // Use new action-item type
              date: actionItem.dueDate || new Date().toISOString(),
              notes: `Action Item: ${actionItem.title}${actionItem.text ? ' - ' + actionItem.text : ''}${actionItem.notes ? ' [Notes: ' + actionItem.notes + ']' : ''}`,
              location: actionItem.completed ? 'completed' : 'pending'
            };
            
            console.log('Saving action item as activity:', todoActivityData);
            return onSaveActivity(todoActivityData);
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
                            const actionItems = getActionItemsForContact(contact.date);
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
                                        checked={item.completed}
                                        onChange={() => handleToggleActionItem(item)}
                                        size="small"
                                        sx={{
                                          p: 0,
                                          '& .MuiSvgIcon-root': {
                                            fontSize: '16px'
                                          }
                                        }}
                                      />
                                      <Typography 
                                        variant="body2" 
                                        sx={{ 
                                          color: item.completed ? theme.palette.text.secondary : theme.palette.text.primary,
                                          textDecoration: item.completed ? 'line-through' : 'none',
                                          flex: 1,
                                          fontSize: '0.8rem'
                                        }}
                                      >
                                        {item.title}
                                      </Typography>
                                      <IconButton
                                        size="small"
                                        onClick={() => {
                                          // TODO: Implement edit action item functionality
                                          console.log('Edit action item:', item);
                                        }}
                                        sx={{
                                          p: 0.25,
                                          color: theme.palette.text.secondary,
                                          '&:hover': {
                                            color: theme.palette.primary.main,
                                            backgroundColor: 'transparent'
                                          }
                                        }}
                                      >
                                        <i className="fa-solid fa-pen" style={{ fontSize: '10px' }}></i>
                                      </IconButton>
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
        onClose={() => setShowContactForm(false)}
        onSubmit={handleAddContact}
        userId={user?.id || 'default_user'}
      />
    </div>
  );
}