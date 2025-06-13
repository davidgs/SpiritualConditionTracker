import React, { useState, useMemo } from 'react';
import { Box, Paper, Typography, IconButton, Divider, TextField, Chip, InputAdornment, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ContactPerson } from '../../types/ContactPerson';
import { formatDateForDisplay } from '../../utils/dateUtils';
import ActivityList from '../ActivityList';

interface PersonPageProps {
  person: ContactPerson;
  personType: 'sponsor' | 'sponsee';
  contacts: any[];
  actionItems: any[];
  onAddContact: (person: ContactPerson) => void;
  onEditPerson: (person: ContactPerson) => void;
  onDeletePerson: (personId: string | number) => void;
  onEditContact?: (contact: any) => void;
  onToggleActionItem?: (actionItem: any) => void;
  renderContactCard?: (contact: any, index: number) => React.ReactNode;
}

export default function PersonPage({
  person,
  personType,
  contacts,
  actionItems,
  onAddContact,
  onEditPerson,
  onDeletePerson,
  onEditContact,
  onToggleActionItem,
  renderContactCard
}: PersonPageProps) {
  const theme = useTheme();
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContactType, setSelectedContactType] = useState<string | null>(null);

  // Get unique contact types for filtering
  const contactTypes = useMemo(() => {
    const types = new Set(contacts.map(contact => contact.type).filter(Boolean));
    return Array.from(types);
  }, [contacts]);

  // Filter contacts based on search term and selected type
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const matchesSearch = !searchTerm || 
        (contact.note && contact.note.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (contact.topic && contact.topic.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (contact.type && contact.type.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = !selectedContactType || contact.type === selectedContactType;
      
      return matchesSearch && matchesType;
    });
  }, [contacts, searchTerm, selectedContactType]);



  return (
    <Box>
      {/* Header with Edit and Delete buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
          {person.name} {person.lastName || ''}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            color="primary"
            size="small"
            onClick={() => onEditPerson(person)}
            sx={{ color: theme.palette.primary.main }}
          >
            <i className="fa-solid fa-pen-to-square"></i>
          </IconButton>
          
          <IconButton
            color="error"
            size="small"
            onClick={() => onDeletePerson(person.id)}
            sx={{ color: theme.palette.error.main }}
          >
            <i className="fa-solid fa-trash"></i>
          </IconButton>
        </Box>
      </Box>

      {/* Person Information Card */}
      <Paper 
        elevation={0}
        sx={{ 
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.shadows[2],
          borderRadius: 2,
          p: 3,
          mb: 3
        }}
      >
        <Typography variant="h6" sx={{ color: theme.palette.text.primary, mb: 2, fontWeight: 'bold' }}>
          Contact Information
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {person.phoneNumber && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton 
                  size="small" 
                  component="a" 
                  href={`tel:${person.phoneNumber}`}
                  sx={{ color: theme.palette.primary.main }}
                >
                  <i className="fa-solid fa-phone"></i>
                </IconButton>
                <IconButton 
                  size="small" 
                  component="a" 
                  href={`sms:${person.phoneNumber}`}
                  sx={{ color: theme.palette.secondary.main }}
                >
                  <i className="fa-solid fa-message"></i>
                </IconButton>
              </Box>
              <Typography sx={{ color: theme.palette.text.primary }}>
                {person.phoneNumber}
              </Typography>
            </Box>
          )}
          
          {person.email && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton 
                size="small" 
                component="a" 
                href={`mailto:${person.email}`}
                sx={{ color: theme.palette.primary.main }}
              >
                <i className="fa-solid fa-envelope"></i>
              </IconButton>
              <Typography sx={{ color: theme.palette.text.primary }}>
                {person.email}
              </Typography>
            </Box>
          )}

          {person.sobrietyDate && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton 
                size="small" 
                sx={{ color: theme.palette.primary.main }}
              >
                <i className="fa-solid fa-calendar"></i>
              </IconButton>
              <Typography sx={{ color: theme.palette.text.primary }}>
                Sobriety Date: {formatDateForDisplay(person.sobrietyDate)}
              </Typography>
            </Box>
          )}

          {person.notes && (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <IconButton 
                size="small" 
                sx={{ color: theme.palette.primary.main }}
              >
                <i className="fa-solid fa-sticky-note"></i>
              </IconButton>
              <Typography sx={{ color: theme.palette.text.primary }}>
                {person.notes}
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Contact History Section */}
      <Paper 
        elevation={0}
        sx={{ 
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.shadows[2],
          borderRadius: 2,
          p: 3,
          mb: 3
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
            Contact History ({filteredContacts.length})
          </Typography>
          <IconButton
            color="primary"
            size="small"
            onClick={() => onAddContact(person)}
          >
            <i className="fa-solid fa-plus"></i>
          </IconButton>
        </Box>

        {/* Search and Filter Controls in Accordion */}
        {contacts.length > 0 && (
          <Accordion 
            sx={{ 
              mb: 2,
              '&:before': { display: 'none' },
              boxShadow: 'none',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '8px !important',
              '&.Mui-expanded': {
                margin: '0 0 16px 0'
              }
            }}
          >
            <AccordionSummary
              expandIcon={<i className="fa-solid fa-chevron-down" style={{ fontSize: '12px', color: theme.palette.text.secondary }}></i>}
              sx={{
                minHeight: 'unset',
                '&.Mui-expanded': {
                  minHeight: 'unset'
                },
                '& .MuiAccordionSummary-content': {
                  margin: '8px 0',
                  '&.Mui-expanded': {
                    margin: '8px 0'
                  }
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className="fa-solid fa-filter" style={{ color: theme.palette.text.secondary, fontSize: '14px' }}></i>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Search & Filter Contacts
                  {(searchTerm || selectedContactType) && (
                    <span style={{ color: theme.palette.primary.main, marginLeft: '8px' }}>
                      (Active)
                    </span>
                  )}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              {/* Search Field - Full Width */}
              <TextField
                fullWidth
                size="medium"
                placeholder="Search contacts by notes, topic, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <i className="fa-solid fa-search" style={{ color: theme.palette.text.secondary, fontSize: '16px' }}></i>
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setSearchTerm('')}
                        sx={{ color: theme.palette.text.secondary }}
                      >
                        <i className="fa-solid fa-times" style={{ fontSize: '14px' }}></i>
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    fontSize: '16px'
                  }
                }}
              />

              {/* Contact Type Filter Chips */}
              {contactTypes.length > 0 && (
                <Box>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                    Filter by contact type:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip
                      label="All Types"
                      size="small"
                      variant={selectedContactType === null ? "filled" : "outlined"}
                      onClick={() => setSelectedContactType(null)}
                      sx={{
                        backgroundColor: selectedContactType === null ? theme.palette.primary.main : 'transparent',
                        color: selectedContactType === null ? theme.palette.primary.contrastText : theme.palette.text.secondary,
                        '&:hover': {
                          backgroundColor: selectedContactType === null ? theme.palette.primary.dark : theme.palette.action.hover
                        }
                      }}
                    />
                    {contactTypes.map((type) => (
                      <Chip
                        key={type}
                        label={type.charAt(0).toUpperCase() + type.slice(1)}
                        size="small"
                        variant={selectedContactType === type ? "filled" : "outlined"}
                        onClick={() => setSelectedContactType(selectedContactType === type ? null : type)}
                        sx={{
                          backgroundColor: selectedContactType === type ? theme.palette.primary.main : 'transparent',
                          color: selectedContactType === type ? theme.palette.primary.contrastText : theme.palette.text.secondary,
                          '&:hover': {
                            backgroundColor: selectedContactType === type ? theme.palette.primary.dark : theme.palette.action.hover
                          }
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        )}

        {contacts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              No contact history with {person.name} yet.
            </Typography>
          </Box>
        ) : filteredContacts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              No contacts match your search criteria.
            </Typography>
            {(searchTerm || selectedContactType) && (
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 1, display: 'block' }}>
                Try adjusting your search or filter options.
              </Typography>
            )}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {filteredContacts
              .slice()
              .sort((a, b) => {
                const dateA = new Date(a.date || a.createdAt || 0);
                const dateB = new Date(b.date || b.createdAt || 0);
                return dateB.getTime() - dateA.getTime(); // Newest first
              })
              .map((contact, index) => (
              <Box key={contact.id || index}>
                {renderContactCard ? renderContactCard(contact, index) : (
                  <Box sx={{ p: 2, bgcolor: theme.palette.background.default, borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                      {contact.note || contact.notes}
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      {formatDateForDisplay(contact.date)} - {contact.type}
                    </Typography>
                  </Box>
                )}
                {index < filteredContacts.length - 1 && <Divider sx={{ my: 1 }} />}
              </Box>
            ))}
          </Box>
        )}
      </Paper>

      {/* Action Items Section - Only for sponsors */}
      {personType === 'sponsor' && actionItems && actionItems.length > 0 && (
        <Paper 
          elevation={0}
          sx={{ 
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[2],
            borderRadius: 2,
            p: 3,
            mb: 3
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
              Action Items ({actionItems.filter(item => item.type === 'action-item').length})
            </Typography>
          </Box>

          <ActivityList 
            activities={actionItems.filter(item => item.type === 'action-item')}
            darkMode={false}
            limit={null}
            filter="action-item"
            showDate={true}
            onActivityClick={(activity, actionType) => {
              if (actionType === 'toggle-complete' && onToggleActionItem) {
                onToggleActionItem(activity);
              } else if (actionType === 'delete' && onToggleActionItem) {
                // Handle delete by marking as deleted or calling appropriate handler
                onToggleActionItem({ ...activity, deleted: true });
              }
            }}
            meetings={[]}
          />
        </Paper>
      )}

    </Box>
  );
}