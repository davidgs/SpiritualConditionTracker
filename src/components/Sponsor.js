import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Box,  
  IconButton,
  Divider,
  Button
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
// Using page-based navigation components
import SponsorContactList from './SponsorContactList';
import SponsorContactDetailsPage from './SponsorContactDetailsPage';
import SponsorContactFormPage from './SponsorContactFormPage';
import SponsorFormPage from './SponsorFormPage';
import { formatDateForDisplay } from '../utils/dateUtils';
import { v4 as uuidv4 } from 'uuid';

export default function Sponsor({ user, onUpdate }) {
  const theme = useTheme();
  
  // State for sponsor
  const [sponsor, setSponsor] = useState(null);
  
  // State for sponsor contacts
  const [contacts, setContacts] = useState([]);
  const [contactDetails, setContactDetails] = useState({});
  
  // View states
  const [currentView, setCurrentView] = useState('main'); // 'main', 'details', 'add-contact', 'add-sponsor', 'edit-sponsor'
  const [selectedContact, setSelectedContact] = useState(null);
  
  // Removed dialog states in favor of page-based navigation
  
  // Load sponsor data from user
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
      
      // Load sponsor contacts
      loadSponsorContacts();
    }
  }, [user]);
  
  // Load sponsor contacts from database
  const loadSponsorContacts = async () => {
    try {
      if (window.db && window.dbInitialized) {
        // Query all sponsor contacts for current user
        // Log attempt with exact userId for debugging
        console.log('Attempting to load sponsor contacts for userId:', user.id);
        
        // Use direct sqlite plugin call to avoid our custom wrapper
        const sqlite = window.Capacitor.Plugins.CapacitorSQLite;
        const contactsResult = await sqlite.query({
          database: 'spiritualTracker.db',
          statement: 'SELECT * FROM sponsor_contacts WHERE userId = ? ORDER BY date DESC',
          values: [user.id]
        });
        
        // Handle the direct result format
        const results = contactsResult.values || [];
        console.log('Got sponsor contacts results:', results);
        
        setContacts(results);
        
        // Load details for each contact
        const detailsMap = {};
        
        for (const contact of results) {
          console.log('Loading details for contact:', contact);
          
          const detailsResult = await sqlite.query({
            database: 'spiritualTracker.db',
            statement: 'SELECT * FROM sponsor_contact_details WHERE contactId = ?',
            values: [contact.id]
          });
          
          const contactDetails = detailsResult.values || [];
          console.log('Got contact details:', contactDetails);
          
          detailsMap[contact.id] = contactDetails;
        }
        
        setContactDetails(detailsMap);
      }
    } catch (error) {
      console.error('Error loading sponsor contacts:', error);
    }
  };
  
  // Handle sponsor form submission
  const handleSponsorSubmit = (sponsorData) => {
    // Create a copy of the current user data
    // Instead of storing as a nested object which can cause SQL issues,
    // flatten the structure with sponsor_ prefix
    const userUpdate = {
      sponsor_name: sponsorData.name || '',
      sponsor_lastName: sponsorData.lastName || '',
      sponsor_phone: sponsorData.phone || '',
      sponsor_email: sponsorData.email || '',
      sponsor_sobrietyDate: sponsorData.sobrietyDate || '',
      sponsor_notes: sponsorData.notes || '',
    };
    
    // Update user in database through parent component
    onUpdate(userUpdate, { redirectToDashboard: false });
    
    // Update local state
    setSponsor(sponsorData);
  };
  
  // Open sponsor form for editing - using page approach
  const handleEditSponsor = () => {
    setCurrentView('edit-sponsor');
  };
  
  // Open sponsor form for adding new sponsor
  const handleAddSponsor = () => {
    setCurrentView('add-sponsor');
  };
  
  // Delete sponsor
  const handleDeleteSponsor = () => {
    // Create update to remove sponsor fields
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
  
  // Add a new sponsor contact
  const handleAddContact = async (contactData) => {
    try {
      if (window.db && window.dbInitialized) {
        // Insert contact into database
        await window.db.insert('sponsor_contacts', contactData);
        
        // Refresh contacts from database
        await loadSponsorContacts();
      }
    } catch (error) {
      console.error('Error adding sponsor contact:', error);
    }
  };
  
  // View contact details
  const handleViewContactDetails = (contact) => {
    setSelectedContact(contact);
    setCurrentView('details');
  };
  
  // Add new contact
  const handleAddNewContact = () => {
    setSelectedContact(null);
    setCurrentView('add-contact');
  };
  
  // Go back to main view
  const handleBackToMain = () => {
    setCurrentView('main');
    setSelectedContact(null);
  };
  
  // Save contact detail (action item)
  const handleSaveContactDetail = async (detail) => {
    try {
      if (window.db && window.dbInitialized) {
        // Check if detail already exists
        const existingDetails = await window.db.query(
          'SELECT * FROM sponsor_contact_details WHERE id = ?',
          [detail.id]
        );
        
        if (existingDetails && existingDetails.length > 0) {
          // Update existing detail
          await window.db.update('sponsor_contact_details', detail.id, detail);
        } else {
          // Insert new detail
          await window.db.insert('sponsor_contact_details', detail);
        }
        
        // Refresh details from database
        await loadSponsorContacts();
      }
    } catch (error) {
      console.error('Error saving contact detail:', error);
    }
  };
  
  // Delete contact and its details
  const handleDeleteContact = async (contactId) => {
    try {
      if (window.db && window.dbInitialized) {
        // Delete contact details first (foreign key constraint)
        await window.db.execute(
          'DELETE FROM sponsor_contact_details WHERE contactId = ?',
          [contactId]
        );
        
        // Delete contact
        await window.db.execute(
          'DELETE FROM sponsor_contacts WHERE id = ?',
          [contactId]
        );
        
        // Go back to contacts list
        handleBackToContacts();
        
        // Refresh contacts from database
        await loadSponsorContacts();
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };
  
  // Delete a specific contact detail (for todos and action items)
  const handleDeleteContactDetail = async (detailId, contactId) => {
    try {
      if (window.db && window.dbInitialized) {
        // Delete the detail from database
        await window.db.execute(
          'DELETE FROM sponsor_contact_details WHERE id = ?',
          [detailId]
        );
        
        // Update state to remove the detail
        const existingDetails = contactDetails[contactId] || [];
        const updatedDetails = existingDetails.filter(detail => detail.id !== detailId);
        
        setContactDetails(prev => ({
          ...prev,
          [contactId]: updatedDetails
        }));
      }
    } catch (error) {
      console.error('Error deleting contact detail:', error);
    }
  };
  
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Show contact details page if in details view */}
      {currentView === 'details' && selectedContact ? (
        <SponsorContactDetailsPage
          contact={selectedContact}
          details={contactDetails[selectedContact.id] || []}
          onBack={handleBackToMain}
          onSaveDetails={handleSaveContactDetail}
          onDeleteDetail={(detailId) => handleDeleteContactDetail(detailId, selectedContact.id)}
          onUpdateContact={() => {}}
          onDeleteContact={handleDeleteContact}
        />
      ) : currentView === 'add-contact' ? (
        <SponsorContactFormPage
          userId={user ? user.id : ''}
          onSave={handleAddContact}
          onCancel={handleBackToMain}
          initialData={null}
        />
      ) : currentView === 'add-sponsor' ? (
        <SponsorFormPage
          onSave={handleSponsorSubmit}
          onCancel={handleBackToMain}
          initialData={null}
        />
      ) : currentView === 'edit-sponsor' ? (
        <SponsorFormPage
          onSave={handleSponsorSubmit}
          onCancel={handleBackToMain}
          initialData={sponsor}
        />
      ) : (
        // Otherwise show the main sponsor page with contact list
        <>
          {/* Alert icon when no sponsor is added - at the very top */}
          {!sponsor && (
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                mb: 3,
                mt: -2 
              }}
            >
              <i 
                className="fa-solid fa-triangle-exclamation" 
                style={{ 
                  fontSize: '3rem', 
                  color: theme.palette.error.main
                }}
              ></i>
            </Box>
          )}
          
          {/* Sponsor Section with inline add button */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography 
              variant="h5" 
              component="h2"
              sx={{ 
                color: theme.palette.text.primary, 
                fontWeight: 'bold',
                display: 'inline-flex',
                alignItems: 'center'
              }}
            >
              My Sponsor
              <IconButton 
                onClick={handleAddSponsor}
                size="small"
                sx={{ 
                  color: theme.palette.primary.main, 
                  '&:hover': { 
                    backgroundColor: theme.palette.background.transparent || 'transparent' 
                  },
                  ml: 0.5,
                  p: 0.5,
                  minWidth: 'auto'
                }}
              >
                <i className="fa-solid fa-plus"></i>
              </IconButton>
            </Typography>
          </Box>

          <Paper 
            elevation={0}
            sx={{ 
              p: 2.5, 
              mb: 4, 
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
              boxShadow: theme.shadows[1]
            }}
          >
            {sponsor ? (
              <Box>
                <Box sx={{ mb: 2 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: theme.palette.text.primary, 
                      fontWeight: 'bold' 
                    }}
                  >
                    {sponsor.name} {sponsor.lastName || ''}
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                  gap: 2 
                }}>
                  {/* Contact Information */}
                  <Box>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        color: theme.palette.text.secondary, 
                        mb: 1 
                      }}
                    >
                      Contact Information
                    </Typography>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1 }}>
                      {sponsor.phone && (
                        <Typography 
                          sx={{ 
                            color: theme.palette.text.secondary, 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1 
                          }}
                        >
                          <i 
                            className="fa-solid fa-phone text-sm" 
                            style={{ color: theme.palette.text.secondary }}
                          ></i>
                          {sponsor.phone}
                        </Typography>
                      )}
                      
                      {sponsor.email && (
                        <Typography 
                          sx={{ 
                            color: theme.palette.text.secondary, 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1 
                          }}
                        >
                          <i 
                            className="fa-solid fa-envelope text-sm" 
                            style={{ color: theme.palette.text.secondary }}
                          ></i>
                          {sponsor.email}
                        </Typography>
                      )}
                      
                      {sponsor.sobrietyDate && (
                        <Typography 
                          sx={{ 
                            color: theme.palette.text.secondary, 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1 
                          }}
                        >
                          <i 
                            className="fa-solid fa-calendar-check text-sm" 
                            style={{ color: theme.palette.text.secondary }}
                          ></i>
                          {formatDateForDisplay(sponsor.sobrietyDate)}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
                
                {/* Notes Section */}
                {sponsor.notes && (
                  <Box sx={{ mt: 2 }}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        color: theme.palette.text.secondary, 
                        mb: 1 
                      }}
                    >
                      Notes
                    </Typography>
                    
                    <Typography 
                      sx={{ 
                        color: theme.palette.text.secondary, 
                        whiteSpace: 'pre-wrap' 
                      }}
                    >
                      {sponsor.notes}
                    </Typography>
                  </Box>
                )}
                
                {/* Action Buttons */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  gap: 1, 
                  mt: 2, 
                  pt: 1.5,
                  borderTop: `1px solid ${theme.palette.divider}`
                }}>
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
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography 
                  variant="body1" 
                  sx={{ color: theme.palette.text.secondary }}
                >
                  You haven't added your sponsor yet. An AA Sponsor is a trusted AA member who helps you stay sober and grow in recovery. It is very important that you have a sponsor and that you maintain regular contact with your sponsor.
                </Typography>
              </Box>
            )}
          </Paper>
          
          {/* Sponsor Contact History Section */}
          {sponsor && (
            <SponsorContactList
              userId={user ? user.id : ''}
              contacts={contacts}
              onContactAdded={handleAddNewContact}
              onViewDetails={handleViewContactDetails}
            />
          )}
          
          {/* Removed Sponsor Form Dialog in favor of page-based navigation */}
        </>
      )}
    </Box>
  );
}