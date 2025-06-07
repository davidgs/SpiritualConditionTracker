import React from 'react';
import {
  Paper,
  Box,
  Typography,
  IconButton
} from '@mui/material';

interface Person {
  id: number;
  name: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  notes?: string;
}

interface PersonCardProps {
  person: Person;
  theme: any;
  title: string;
  onEdit: (person: Person) => void;
  onDelete: (id: number) => void;
  children?: React.ReactNode;
}

export const PersonCard: React.FC<PersonCardProps> = ({
  person,
  theme,
  title,
  onEdit,
  onDelete,
  children
}) => {
  return (
    <Paper 
      elevation={2} 
      sx={{
        p: 3,
        mb: 3,
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        mb: 2 
      }}>
        <Box>
          <Typography variant="h5" sx={{ color: theme.palette.text.primary, fontWeight: 600, mb: 1 }}>
            {person.name} {person.lastName || ''}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: theme.palette.primary.main, mb: 2 }}>
            {title}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton 
            onClick={() => onEdit(person)}
            sx={{ 
              color: theme.palette.text.secondary,
              '&:hover': {
                color: theme.palette.primary.main,
              }
            }}
          >
            <i className="fa-solid fa-edit"></i>
          </IconButton>
          <IconButton 
            onClick={() => onDelete(person.id)}
            sx={{ 
              color: theme.palette.text.secondary,
              '&:hover': {
                color: theme.palette.error.main,
              }
            }}
          >
            <i className="fa-solid fa-trash"></i>
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        {person.phoneNumber && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <i className="fa-solid fa-phone" style={{ color: theme.palette.text.secondary, fontSize: '14px' }}></i>
            <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
              {person.phoneNumber}
            </Typography>
          </Box>
        )}
        
        {person.email && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <i className="fa-solid fa-envelope" style={{ color: theme.palette.text.secondary, fontSize: '14px' }}></i>
            <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
              {person.email}
            </Typography>
          </Box>
        )}
      </Box>

      {children}
    </Paper>
  );
};