import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface StepWorkProps {
  setCurrentView: (view: string) => void;
}

export default function StepWork({ setCurrentView }: StepWorkProps) {
  const theme = useTheme();
  const darkMode = theme.palette.mode === 'dark';
  
  return (
    <div className="p-4 md:p-6">
      <Paper 
        elevation={0}
        className="p-6 rounded-lg"
        sx={{ 
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.shadows[4]
        }}
      >
        <Box className="text-center py-12">
          <i className="fa-solid fa-book-open text-5xl mb-4" style={{ color: theme.palette.primary.main }}></i>
          
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, color: theme.palette.text.primary }}>
            Step Work Coming Soon
          </Typography>
          
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, maxWidth: '600px', mx: 'auto', mb: 4 }}>
            We're working on a comprehensive step work journaling feature to help you track your progress through the 12 Steps of AA. 
            This feature will allow you to record your thoughts, insights, and personal work as you move through each step of your recovery journey.
          </Typography>
          
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontStyle: 'italic', opacity: 0.8 }}>
            Check back soon for updates! This feature is currently in development.
          </Typography>
        </Box>
      </Paper>
    </div>
  );
}