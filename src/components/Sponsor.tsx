import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Box,  
  IconButton,
  Divider,
  Button,
  Link
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
// Using page-based navigation components
import SponsorContactList from './SponsorContactList';
import SponsorContactDetailsPage from './SponsorContactDetailsPage';
import SponsorContactFormPage from './SponsorContactFormPage';
import SponsorFormPage from './SponsorFormPage';
import { formatDateForDisplay } from '../utils/dateUtils';
import { formatPhoneNumber, createPhoneUrl } from '../utils/phoneUtils';
// Import specialized sponsor database functions
import sponsorDB from '../utils/sponsor-database';
import { User, SponsorContact, ContactDetail, ActionItemFormData, SponsorData } from '../types/database';

interface SponsorProps {
  user: User;
  onUpdate: (updates: Partial<User>) => void;
}

export default function Sponsor({ user, onUpdate }: SponsorProps) {
  const theme = useTheme();
  
  // State for sponsor with proper typing
  const [sponsor, setSponsor] = useState<SponsorData | null>(null);
  
  // State for sponsor contacts with proper typing
  const [contacts, setContacts] = useState<SponsorContact[]>([]);
  const [contactDetails, setContactDetails] = useState<{[key: number]: ContactDetail[]}>({});
  
  // View states with strict typing
  const [currentView, setCurrentView] = useState<'main' | 'details' | 'add-contact' | 'add-sponsor' | 'edit-sponsor'>('main');
  const [selectedContact, setSelectedContact] = useState<SponsorContact | null>(null);
  
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
      // Use default_user if user.id is not available to match what we use when saving
      const userId = user?.id || 'default_user';
      console.log('Loading sponsor contacts for userId:', userId);
      
      // Use our specialized sponsor database module
      const contacts = await sponsorDB.getSponsorContacts(userId);
      console.log('Found sponsor contacts:', contacts);
      setContacts(contacts);
      
      // Load details for each contact
      const detailsMap = {};
      
      for (const contact of contacts) {
        console.log('Loading details for contact ID:', contact.id);
        
        const details = await sponsorDB.getContactDetails(contact.id);
        console.log('Found contact details:', details);
        detailsMap[contact.id] = details;
      }
      
      setContactDetails(detailsMap);
      
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
    
    // Navigate back to the main view
    handleBackToMain();
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
  
  // Add a new sponsor contact with optional Action Items
  const handleAddContact = async (contactData, actionItems = []) => {
    try {
      console.log('Adding new contact with data:', contactData);
      
      // Prepare data for insertion
      // Remove any existing ID - we'll let SQLite generate one with autoincrement
      const { id, ...contactWithoutId } = contactData;
      
      // Ensure we have a valid userId to avoid constraint errors
      // Convert userId to string to match database schema (TEXT field)
      const userId = user && user.id ? String(user.id) : 'default_user';
      
      const contact = {
        ...contactWithoutId,
        userId: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Insert using our specialized sponsor database module
      console.log('[ Sponsor ] Inserting contact into database:', contact);
      console.log('[ Sponsor ] About to call sponsorDB.addSponsorContact...');
      const savedContact = await sponsorDB.addSponsorContact(contact);
      
      console.log('[ Sponsor ] Contact saved with ID:', savedContact.id);
      console.log('[ Sponsor ] Full saved contact object:', savedContact);
      
      // Add any associated Action Items
      if (actionItems && actionItems.length > 0) {
        console.log('Adding Action Items with contact ID:', savedContact.id);
        
        // Ensure we have a valid contactId before proceeding
        if (!savedContact.id) {
          console.error('Cannot add action items - missing contact ID');
        } else {
          for (const item of actionItems) {
            console.log('Processing action item:', item);
            
            try {
              // Use the new addActionItem function
              const savedActionItem = await sponsorDB.addActionItem(item, savedContact.id);
              console.log('Action item saved with ID:', savedActionItem.id);
            } catch (actionItemError) {
              console.error('Failed to save action item:', actionItemError);
            }
          }
        }
      }
      
      // Refresh contacts from database
      await loadSponsorContacts();
      
      // Return to main view after adding
      handleBackToMain();
    } catch (error) {
      console.error('Error adding sponsor contact:', error);
    }
  };
  
  // View contact details
  const handleViewContactDetails = (contact) => {
    console.log('[ Sponsor ] handleViewContactDetails called with contact:', contact);
    console.log('[ Sponsor ] Setting currentView to details and selectedContact to:', contact);
    setSelectedContact(contact);
    setCurrentView('details');
    console.log('[ Sponsor ] Navigation state updated - currentView: details, selectedContact set');
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
      console.log('Saving contact detail:', detail);
      
      // We need the detail ID for existing records
      if (detail.id) {
        // Update existing detail
        console.log('Updating existing detail');
        await sponsorDB.updateContactDetail(detail);
      } else {
        // Generate data for new detail
        const newDetail = {
          ...detail,
          contactId: detail.contactId,
          createdAt: new Date().toISOString()
        };
        
        console.log('Inserting new detail:', newDetail);
        await sponsorDB.addContactDetail(newDetail);
      }
      
      // Refresh details from database
      await loadSponsorContacts();
    } catch (error) {
      console.error('Error saving contact detail:', error);
    }
  };
  
  // Delete contact and its details
  const handleDeleteContact = async (contactId) => {
    try {
      console.log('Deleting contact with ID:', contactId);
      
      // Use our specialized database module
      await sponsorDB.deleteSponsorContact(contactId);
      
      // Go back to main view
      handleBackToMain();
      
      // Refresh contacts from database
      await loadSponsorContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };
  
  // Delete a specific contact detail (for todos and action items)
  const handleDeleteContactDetail = async (detailId, contactId) => {
    try {
      console.log('Deleting contact detail with ID:', detailId);
      
      // Use specialized sponsor database module
      await sponsorDB.deleteContactDetail(detailId);
      
      // Update state to remove the detail
      const existingDetails = contactDetails[contactId] || [];
      const updatedDetails = existingDetails.filter(detail => detail.id !== detailId);
      
      setContactDetails(prev => ({
        ...prev,
        [contactId]: updatedDetails
      }));
      
      console.log('Contact detail deleted successfully');
    } catch (error) {
      console.error('Error deleting contact detail:', error);
    }
  };
  
  // Add debug logging for render state
  console.log('[ Sponsor ] Render - currentView:', currentView, 'selectedContact:', selectedContact);

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
          open={true}
          userId={user ? user.id : ''}
          onSubmit={(contactData, actionItems) => handleAddContact(contactData, actionItems)}
          onClose={handleBackToMain}
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
                          <Link 
                            href={createPhoneUrl(sponsor.phone)}
                            sx={{ 
                              color: theme.palette.primary.main,
                              textDecoration: 'none',
                              '&:hover': {
                                textDecoration: 'underline'
                              }
                            }}
                          >
                            {formatPhoneNumber(sponsor.phone)}
                          </Link>
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
                          <Link 
                            href={`mailto:${sponsor.email}`}
                            sx={{ 
                              color: theme.palette.primary.main,
                              textDecoration: 'none',
                              '&:hover': {
                                textDecoration: 'underline'
                              }
                            }}
                          >
                            {sponsor.email}
                          </Link>
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