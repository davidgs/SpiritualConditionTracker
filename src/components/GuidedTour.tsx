import React, { useState } from 'react';
import { Box, Button, Typography, Dialog, DialogContent, DialogActions } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface TourStep {
  title: string;
  content: string;
  target?: string;
}

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
}

const tourSteps: TourStep[] = [
  {
    title: "Welcome to My Spiritual Condition",
    content: "This app helps you track your spiritual fitness and maintain your sobriety journey. Let's take a quick tour of the key features."
  },
  {
    title: "Dashboard",
    content: "Your dashboard shows your spiritual fitness score based on your recent activities like prayer, meditation, meetings, and step work."
  },
  {
    title: "Meetings",
    content: "Track the AA meetings you attend. You can add meetings, check in when you attend, and manage your meeting schedule."
  },
  {
    title: "Profile", 
    content: "Manage your personal information, sobriety date, and connect with sponsors and sponsees."
  },
  {
    title: "Sponsor/Sponsee",
    content: "Connect with your sponsor or manage your sponsees. Share action items, track progress, and maintain accountability."
  },
  {
    title: "Getting Started",
    content: "Start by setting up your profile, adding your regular meetings, and begin logging your daily spiritual activities. Your spiritual fitness will improve as you stay consistent!"
  }
];

function GuidedTour({ isOpen, onClose }: GuidedTourProps) {
  const theme = useTheme();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    onClose();
  };

  const currentTourStep = tourSteps[currentStep];

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
          margin: 2
        }
      }}
    >
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            {currentTourStep.title}
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
            {currentTourStep.content}
          </Typography>
        </Box>

        {/* Progress indicator */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          {tourSteps.map((_, index) => (
            <Box
              key={index}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: index === currentStep 
                  ? theme.palette.primary.main 
                  : theme.palette.grey[300],
                mx: 0.5
              }}
            />
          ))}
        </Box>

        <Typography variant="body2" sx={{ textAlign: 'center', color: theme.palette.text.secondary }}>
          Step {currentStep + 1} of {tourSteps.length}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button onClick={handleClose} color="inherit">
          Skip Tour
        </Button>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            onClick={handlePrevious} 
            disabled={currentStep === 0}
            variant="outlined"
            size="small"
          >
            Previous
          </Button>
          <Button 
            onClick={handleNext} 
            variant="contained"
            size="small"
          >
            {currentStep === tourSteps.length - 1 ? 'Get Started' : 'Next'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default GuidedTour;