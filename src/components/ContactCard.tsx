import React from 'react';
import {
  ListItem,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import { ActionItemsList } from './ActionItemsList';
import { formatDateForDisplay } from '../utils/dateUtils';
import { Contact } from '../types/database';

// Contact type information helper function
const getContactTypeInfo = (type: string) => {
  switch (type) {
    case 'call':
      return { icon: 'fa-solid fa-phone', label: 'Phone Call' };
    case 'meeting':
      return { icon: 'fa-solid fa-users', label: 'Meeting' };
    case 'text':
      return { icon: 'fa-solid fa-message', label: 'Text Message' };
    case 'email':
      return { icon: 'fa-solid fa-envelope', label: 'Email' };
    default:
      return { icon: 'fa-solid fa-comment', label: 'Contact' };
  }
};



interface ContactCardProps {
  contact: Contact;
  theme: any;
  refreshKey: number;
  onContactClick: (contact: Contact) => void;
  onEditContact?: (contact: Contact) => void;
  sponsorId?: number;
  sponseeId?: number;
  personType?: 'sponsor' | 'sponsee';
}

export const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  theme,
  refreshKey,
  onContactClick,
  onEditContact,
  sponsorId,
  sponseeId,
  personType
}) => {
  const contactTypeInfo = getContactTypeInfo(contact.type);
  
  return (
    <ListItem
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
        console.log('[ContactCard.tsx] Contact clicked:', contact);
        onContactClick(contact);
      }}
    >
      <Box sx={{ width: '100%' }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          mb: 2 
        }}>
          <Box sx={{ flex: 1 }}>
            {/* Contact Type and Date Header */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 1 
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1 
              }}>
                <i className={contactTypeInfo.icon} style={{ color: theme.palette.text.secondary }}></i>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  {contactTypeInfo.label}
                </Typography>
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5 
              }}>
                <i className="fa-solid fa-calendar" style={{ color: theme.palette.text.secondary, fontSize: '12px' }}></i>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  {formatDateForDisplay(contact.date)}
                </Typography>
              </Box>
            </Box>

            {/* Topic and Duration under header */}
            {contact.topic && (
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 0.5 }}>
                Topic: {contact.topic}
              </Typography>
            )}
            
            {contact.duration && (
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                Duration: {contact.duration} minutes
              </Typography>
            )}
          </Box>

          {/* Edit button */}
          {onEditContact && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEditContact(contact);
              }}
              sx={{ 
                color: theme.palette.text.secondary,
                ml: 1,
                '&:hover': {
                  color: theme.palette.primary.main,
                  backgroundColor: theme.palette.action.hover
                }
              }}
            >
              <i className="fa-solid fa-edit"></i>
            </IconButton>
          )}
        </Box>

        {/* Notes section with label */}
        {contact.note && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 'bold', mb: 0.5 }}>
              Notes:
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.primary }}>
              {contact.note}
            </Typography>
          </Box>
        )}
        
        {/* Action Items for this contact */}
        <ActionItemsList 
          contactId={contact.id}
          theme={theme}
          refreshKey={refreshKey}
          sponsorId={sponsorId}
          sponseeId={sponseeId}
          personType={personType}
        />
      </Box>
    </ListItem>
  );
};