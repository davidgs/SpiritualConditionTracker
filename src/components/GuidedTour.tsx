import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface TourStep {
  target: string;
  title: string;
  content: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

interface GuidedTourProps {
  isActive: boolean;
  onClose: () => void;
}

const tourSteps: TourStep[] = [
  {
    target: '[data-tour="bottom-nav"]',
    title: 'Navigation',
    content: 'Use this navigation bar to move between different sections of the app.',
    placement: 'top'
  },
  {
    target: '[data-tour="nav-home"]',
    title: 'Dashboard',
    content: 'Your main dashboard shows your spiritual fitness score and recent activities.',
    placement: 'top'
  },
  {
    target: '[data-tour="nav-steps"]',
    title: 'Step Work',
    content: 'Track your progress through the 12 steps of recovery.',
    placement: 'top'
  }
];

function GuidedTour({ isActive, onClose }: GuidedTourProps) {
  const theme = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [targetPosition, setTargetPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });

  useEffect(() => {
    if (!isActive) return;

    const updatePosition = () => {
      const step = tourSteps[currentStep];
      const element = document.querySelector(step.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetPosition({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [isActive, currentStep]);

  if (!isActive) return null;

  const currentTourStep = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;

  const getTooltipPosition = () => {
    const placement = currentTourStep.placement;
    let top = targetPosition.top;
    let left = targetPosition.left;

    switch (placement) {
      case 'top':
        top = targetPosition.top - 120;
        left = targetPosition.left + targetPosition.width / 2 - 150;
        break;
      case 'bottom':
        top = targetPosition.top + targetPosition.height + 20;
        left = targetPosition.left + targetPosition.width / 2 - 150;
        break;
      case 'left':
        top = targetPosition.top + targetPosition.height / 2 - 60;
        left = targetPosition.left - 320;
        break;
      case 'right':
        top = targetPosition.top + targetPosition.height / 2 - 60;
        left = targetPosition.left + targetPosition.width + 20;
        break;
    }

    return { top: Math.max(10, top), left: Math.max(10, Math.min(window.innerWidth - 320, left)) };
  };

  const tooltipPosition = getTooltipPosition();

  return (
    <>
      {/* Backdrop */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9998,
        }}
        onClick={onClose}
      />

      {/* Highlight */}
      <Box
        sx={{
          position: 'fixed',
          top: targetPosition.top - 4,
          left: targetPosition.left - 4,
          width: targetPosition.width + 8,
          height: targetPosition.height + 8,
          border: '2px solid',
          borderColor: theme.palette.primary.main,
          borderRadius: 2,
          backgroundColor: 'transparent',
          zIndex: 9999,
          pointerEvents: 'none',
          boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.5)`,
        }}
      />

      {/* Tooltip */}
      <Box
        sx={{
          position: 'fixed',
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          width: 300,
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
          padding: 3,
          boxShadow: theme.shadows[8],
          zIndex: 10000,
        }}
      >
        <Typography variant="h6" gutterBottom>
          {currentTourStep.title}
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {currentTourStep.content}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {currentStep + 1} of {tourSteps.length}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" onClick={onClose}>
              Skip
            </Button>
            {currentStep > 0 && (
              <Button 
                size="small" 
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Back
              </Button>
            )}
            <Button 
              size="small" 
              variant="contained" 
              onClick={() => {
                if (isLastStep) {
                  onClose();
                } else {
                  setCurrentStep(currentStep + 1);
                }
              }}
            >
              {isLastStep ? 'Finish' : 'Next'}
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default GuidedTour;