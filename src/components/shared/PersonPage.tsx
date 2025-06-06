import React from 'react';
import { Box, Paper, Typography, IconButton, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ContactPerson } from '../../types/ContactPerson';
import { formatDateForDisplay } from '../../utils/dateUtils';

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

  const getPersonActionItems = () => {
    const foreignKey = personType === 'sponsor' ? 'sponsorId' : 'sponseeId';
    return actionItems.filter(item => item[foreignKey] === person.id);
  };

  const personActionItems = getPersonActionItems();

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
            Contact History
          </Typography>
          <IconButton
            color="primary"
            size="small"
            onClick={() => onAddContact(person)}
            sx={{ 
              border: `1px solid ${theme.palette.primary.main}`,
              borderRadius: 1
            }}
          >
            <i className="fa-solid fa-plus"></i>
          </IconButton>
        </Box>

        {contacts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              No contact history with {person.name} yet.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {contacts.map((contact, index) => (
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
                {index < contacts.length - 1 && <Divider sx={{ my: 1 }} />}
              </Box>
            ))}
          </Box>
        )}
      </Paper>

      {/* Action Items Section */}
      <Paper 
        elevation={0}
        sx={{ 
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.shadows[2],
          borderRadius: 2,
          p: 3
        }}
      >
        <Typography variant="h6" sx={{ color: theme.palette.text.primary, mb: 2, fontWeight: 'bold' }}>
          Action Items
        </Typography>

        {personActionItems.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              No action items for {person.name} yet.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {personActionItems.map((actionItem, index) => (
              <Box 
                key={actionItem.id || index}
                sx={{ 
                  p: 1.5, 
                  bgcolor: theme.palette.background.default, 
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                {onToggleActionItem && (
                  <IconButton
                    size="small"
                    onClick={() => onToggleActionItem(actionItem)}
                    sx={{ color: actionItem.completed ? theme.palette.success.main : theme.palette.text.secondary }}
                  >
                    <i className={actionItem.completed ? "fa-solid fa-check-circle" : "fa-regular fa-circle"}></i>
                  </IconButton>
                )}
                <Box sx={{ flex: 1 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: theme.palette.text.primary,
                      textDecoration: actionItem.completed ? 'line-through' : 'none'
                    }}
                  >
                    {actionItem.title || actionItem.text}
                  </Typography>
                  {actionItem.notes && (
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
                      {actionItem.notes}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
}