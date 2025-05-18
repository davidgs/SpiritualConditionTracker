import React, { useContext } from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { ThemeContext } from '../contexts/ThemeContext';

export default function StepWork({ setCurrentView }) {
  const { theme } = useContext(ThemeContext);
  const darkMode = theme === 'dark';
  
  return (
    <div className="p-4 md:p-6">
      <Paper 
        elevation={0}
        className="p-6 rounded-lg"
        sx={{ 
          backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          boxShadow: darkMode ? '0 4px 12px rgba(0, 0, 0, 0.25)' : '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Box className="text-center py-12">
          <i className="fa-solid fa-book-open text-5xl mb-4" style={{ color: darkMode ? '#93c5fd' : '#3b82f6' }}></i>
          
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, color: darkMode ? '#f3f4f6' : '#1f2937' }}>
            Step Work Coming Soon
          </Typography>
          
          <Typography variant="body1" sx={{ color: darkMode ? '#d1d5db' : '#4b5563', maxWidth: '600px', mx: 'auto', mb: 4 }}>
            We're working on a comprehensive step work journaling feature to help you track your progress through the 12 Steps of AA. 
            This feature will allow you to record your thoughts, insights, and personal work as you move through each step of your recovery journey.
          </Typography>
          
          <Typography variant="body2" sx={{ color: darkMode ? '#9ca3af' : '#6b7280', fontStyle: 'italic' }}>
            Check back soon for updates! This feature is currently in development.
          </Typography>
        </Box>
      </Paper>
    </div>
  );
}