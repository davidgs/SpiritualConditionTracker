import React from 'react';
import { Paper, Typography, Box, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ContactPerson } from '../../types/ContactPerson';
import { formatDateForDisplay } from '../../utils/dateUtils';

interface PersonInfoCardProps {
  person: ContactPerson;
  onEdit: () => void;
  onDelete: () => void;
}

export default function PersonInfoCard({ person, onEdit, onDelete }: PersonInfoCardProps) {
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
          onClick={onEdit}
          size="small"
          sx={{ color: theme.palette.primary.main }}
        >
          <i className="fa-solid fa-pen-to-square"></i>
        </IconButton>
        
        <IconButton 
          onClick={onDelete}
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
    </Paper>
  );
}