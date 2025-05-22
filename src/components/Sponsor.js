import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Box,  
  IconButton,
  Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SponsorFormDialog from './SponsorFormDialog';
import { formatDateForDisplay } from '../utils/dateUtils';

export default function Sponsor({ user, onUpdate }) {
  const theme = useTheme();
  
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
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Alert icon when no sponsor is added - at the very top */}
      {!sponsor && (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            mb: 3,
            mt: -2 
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
        sx={{ 
          p: 2.5, 
          mb: 4, 
          borderRadius: 2,
          bgcolor: theme.palette.background.paper,
          boxShadow: theme.shadows[1]
        }}
      >
        {sponsor ? (
          <Box>
            <Box sx={{ mb: 2 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: theme.palette.text.primary, 
                  fontWeight: 'bold' 
                }}
              >
                {sponsor.name} {sponsor.lastName || ''}
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2 
            }}>
              {/* Contact Information */}
              <Box>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    color: theme.palette.text.secondary, 
                    mb: 1 
                  }}
                >
                  Contact Information
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1 }}>
                  {sponsor.phone && (
                    <Typography 
                      sx={{ 
                        color: theme.palette.text.secondary, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1 
                      }}
                    >
                      <i 
                        className="fa-solid fa-phone text-sm" 
                        style={{ color: theme.palette.text.secondary }}
                      ></i>
                      {sponsor.phone}
                    </Typography>
                  )}
                  
                  {sponsor.email && (
                    <Typography 
                      sx={{ 
                        color: theme.palette.text.secondary, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1 
                      }}
                    >
                      <i 
                        className="fa-solid fa-envelope text-sm" 
                        style={{ color: theme.palette.text.secondary }}
                      ></i>
                      {sponsor.email}
                    </Typography>
                  )}
                  
                  {sponsor.sobrietyDate && (
                    <Typography 
                      sx={{ 
                        color: theme.palette.text.secondary, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1 
                      }}
                    >
                      <i 
                        className="fa-solid fa-calendar-check text-sm" 
                        style={{ color: theme.palette.text.secondary }}
                      ></i>
                      {formatDateForDisplay(sponsor.sobrietyDate)}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
            
            {/* Notes Section */}
            {sponsor.notes && (
              <Box sx={{ mt: 2 }}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    color: theme.palette.text.secondary, 
                    mb: 1 
                  }}
                >
                  Notes
                </Typography>
                
                <Typography 
                  sx={{ 
                    color: theme.palette.text.secondary, 
                    whiteSpace: 'pre-wrap' 
                  }}
                >
                  {sponsor.notes}
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
                onClick={handleEditSponsor}
                size="small"
                sx={{ color: theme.palette.primary.main }}
              >
                <i className="fa-solid fa-pen-to-square"></i>
              </IconButton>
              
              <IconButton 
                onClick={handleDeleteSponsor}
                size="small"
                sx={{ color: theme.palette.error.main }}
              >
                <i className="fa-solid fa-trash"></i>
              </IconButton>
            </Box>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography 
              variant="body1" 
              sx={{ color: theme.palette.text.secondary }}
            >
              You haven't added your sponsor yet. An AA Sponsor is a trusted AA member who helps you stay sober and grow in recovery. It is very important that you have a sponsor and that you maintian regular contact with your sponsor.
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
    </Box>
  );
}