import React from 'react';
import {
  ListItem,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import { ActionItemsList } from './ActionItemsList';
import { formatDateForDisplay } from '../utils/dateUtils';

interface Contact {
  id: number;
  name: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  notes?: string;
  type: string;
  date: string;
  duration?: number;
}

interface ContactCardProps {
  contact: Contact;
  theme: any;
  refreshKey: number;
  onContactClick: (contact: Contact) => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  theme,
  refreshKey,
  onContactClick
}) => {
  return (
    <ListItem 
      key={contact.id}
      sx={{
        flexDirection: 'column',
        alignItems: 'stretch',
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        mb: 2,
        border: `1px solid ${theme.palette.divider}`,
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        }
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        width: '100%',
        p: 2 
      }}>
        <Box sx={{ flex: 1 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: theme.palette.text.primary,
              fontWeight: 600,
              mb: 1 
            }}
          >
            {contact.name} {contact.lastName || ''}
          </Typography>
          
          <Typography 
            variant="body2" 
            sx={{ 
              color: theme.palette.text.secondary,
              mb: 0.5 
            }}
          >
            {formatDateForDisplay(contact.date)}
          </Typography>
          
          {contact.type && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: theme.palette.primary.main,
                textTransform: 'capitalize',
                mb: 0.5 
              }}
            >
              Type: {contact.type}
            </Typography>
          )}
          
          {contact.phoneNumber && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: theme.palette.text.secondary,
                mb: 0.5 
              }}
            >
              Phone: {contact.phoneNumber}
            </Typography>
          )}
          
          {contact.email && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: theme.palette.text.secondary,
                mb: 0.5 
              }}
            >
              Email: {contact.email}
            </Typography>
          )}
          
          {contact.notes && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: theme.palette.text.secondary,
                fontStyle: 'italic',
                mb: 0.5 
              }}
            >
              Notes: {contact.notes}
            </Typography>
          )}
          
          {contact.duration && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: theme.palette.text.secondary 
              }}
            >
              Duration: {contact.duration} minutes
            </Typography>
          )}
          
          {/* Action Items for this contact */}
          <ActionItemsList 
            contactId={contact.id}
            theme={theme}
            refreshKey={refreshKey}
          />
        </Box>
        
        <IconButton 
          onClick={(e) => {
            e.stopPropagation();
            onContactClick(contact);
          }}
          sx={{ 
            color: theme.palette.text.secondary,
            '&:hover': {
              color: theme.palette.primary.main,
            }
          }}
        >
          <i className="fa-solid fa-edit"></i>
        </IconButton>
      </Box>
    </ListItem>
  );
};