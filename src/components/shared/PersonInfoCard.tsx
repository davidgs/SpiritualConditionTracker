import React from 'react';
import { Paper, Typography, Box, Button, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ContactPerson } from '../../types/ContactPerson';
import { formatDateForDisplay } from '../../utils/dateUtils';

interface PersonInfoCardProps {
  person: ContactPerson;
  contacts: any[];
  onAddContact: (person: ContactPerson) => void;
  onEditContact?: (contact: any) => void;
  renderContactCard?: (contact: any, index: number) => React.ReactNode;
}

export default function PersonInfoCard({ 
  person, 
  contacts, 
  onAddContact,
  onEditContact,
  renderContactCard 
}: PersonInfoCardProps) {
  const theme = useTheme();

  return (
    <Box>
      {/* Person Info Section */}
      <Paper 
        elevation={0}
        sx={{ 
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.shadows[2],
          borderRadius: 2,
          p: 2,
          mb: 2
        }}
      >
        <Typography variant="h5" sx={{ color: theme.palette.text.primary, fontWeight: 'bold', mb: 1 }}>
          {person.name} {person.lastName || ''}
        </Typography>
        
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
          Contact Information
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {person.phoneNumber && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
      </Paper>

      {/* Contacts Section */}
      <Paper 
        elevation={0}
        sx={{ 
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.shadows[2],
          borderRadius: 2,
          p: 2,
          mb: 2
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
            Contacts & Action Items
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            size="small"
            onClick={() => onAddContact(person)}
            startIcon={<i className="fa-solid fa-plus"></i>}
          >
            Add Contact
          </Button>
        </Box>
        
        {contacts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography sx={{ color: theme.palette.text.secondary }}>
              No contacts recorded with {person.name} yet.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {contacts.map((contact, index) => (
              <Box key={contact.id || index}>
                {renderContactCard ? renderContactCard(contact, index) : (
                  <Box sx={{ p: 2, bgcolor: theme.palette.background.default, borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                      {contact.type}: {contact.notes || 'No notes'}
                    </Typography>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
}