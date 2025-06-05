import React from 'react';
import { Paper, Typography, Box, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ContactPerson } from '../../types/ContactPerson';
import { formatDateForDisplay } from '../../utils/dateUtils';

interface PersonCardProps {
  person: ContactPerson;
  onEdit: (person: ContactPerson) => void;
  onDelete: (personId: string | number) => void;
  onAddContact: (person: ContactPerson) => void;
  contacts: any[];
}

export default function PersonCard({ person, onEdit, onDelete, onAddContact, contacts }: PersonCardProps) {
  const theme = useTheme();

  return (
    <Paper 
      elevation={0}
      sx={{ 
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[2],
        borderRadius: 2,
        p: 2,
        mb: 2,
        position: 'relative'
      }}
    >
      {/* Edit and Delete buttons */}
      <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1 }}>
        <IconButton 
          onClick={() => onEdit(person)}
          size="small"
          sx={{ color: theme.palette.primary.main }}
        >
          <i className="fa-solid fa-pen-to-square"></i>
        </IconButton>
        
        <IconButton 
          onClick={() => onDelete(person.id)}
          size="small"
          sx={{ color: theme.palette.error.main }}
        >
          <i className="fa-solid fa-trash"></i>
        </IconButton>
      </Box>

      <Typography variant="h5" sx={{ color: theme.palette.text.primary, fontWeight: 'bold', mb: 1, pr: 8 }}>
        {person.name} {person.lastName || ''}
      </Typography>
      
      <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
        Contact Information
      </Typography>

      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {person.phoneNumber && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <IconButton 
              size="small" 
              component="a" 
              href={`tel:${person.phoneNumber}`}
              sx={{ color: theme.palette.primary.main }}
            >
              <i className="fa-solid fa-phone text-sm"></i>
            </IconButton>
            <IconButton 
              size="small" 
              component="a" 
              href={`sms:${person.phoneNumber}`}
              sx={{ color: theme.palette.secondary.main }}
            >
              <i className="fa-solid fa-message text-sm"></i>
            </IconButton>
            <Typography sx={{ color: theme.palette.text.primary, ml: 1 }}>
              {person.phoneNumber}
            </Typography>
          </Box>
        )}
        
        {person.email && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <IconButton 
              size="small" 
              component="a" 
              href={`mailto:${person.email}`}
              sx={{ color: theme.palette.primary.main }}
            >
              <i className="fa-solid fa-envelope text-sm"></i>
            </IconButton>
            <Typography sx={{ color: theme.palette.text.primary, ml: 1 }}>
              {person.email}
            </Typography>
          </Box>
        )}
        
        {person.sobrietyDate && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <i className="fa-solid fa-calendar" style={{ color: theme.palette.primary.main, fontSize: '16px' }}></i>
            <Typography sx={{ color: theme.palette.text.primary, ml: 1 }}>
              Sober since: {formatDateForDisplay(person.sobrietyDate)}
            </Typography>
          </Box>
        )}
        
        {person.notes && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 'bold', mb: 1 }}>
              Notes:
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
              {person.notes}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Contacts Section */}
      <Paper 
        elevation={0}
        sx={{ 
          backgroundColor: theme.palette.background.default,
          borderRadius: 2,
          p: 2,
          mt: 2
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
            Contacts & Action Items
          </Typography>
          <IconButton 
            onClick={() => onAddContact(person)}
            size="small"
            sx={{ color: theme.palette.primary.main }}
          >
            <i className="fa-solid fa-plus"></i>
          </IconButton>
        </Box>
        
        {contacts.length === 0 ? (
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, textAlign: 'center', py: 2 }}>
            No contacts recorded yet.
          </Typography>
        ) : (
          <Box>
            {contacts.map((contact, index) => (
              <Box key={contact.id || index} sx={{ mb: 1, p: 1, bgcolor: theme.palette.background.paper, borderRadius: 1 }}>
                <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                  {contact.type}: {contact.notes || 'No notes'}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Paper>
  );
}