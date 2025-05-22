import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Button, 
  IconButton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SponsorFormDialog from './SponsorFormDialog';
import { formatDateForDisplay } from '../utils/dateUtils';

export default function Sponsor({ user, onUpdate }) {
  const theme = useTheme();
  const darkMode = theme.palette.mode === 'dark';
  
  // State for sponsor
  const [sponsor, setSponsor] = useState(null);
  
  // Dialog states
  const [showSponsorForm, setShowSponsorForm] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState(false);
  
  // Load sponsor data from user
  useEffect(() => {
    if (user) {
      // Load sponsor data if available
      if (user.sponsor) {
        setSponsor(user.sponsor);
      }
    }
  }, [user]);
  
  // Handle sponsor form submission
  const handleSponsorSubmit = (sponsorData) => {
    // Create a copy of the current user data
    const userUpdate = {
      sponsor: sponsorData
    };
    
    // Update user in database through parent component
    onUpdate(userUpdate, { redirectToDashboard: false });
    
    // Update local state
    setSponsor(sponsorData);
    setShowSponsorForm(false);
  };
  
  // Open sponsor form for editing
  const handleEditSponsor = () => {
    setEditingSponsor(true);
    setShowSponsorForm(true);
  };
  
  // Delete sponsor
  const handleDeleteSponsor = () => {
    // Create update to remove sponsor
    const userUpdate = {
      sponsor: null
    };
    
    // Update user in database
    onUpdate(userUpdate, { redirectToDashboard: false });
    
    // Update local state
    setSponsor(null);
  };
  
  return (
    <div className="p-4 md:p-6">
      {/* Alert icon when no sponsor is added - at the very top */}
      {!sponsor && (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            mb: 3,
            mt: -2 // Negative margin to move it closer to the top/header
          }}
        >
          <i 
            className="fa-solid fa-triangle-exclamation" 
            style={{ 
              fontSize: '3rem', 
              color: theme.palette.error.main
            }}
          ></i>
        </Box>
      )}
      
      {/* Sponsor Section with inline add button */}
      <Box className="flex items-center mb-4">
        <Typography 
          variant="h5" 
          component="h2"
          sx={{ 
            color: darkMode ? '#f3f4f6' : '#1f2937', 
            fontWeight: 'bold',
            display: 'inline-flex',
            alignItems: 'center'
          }}
        >
          My Sponsor
          <IconButton 
            onClick={() => {
              setEditingSponsor(false);
              setShowSponsorForm(true);
            }}
            size="small"
            sx={{ 
              color: theme.palette.primary.main, 
              '&:hover': { 
                backgroundColor: 'transparent' 
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

      <Paper 
        elevation={0}
        className="p-5 mb-8 rounded-lg"
        sx={{ 
          backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          boxShadow: darkMode ? '0 4px 12px rgba(0, 0, 0, 0.25)' : '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}
      >
        {sponsor ? (
          <Box>
            <Box className="mb-4">
              <Typography variant="h6" sx={{ color: darkMode ? '#f3f4f6' : '#1f2937', fontWeight: 'bold' }}>
                {sponsor.name} {sponsor.lastName || ''}
              </Typography>
            </Box>
            
            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Contact Information */}
              <Box>
                <Typography variant="subtitle2" sx={{ color: darkMode ? '#9ca3af' : '#6b7280', mb: 1 }}>
                  Contact Information
                </Typography>
                
                <Box className="grid grid-cols-1 gap-2">
                  {sponsor.phone && (
                    <Typography sx={{ color: darkMode ? '#d1d5db' : '#4b5563', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <i className="fa-solid fa-phone text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}></i>
                      {sponsor.phone}
                    </Typography>
                  )}
                  
                  {sponsor.email && (
                    <Typography sx={{ color: darkMode ? '#d1d5db' : '#4b5563', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <i className="fa-solid fa-envelope text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}></i>
                      {sponsor.email}
                    </Typography>
                  )}
                  
                  {sponsor.sobrietyDate && (
                    <Typography sx={{ color: darkMode ? '#d1d5db' : '#4b5563', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <i className="fa-solid fa-calendar-check text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}></i>
                      {formatDateForDisplay(sponsor.sobrietyDate)}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
            
            {/* Notes Section */}
            {sponsor.notes && (
              <Box className="mt-4">
                <Typography variant="subtitle2" sx={{ color: darkMode ? '#9ca3af' : '#6b7280', mb: 1 }}>
                  Notes
                </Typography>
                
                <Typography sx={{ color: darkMode ? '#d1d5db' : '#4b5563', whiteSpace: 'pre-wrap' }}>
                  {sponsor.notes}
                </Typography>
              </Box>
            )}
            
            {/* Action Buttons */}
            <Box className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <IconButton 
                onClick={handleEditSponsor}
                size="small"
                sx={{ color: darkMode ? '#93c5fd' : '#3b82f6' }}
              >
                <i className="fa-solid fa-pen-to-square"></i>
              </IconButton>
              
              <IconButton 
                onClick={handleDeleteSponsor}
                size="small"
                sx={{ color: darkMode ? '#f87171' : '#ef4444' }}
              >
                <i className="fa-solid fa-trash"></i>
              </IconButton>
            </Box>
          </Box>
        ) : (
          <Box className="text-center py-6">
            <Typography variant="body1" sx={{ color: darkMode ? '#d1d5db' : '#4b5563' }}>
              You haven't added your sponsor yet.
            </Typography>
          </Box>
        )}
      </Paper>
      
      {/* Sponsor Form Dialog */}
      <SponsorFormDialog 
        open={showSponsorForm} 
        onClose={() => {
          setShowSponsorForm(false);
          setEditingSponsor(false);
        }}
        onSubmit={handleSponsorSubmit}
        initialData={editingSponsor ? sponsor : null}
      />
    </div>
  );
}