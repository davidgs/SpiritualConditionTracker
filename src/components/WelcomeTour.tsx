import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Fade,
  useTheme,
  Backdrop
} from '@mui/material';
import { Close as CloseIcon, ArrowBack, ArrowForward } from '@mui/icons-material';

interface TourStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: () => void;
}

interface WelcomeTourProps {
  isOpen: boolean;
  onClose: () => void;
  onStepChange?: (stepId: string) => void;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Spiritual Condition',
    description: 'Your personal recovery companion. This app helps you track your spiritual progress, manage meetings, and stay connected with your support network.',
    position: 'center'
  },
  {
    id: 'header',
    title: 'Navigation Header',
    description: 'The header shows your current page and provides quick access to settings and theme controls.',
    targetSelector: '[data-tour="header"]',
    position: 'bottom'
  },
  {
    id: 'sobriety',
    title: 'Sobriety Tracker',
    description: 'Track your continuous sobriety time. Set your sobriety date in your profile to see accurate days and years.',
    targetSelector: '[data-tour="sobriety-card"]',
    position: 'bottom'
  },
  {
    id: 'spiritual-fitness',
    title: 'Spiritual Fitness Score',
    description: 'Your spiritual fitness is calculated based on prayer, meditation, meeting attendance, and service activities. The higher the score, the stronger your spiritual condition.',
    targetSelector: '[data-tour="spiritual-fitness"]',
    position: 'bottom'
  },
  {
    id: 'activities',
    title: 'Recent Activities',
    description: 'View and filter your recent spiritual activities. Tap the plus button to log new prayers, meditation, meetings, or service.',
    targetSelector: '[data-tour="activities-section"]',
    position: 'top'
  },
  {
    id: 'bottom-nav',
    title: 'Main Navigation',
    description: 'Use the bottom navigation to access different sections of the app.',
    targetSelector: '[data-tour="bottom-nav"]',
    position: 'top'
  },
  {
    id: 'meetings-tab',
    title: 'Meetings',
    description: 'Find and manage your AA meetings. Create your schedule and track attendance.',
    targetSelector: '[data-tour="nav-meetings"]',
    position: 'top'
  },
  {
    id: 'steps-tab',
    title: 'Step Work',
    description: 'Access the 12 Steps, track your progress, and read inspirational content from the Big Book.',
    targetSelector: '[data-tour="nav-steps"]',
    position: 'top'
  },
  {
    id: 'sponsorship-tab',
    title: 'Sponsorship',
    description: 'Manage your relationships with sponsors and sponsees. Track contacts and action items.',
    targetSelector: '[data-tour="nav-sponsorship"]',
    position: 'top'
  },
  {
    id: 'profile-tab',
    title: 'Profile',
    description: 'Update your personal information, set your sobriety date, and customize app preferences.',
    targetSelector: '[data-tour="nav-profile"]',
    position: 'top'
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'You now know the basics of using Spiritual Condition. Start by setting your sobriety date in your profile, then begin logging your daily spiritual activities.',
    position: 'center'
  }
];

export default function WelcomeTour({ isOpen, onClose, onStepChange }: WelcomeTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [highlightElement, setHighlightElement] = useState<Element | null>(null);
  const theme = useTheme();
  
  const currentStep = tourSteps[currentStepIndex];
  
  useEffect(() => {
    if (isOpen && currentStep.targetSelector) {
      const element = document.querySelector(currentStep.targetSelector);
      setHighlightElement(element);
      
      // Scroll element into view
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setHighlightElement(null);
    }
    
    if (onStepChange) {
      onStepChange(currentStep.id);
    }
  }, [currentStepIndex, isOpen, currentStep, onStepChange]);

  const handleNext = () => {
    if (currentStep.action) {
      currentStep.action();
    }
    
    if (currentStepIndex < tourSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const getTooltipPosition = () => {
    if (!highlightElement || currentStep.position === 'center') {
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 2000
      };
    }

    const rect = highlightElement.getBoundingClientRect();
    const tooltipWidth = 320;
    const tooltipHeight = 200;
    const margin = 16;

    let style: React.CSSProperties = {
      position: 'fixed' as const,
      zIndex: 2000,
      maxWidth: tooltipWidth
    };

    switch (currentStep.position) {
      case 'top':
        style.top = rect.top - tooltipHeight - margin;
        style.left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
        break;
      case 'bottom':
        style.top = rect.bottom + margin;
        style.left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
        break;
      case 'left':
        style.top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        style.left = rect.left - tooltipWidth - margin;
        break;
      case 'right':
        style.top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        style.left = rect.right + margin;
        break;
    }

    // Ensure tooltip stays within viewport
    const maxLeft = window.innerWidth - tooltipWidth - margin;
    const maxTop = window.innerHeight - tooltipHeight - margin;
    
    if (typeof style.left === 'number') {
      style.left = Math.max(margin, Math.min(style.left, maxLeft));
    }
    if (typeof style.top === 'number') {
      style.top = Math.max(margin, Math.min(style.top, maxTop));
    }

    return style;
  };

  const getHighlightStyle = () => {
    if (!highlightElement) return {};

    const rect = highlightElement.getBoundingClientRect();
    return {
      position: 'fixed' as const,
      top: rect.top - 8,
      left: rect.left - 8,
      width: rect.width + 16,
      height: rect.height + 16,
      border: `3px solid ${theme.palette.primary.main}`,
      borderRadius: '8px',
      pointerEvents: 'none' as const,
      zIndex: 1999,
      boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.5)`
    };
  };

  if (!isOpen) return null;

  return (
    <>
      <Backdrop 
        open={isOpen} 
        sx={{ 
          zIndex: 1998,
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }} 
      />
      
      {highlightElement && (
        <Box sx={getHighlightStyle()} />
      )}

      <Fade in={isOpen}>
        <Paper
          elevation={8}
          sx={{
            ...getTooltipPosition(),
            p: 3,
            maxWidth: 320,
            backgroundColor: theme.palette.background.paper,
            border: `2px solid ${theme.palette.primary.main}`
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', pr: 1 }}>
              {currentStep.title}
            </Typography>
            <IconButton 
              size="small" 
              onClick={handleSkip}
              sx={{ mt: -1, mr: -1 }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.5 }}>
            {currentStep.description}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {currentStepIndex + 1} of {tourSteps.length}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              {currentStepIndex > 0 && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ArrowBack />}
                  onClick={handlePrevious}
                >
                  Back
                </Button>
              )}
              
              {currentStepIndex < tourSteps.length - 1 ? (
                <Button
                  variant="contained"
                  size="small"
                  endIcon={<ArrowForward />}
                  onClick={handleNext}
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleSkip}
                  color="success"
                >
                  Get Started
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </Fade>
    </>
  );
}