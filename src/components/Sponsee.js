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
import SponseeFormDialog from './SponseeFormDialog';
import { formatDateForDisplay } from '../utils/dateUtils';

export default function Sponsee({ user, onUpdate }) {
  const theme = useTheme();
  const darkMode = theme.palette.mode === 'dark';
  
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
    <div className="p-4 md:p-6">
      {/* Sponsees Section */}
      <Box className="flex items-center mb-4">
        <Typography 
          variant="h5" 
          component="h2"
          sx={{ color: darkMode ? '#f3f4f6' : '#1f2937', fontWeight: 'bold' }}
        >
          My Sponsees
        </Typography>
        
        <IconButton 
          onClick={() => {
            setEditingSponseeId(null);
            setShowSponseeForm(true);
          }}
          size="small"
          sx={{ 
            color: theme.palette.primary.main, 
            '&:hover': { 
              backgroundColor: 'transparent' 
            },
            ml: 1, // Add margin to separate from the title
            p: 0.5  // Smaller padding to bring it closer to the title
          }}
        >
          <i className="fa-solid fa-plus"></i>
        </IconButton>
      </Box>
      
      {sponsees.length > 0 ? (
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sponsees.map(sponsee => (
            <Card 
              key={sponsee.id}
              sx={{ 
                backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                boxShadow: darkMode ? '0 4px 12px rgba(0, 0, 0, 0.25)' : '0 4px 12px rgba(0, 0, 0, 0.1)',
                borderRadius: '0.5rem'
              }}
            >
              <CardContent>
                <Box className="mb-3">
                  <Typography variant="h6" sx={{ color: darkMode ? '#f3f4f6' : '#1f2937', fontWeight: 'bold' }}>
                    {sponsee.name} {sponsee.lastName || ''}
                  </Typography>
                </Box>
                
                <Box className="grid grid-cols-1 gap-2">
                  {/* Contact Information */}
                  <Box className="grid grid-cols-1 gap-2">
                    {sponsee.phone && (
                      <Typography sx={{ color: darkMode ? '#d1d5db' : '#4b5563', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <i className="fa-solid fa-phone text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}></i>
                        {sponsee.phone}
                      </Typography>
                    )}
                    
                    {sponsee.email && (
                      <Typography sx={{ color: darkMode ? '#d1d5db' : '#4b5563', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <i className="fa-solid fa-envelope text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}></i>
                        {sponsee.email}
                      </Typography>
                    )}
                    
                    {sponsee.sobrietyDate && (
                      <Typography sx={{ color: darkMode ? '#d1d5db' : '#4b5563', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <i className="fa-solid fa-calendar-check text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}></i>
                        {formatDateForDisplay(sponsee.sobrietyDate)}
                      </Typography>
                    )}
                  </Box>
                  
                  {/* Notes (if present) */}
                  {sponsee.notes && (
                    <Box className="mt-2">
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="caption" sx={{ color: darkMode ? '#9ca3af' : '#6b7280', display: 'block', mb: 0.5 }}>
                        Notes
                      </Typography>
                      <Typography sx={{ color: darkMode ? '#d1d5db' : '#4b5563', fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
                        {sponsee.notes}
                      </Typography>
                    </Box>
                  )}
                  
                  {/* Action Buttons */}
                  <Box className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <IconButton 
                      onClick={() => handleEditSponsee(sponsee.id)}
                      size="small"
                      sx={{ color: darkMode ? '#93c5fd' : '#3b82f6' }}
                    >
                      <i className="fa-solid fa-pen-to-square"></i>
                    </IconButton>
                    
                    <IconButton 
                      onClick={() => handleDeleteSponsee(sponsee.id)}
                      size="small"
                      sx={{ color: darkMode ? '#f87171' : '#ef4444' }}
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
          className="p-6 rounded-lg text-center"
          sx={{ 
            backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            boxShadow: darkMode ? '0 4px 12px rgba(0, 0, 0, 0.25)' : '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Typography variant="body1" sx={{ color: darkMode ? '#d1d5db' : '#4b5563' }}>
            You haven't added any sponsees yet.
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
    </div>
  );
}