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
  ListItemText
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
    const contacts = sponsorContactActivities.map(activity => ({
      id: activity.id,
      type: activity.details?.contactType || 'other',
      date: activity.date,
      note: activity.note || '',
      duration: activity.details?.duration || '',
      topic: activity.details?.topic || ''
    }));
    
    console.log('Found sponsor contact activities:', sponsorContactActivities);
    console.log('Converted to contacts:', contacts);
    setSponsorContacts(contacts);
  };

  // Handle sponsor contact form submission
  const handleAddContact = async (contactData) => {
    try {
      console.log('Adding new sponsor contact with data:', contactData);
      
      // Convert sponsor contact to activity format
      const activityData = {
        type: 'sponsor-contact',
        date: contactData.date || new Date().toISOString(),
        note: contactData.note || '',
        details: {
          contactType: contactData.type,
          duration: contactData.duration || '',
          topic: contactData.topic || ''
        }
      };
      
      console.log('Saving sponsor contact as activity:', activityData);
      
      // Save using the shared database handler from App.tsx
      const savedActivity = await onSaveActivity(activityData);
      console.log('Contact saved successfully as activity:', savedActivity);
      
      // Close the form
      setShowContactForm(false);
      
    } catch (error) {
      console.error('Error adding sponsor contact:', error);
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
        className="p-5 mb-8 rounded-lg"
        sx={{ 
          backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          boxShadow: darkMode ? '0 4px 12px rgba(0, 0, 0, 0.25)' : '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}
      >
        {sponsor ? (
          <Box>
            <Box className="mb-4">
              <Typography variant="h6" sx={{ color: darkMode ? '#f3f4f6' : '#1f2937', fontWeight: 'bold' }}>
                {sponsor.name} {sponsor.lastName || ''}
              </Typography>
            </Box>
            
            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Contact Information */}
              <Box>
                <Typography variant="subtitle2" sx={{ color: darkMode ? '#9ca3af' : '#6b7280', mb: 1 }}>
                  Contact Information
                </Typography>
                
                <Box className="grid grid-cols-1 gap-2">
                  {sponsor.phone && (
                    <Typography sx={{ color: darkMode ? '#d1d5db' : '#4b5563', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <i className="fa-solid fa-phone text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}></i>
                      {sponsor.phone}
                    </Typography>
                  )}
                  
                  {sponsor.email && (
                    <Typography sx={{ color: darkMode ? '#d1d5db' : '#4b5563', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <i className="fa-solid fa-envelope text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}></i>
                      {sponsor.email}
                    </Typography>
                  )}
                  
                  {sponsor.sobrietyDate && (
                    <Typography sx={{ color: darkMode ? '#d1d5db' : '#4b5563', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <i className="fa-solid fa-calendar-check text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}></i>
                      {formatDateForDisplay(sponsor.sobrietyDate)}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
            
            {/* Notes Section */}
            {sponsor.notes && (
              <Box className="mt-4">
                <Typography variant="subtitle2" sx={{ color: darkMode ? '#9ca3af' : '#6b7280', mb: 1 }}>
                  Notes
                </Typography>
                
                <Typography sx={{ color: darkMode ? '#d1d5db' : '#4b5563', whiteSpace: 'pre-wrap' }}>
                  {sponsor.notes}
                </Typography>
              </Box>
            )}
            
            {/* Action Buttons */}
            <Box className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <IconButton 
                onClick={handleEditSponsor}
                size="small"
                sx={{ color: darkMode ? '#93c5fd' : '#3b82f6' }}
              >
                <i className="fa-solid fa-pen-to-square"></i>
              </IconButton>
              
              <IconButton 
                onClick={handleDeleteSponsor}
                size="small"
                sx={{ color: darkMode ? '#f87171' : '#ef4444' }}
              >
                <i className="fa-solid fa-trash"></i>
              </IconButton>
            </Box>
          </Box>
        ) : (
          <Box className="text-center py-6">
            <Typography variant="body1" sx={{ color: darkMode ? '#d1d5db' : '#4b5563', mb: 3 }}>
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
          className="p-5 rounded-lg"
          sx={{ 
            backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            boxShadow: darkMode ? '0 4px 12px rgba(0, 0, 0, 0.25)' : '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Box className="flex justify-between items-center mb-4">
            <Typography variant="h6" sx={{ color: darkMode ? '#f3f4f6' : '#1f2937', fontWeight: 'bold' }}>
              Sponsor Contacts
            </Typography>
            
            <Button 
              variant="contained" 
              color="primary"
              size="small"
              onClick={() => setShowContactForm(true)}
              startIcon={<i className="fa-solid fa-plus"></i>}
            >
              Add Contact
            </Button>
          </Box>

          {/* Contact List */}
          {sponsorContacts.length > 0 ? (
            <List>
              {sponsorContacts.map((contact, index) => (
                <React.Fragment key={contact.id || index}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Typography sx={{ color: darkMode ? '#f3f4f6' : '#1f2937', fontWeight: 500 }}>
                          {getContactTypeLabel(contact.type)}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                            {formatDateForDisplay(contact.date)}
                          </Typography>
                          {contact.note && (
                            <Typography variant="body2" sx={{ color: darkMode ? '#d1d5db' : '#4b5563', mt: 0.5 }}>
                              {contact.note}
                            </Typography>
                          )}
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
              <Typography variant="body2" sx={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
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
                backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                boxShadow: darkMode ? '0 4px 12px rgba(0, 0, 0, 0.25)' : '0 4px 12px rgba(0, 0, 0, 0.1)',
                borderRadius: '0.5rem'
              }}
            >
              <CardContent>
                <Box className="mb-3">
                  <Typography variant="h6" sx={{ color: darkMode ? '#f3f4f6' : '#1f2937', fontWeight: 'bold' }}>
                    {sponsee.name} {sponsee.lastName || ''}
                  </Typography>
                </Box>
                
                <Box className="grid grid-cols-1 gap-2">
                  {/* Contact Information */}
                  <Box className="grid grid-cols-1 gap-2">
                    {sponsee.phone && (
                      <Typography sx={{ color: darkMode ? '#d1d5db' : '#4b5563', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <i className="fa-solid fa-phone text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}></i>
                        {sponsee.phone}
                      </Typography>
                    )}
                    
                    {sponsee.email && (
                      <Typography sx={{ color: darkMode ? '#d1d5db' : '#4b5563', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <i className="fa-solid fa-envelope text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}></i>
                        {sponsee.email}
                      </Typography>
                    )}
                    
                    {sponsee.sobrietyDate && (
                      <Typography sx={{ color: darkMode ? '#d1d5db' : '#4b5563', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <i className="fa-solid fa-calendar-check text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}></i>
                        {formatDateForDisplay(sponsee.sobrietyDate)}
                      </Typography>
                    )}
                  </Box>
                  
                  {/* Notes (if present) */}
                  {sponsee.notes && (
                    <Box className="mt-2">
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="caption" sx={{ color: darkMode ? '#9ca3af' : '#6b7280', display: 'block', mb: 0.5 }}>
                        Notes
                      </Typography>
                      <Typography sx={{ color: darkMode ? '#d1d5db' : '#4b5563', fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
                        {sponsee.notes}
                      </Typography>
                    </Box>
                  )}
                  
                  {/* Action Buttons */}
                  <Box className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <IconButton 
                      onClick={() => handleEditSponsee(sponsee.id)}
                      size="small"
                      sx={{ color: darkMode ? '#93c5fd' : '#3b82f6' }}
                    >
                      <i className="fa-solid fa-pen-to-square"></i>
                    </IconButton>
                    
                    <IconButton 
                      onClick={() => handleDeleteSponsee(sponsee.id)}
                      size="small"
                      sx={{ color: darkMode ? '#f87171' : '#ef4444' }}
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
          className="p-6 rounded-lg text-center"
          sx={{ 
            backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            boxShadow: darkMode ? '0 4px 12px rgba(0, 0, 0, 0.25)' : '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Typography variant="body1" sx={{ color: darkMode ? '#d1d5db' : '#4b5563' }}>
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