import React, { useState, useEffect, useContext } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Button, 
  List, 
  ListItem, 
  IconButton, 
  Divider,
  Card,
  CardContent 
} from '@mui/material';
import { ThemeContext } from '../contexts/ThemeContext';
import SponsorFormDialog from './SponsorFormDialog';
import SponseeFormDialog from './SponseeFormDialog';
import { formatDateForDisplay } from '../utils/dateUtils';

export default function SponsorSponsee({ user, onUpdate }) {
  const { theme } = useContext(ThemeContext);
  const darkMode = theme === 'dark';
  
  // State for sponsor and sponsees
  const [sponsor, setSponsor] = useState(null);
  const [sponsees, setSponsees] = useState([]);
  
  // Dialog states
  const [showSponsorForm, setShowSponsorForm] = useState(false);
  const [showSponseeForm, setShowSponseeForm] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState(false);
  const [editingSponseeId, setEditingSponseeId] = useState(null);
  
  // Load sponsor and sponsees data from user
  useEffect(() => {
    if (user) {
      // Load sponsor data if available
      if (user.sponsor) {
        setSponsor(user.sponsor);
      }
      
      // Load sponsees if available
      if (user.sponsees && Array.isArray(user.sponsees)) {
        setSponsees(user.sponsees);
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
  
  // Open sponsor form for editing
  const handleEditSponsor = () => {
    setEditingSponsor(true);
    setShowSponsorForm(true);
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
      {/* Sponsor Section */}
      <Typography 
        variant="h5" 
        component="h2" 
        className="mb-4"
        sx={{ color: darkMode ? '#f3f4f6' : '#1f2937', fontWeight: 'bold' }}
      >
        My Sponsor
      </Typography>
      
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
            <Typography variant="body1" sx={{ color: darkMode ? '#d1d5db' : '#4b5563', mb: 3 }}>
              You haven't added your sponsor yet.
            </Typography>
            
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => {
                setEditingSponsor(false);
                setShowSponsorForm(true);
              }}
              startIcon={<i className="fa-solid fa-plus"></i>}
            >
              Add Sponsor
            </Button>
          </Box>
        )}
      </Paper>
      
      {/* Sponsees Section */}
      <Box className="flex justify-between items-center mb-4">
        <Typography 
          variant="h5" 
          component="h2"
          sx={{ color: darkMode ? '#f3f4f6' : '#1f2937', fontWeight: 'bold' }}
        >
          My Sponsees
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => {
            setEditingSponseeId(null);
            setShowSponseeForm(true);
          }}
          startIcon={<i className="fa-solid fa-plus"></i>}
          size="small"
        >
          Add Sponsee
        </Button>
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