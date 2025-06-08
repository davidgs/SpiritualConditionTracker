import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

function FloatingTourButton() {
  const theme = useTheme();
  const [showTour, setShowTour] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const tourSteps = [
    {
      message: "Welcome! This is your spiritual condition dashboard.",
      position: { top: '20%', left: '50%' }
    },
    {
      message: "Use the bottom navigation to explore different sections.",
      position: { bottom: '20%', left: '50%' }
    }
  ];

  if (!showTour) {
    return (
      <Button
        onClick={() => setShowTour(true)}
        sx={{
          position: 'fixed',
          bottom: '100px',
          right: '20px',
          zIndex: 2000,
          backgroundColor: theme.palette.primary.main,
          color: 'white',
          borderRadius: '50%',
          minWidth: '50px',
          height: '50px',
          '&:hover': {
            backgroundColor: theme.palette.primary.dark,
          }
        }}
      >
        ?
      </Button>
    );
  }

  const currentTourStep = tourSteps[currentStep];

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1999,
        }}
      />
      
      <Box
        sx={{
          position: 'fixed',
          ...currentTourStep.position,
          transform: 'translate(-50%, -50%)',
          backgroundColor: theme.palette.background.paper,
          padding: 3,
          borderRadius: 2,
          boxShadow: theme.shadows[8],
          zIndex: 2000,
          maxWidth: '300px',
        }}
      >
        <Typography variant="body1" sx={{ mb: 2 }}>
          {currentTourStep.message}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button 
            size="small" 
            onClick={() => setShowTour(false)}
          >
            Skip
          </Button>
          <Button 
            size="small" 
            variant="contained"
            onClick={() => {
              if (currentStep < tourSteps.length - 1) {
                setCurrentStep(currentStep + 1);
              } else {
                setShowTour(false);
                setCurrentStep(0);
              }
            }}
          >
            {currentStep < tourSteps.length - 1 ? 'Next' : 'Done'}
          </Button>
        </Box>
      </Box>
    </>
  );
}

export default FloatingTourButton;