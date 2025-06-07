/**
 * Loading Screen Component
 * Shows database initialization status
 */

import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { DatabaseStatus } from '../services/DatabaseService';

interface LoadingScreenProps {
  status: DatabaseStatus;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ status }) => {
  const getStatusMessage = (status: DatabaseStatus): string => {
    switch (status) {
      case 'initializing':
        return 'Initializing database...';
      case 'ready':
        return 'Database ready';
      case 'fallback':
        return 'Using fallback storage';
      case 'error':
        return 'Database error occurred';
      default:
        return 'Loading...';
    }
  };

  const getStatusColor = (status: DatabaseStatus): string => {
    switch (status) {
      case 'ready':
        return '#4caf50';
      case 'fallback':
        return '#ff9800';
      case 'error':
        return '#f44336';
      default:
        return '#3b82f6';
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      backgroundColor="#1a1a1a"
      color="#ffffff"
      padding={3}
    >
      <CircularProgress 
        size={60} 
        style={{ color: getStatusColor(status), marginBottom: '24px' }}
      />
      
      <Typography 
        variant="h6" 
        gutterBottom
        style={{ color: getStatusColor(status) }}
      >
        {getStatusMessage(status)}
      </Typography>
      
      <Typography 
        variant="body2" 
        color="textSecondary"
        textAlign="center"
        style={{ maxWidth: '300px' }}
      >
        Setting up your recovery tracking app
      </Typography>
    </Box>
  );
};

export default LoadingScreen;