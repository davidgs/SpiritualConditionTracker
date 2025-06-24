import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Button, 
  IconButton,
  Divider,
  Card,
  CardContent 
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SponseeFormPage from './SponseeFormPage';
import { formatDateForDisplay } from '../utils/dateUtils';
import { User } from '../types/database';

interface SponseeProps {
  user: User | null;
  onUpdate: (updates: Partial<User>) => Promise<User | null>;
}

export default function Sponsee({ user, onUpdate }: SponseeProps) {
  const theme = useTheme();
  
  // State for sponsees
  const [sponsees, setSponsees] = useState([]);
  
  // Dialog states
  const [showSponseeForm, setShowSponseeForm] = useState(false);
  const [editingSponseeId, setEditingSponseeId] = useState(null);
  
  // Load sponsees data from user
  useEffect(() => {
    if (user) {
      // Load sponsees if available
      if (user.sponsees && Array.isArray(user.sponsees)) {
        setSponsees(user.sponsees);
      }
    }
  }, [user]);
  
  // Handle sponsee form submission
  const handleSponseeSubmit = (sponseeData) => {
    let updatedSponsees;
    
    // Check if we're editing an existing sponsee or adding a new one
    if (editingSponseeId) {
      // Update existing sponsee
      updatedSponsees = sponsees.map(sponsee => 
        sponsee.id === editingSponseeId ? { ...sponsee, ...sponseeData } : sponsee
      );
    } else {
      // Add new sponsee with generated ID
      const newSponsee = {
        ...sponseeData,
        id: `sponsee_${Date.now()}`
      };
      updatedSponsees = [...sponsees, newSponsee];
    }
    
    // Create a copy of the current user data
    const userUpdate = {
      sponsees: updatedSponsees
    };
    
    // Update user in database through parent component
    onUpdate(userUpdate, { redirectToDashboard: false });
    
    // Update local state
    setSponsees(updatedSponsees);
    setShowSponseeForm(false);
    setEditingSponseeId(null);
  };
  
  // Open sponsee form for editing
  const handleEditSponsee = (sponseeId) => {
    setEditingSponseeId(sponseeId);
    setShowSponseeForm(true);
  };
  
  // Delete a sponsee
  const handleDeleteSponsee = (sponseeId) => {
    // Filter out the sponsee with the given ID
    const updatedSponsees = sponsees.filter(sponsee => sponsee.id !== sponseeId);
    
    // Create update for user data
    const userUpdate = {
      sponsees: updatedSponsees
    };
    
    // Update user in database
    onUpdate(userUpdate, { redirectToDashboard: false });
    
    // Update local state
    setSponsees(updatedSponsees);
  };
  
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Sponsees Section */}
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
          My Sponsees
          <IconButton 
            onClick={() => {
              setEditingSponseeId(null);
              setShowSponseeForm(true);
            }}
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
      
      {sponsees.length > 0 ? (
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2
        }}>
          {sponsees.map(sponsee => (
            <Card 
              key={sponsee.id}
              sx={{ 
                bgcolor: theme.palette.background.paper,
                boxShadow: theme.shadows[1],
                borderRadius: 2
              }}
            >
              <CardContent>
                <Box sx={{ mb: 2 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: theme.palette.text.primary, 
                      fontWeight: 'bold' 
                    }}
                  >
                    {sponsee.name} {sponsee.lastName || ''}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1 }}>
                  {/* Contact Information */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1 }}>
                    {sponsee.phone && (
                      <Typography 
                        sx={{ 
                          color: theme.palette.text.secondary, 
                          fontSize: '0.875rem', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1 
                        }}
                      >
                        <i 
                          className="fa-solid fa-phone text-sm" 
                          style={{ color: theme.palette.text.secondary }}
                        ></i>
                        {sponsee.phone}
                      </Typography>
                    )}
                    
                    {sponsee.email && (
                      <Typography 
                        sx={{ 
                          color: theme.palette.text.secondary, 
                          fontSize: '0.875rem', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1 
                        }}
                      >
                        <i 
                          className="fa-solid fa-envelope text-sm" 
                          style={{ color: theme.palette.text.secondary }}
                        ></i>
                        {sponsee.email}
                      </Typography>
                    )}
                    
                    {sponsee.sobrietyDate && (
                      <Typography 
                        sx={{ 
                          color: theme.palette.text.secondary, 
                          fontSize: '0.875rem', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1 
                        }}
                      >
                        <i 
                          className="fa-solid fa-calendar-check text-sm" 
                          style={{ color: theme.palette.text.secondary }}
                        ></i>
                        {formatDateForDisplay(sponsee.sobrietyDate)}
                      </Typography>
                    )}
                  </Box>
                  
                  {/* Notes (if present) */}
                  {sponsee.notes && (
                    <Box sx={{ mt: 2 }}>
                      <Divider sx={{ my: 1 }} />
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: theme.palette.text.secondary, 
                          display: 'block', 
                          mb: 0.5 
                        }}
                      >
                        Notes
                      </Typography>
                      <Typography 
                        sx={{ 
                          color: theme.palette.text.secondary, 
                          fontSize: '0.875rem', 
                          whiteSpace: 'pre-wrap' 
                        }}
                      >
                        {sponsee.notes}
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
                      onClick={() => handleEditSponsee(sponsee.id)}
                      size="small"
                      sx={{ color: theme.palette.primary.main }}
                    >
                      <i className="fa-solid fa-pen-to-square"></i>
                    </IconButton>
                    
                    <IconButton 
                      onClick={() => handleDeleteSponsee(sponsee.id)}
                      size="small"
                      sx={{ color: theme.palette.error.main }}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            borderRadius: 2, 
            textAlign: 'center',
            bgcolor: theme.palette.background.paper,
            boxShadow: theme.shadows[1]
          }}
        >
          <Typography 
            variant="body1" 
            sx={{ color: theme.palette.text.secondary }}
          >
            You haven't added any sponsees yet. Sponsoring other members is a great way to give back to the AA community and help others stay sober, but it is also extremely important for your own sobriety. Please consider adding a sponsee to your list.
          </Typography>
        </Paper>
      )}
      
      {/* Sponsee Form Dialog */}
      <SponseeFormDialog
        open={showSponseeForm}
        onClose={() => {
          setShowSponseeForm(false);
          setEditingSponseeId(null);
        }}
        onSubmit={handleSponseeSubmit}
        initialData={editingSponseeId ? sponsees.find(s => s.id === editingSponseeId) : null}
      />
    </Box>
  );
}