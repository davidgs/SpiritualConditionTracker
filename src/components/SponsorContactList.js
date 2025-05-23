import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  IconButton, 
  Button,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { formatDateForDisplay } from '../utils/dateUtils';
// Not using UUIDs for database IDs

export default function SponsorContactList({ userId, contacts = [], onContactAdded, onViewDetails }) {
  const theme = useTheme();
  const [selectedContact, setSelectedContact] = useState(null);
  
  // Handle adding a new contact
  const handleAddContact = async (contactData) => {
    // Don't generate an ID - let SQLite do it with AUTOINCREMENT
    const newContact = {
      ...contactData,
      // No ID field - SQLite will generate it
      userId: userId,
      date: contactData.date || new Date().toISOString()
    };
    
    if (onContactAdded) {
      await onContactAdded(newContact);
    }
    
    setShowContactForm(false);
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
    <Box>
      {/* Section Header with Add Button */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2,
        mt: 4
      }}>
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
          Contact History
          <IconButton 
            onClick={() => {
              // Open Add Contact page through parent component
              onContactAdded();
            }}
            size="small"
            sx={{ 
              color: theme.palette.primary.main, 
              ml: 0.5,
              p: 0.5
            }}
          >
            <i className="fa-solid fa-plus"></i>
          </IconButton>
        </Typography>
      </Box>
      
      {/* Contact List */}
      <Paper
        elevation={0}
        sx={{ 
          p: 0, 
          mb: 4, 
          borderRadius: 2,
          bgcolor: theme.palette.background.paper,
          boxShadow: theme.shadows[1]
        }}
      >
        {contacts && contacts.length > 0 ? (
          <List sx={{ width: '100%', p: 0 }}>
            {contacts.map((contact, index) => (
              <React.Fragment key={contact.id}>
                <ListItem 
                  sx={{ 
                    px: 2.5, 
                    py: 2,
                    cursor: 'pointer',
                    '&:hover': { 
                      bgcolor: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.05)' 
                        : 'rgba(0, 0, 0, 0.02)'
                    }
                  }}
                  onClick={() => onViewDetails(contact)}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '100%'
                  }}>
                    {/* Contact Type Icon */}
                    <Box sx={{ 
                      mr: 2,
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <i className={`fa-solid ${getContactTypeIcon(contact.type)}`}></i>
                    </Box>
                    
                    {/* Contact Details */}
                    <ListItemText
                      primary={
                        <Typography 
                          variant="subtitle1" 
                          sx={{ fontWeight: 'medium' }}
                        >
                          {getContactTypeLabel(contact.type)}
                        </Typography>
                      }
                      secondary={
                        <Typography 
                          variant="body2"
                          sx={{ color: theme.palette.text.secondary }}
                        >
                          {formatDateForDisplay(contact.date)}
                          {contact.note && contact.note.length > 0 && (
                            <Box component="span" sx={{ display: 'block', mt: 0.5 }}>
                              {contact.note.length > 50 
                                ? `${contact.note.substring(0, 50)}...` 
                                : contact.note}
                            </Box>
                          )}
                        </Typography>
                      }
                    />
                    
                    {/* Details Button */}
                    <IconButton 
                      edge="end" 
                      aria-label="details"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(contact);
                      }}
                      sx={{ color: theme.palette.primary.main }}
                    >
                      <i className="fa-solid fa-chevron-right"></i>
                    </IconButton>
                  </Box>
                </ListItem>
                {index < contacts.length - 1 && (
                  <Divider component="li" sx={{ m: 0 }} />
                )}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box sx={{ py: 4, px: 2.5, textAlign: 'center' }}>
            <Typography 
              variant="body1"
              sx={{ mb: 2, color: theme.palette.text.secondary }}
            >
              No sponsor contacts recorded yet. Regular contact with your sponsor is a vital part of recovery.
            </Typography>
           
          </Box>
        )}
      </Paper>
      {/* Removed SponsorContactFormDialog - Using page-based navigation instead */}
    </Box>
  );
}