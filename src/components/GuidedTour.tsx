import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Portal } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface TourStep {
  title: string;
  content: string;
  target: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  action?: 'navigate' | 'highlight' | 'click';
  targetView?: string;
}

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (view: string) => void;
}

const tourSteps: TourStep[] = [
  {
    title: "Welcome to My Spiritual Condition",
    content: "This app helps you track your spiritual fitness and maintain your sobriety journey. Let's take a quick tour of the key features.",
    target: "tour-welcome",
    placement: "bottom"
  },
  {
    title: "Your Spiritual Fitness Score",
    content: "This number represents your spiritual condition based on recent activities. Higher scores indicate better spiritual health.",
    target: "spiritual-fitness-score",
    placement: "bottom"
  },
  {
    title: "Log Activity Button",
    content: "Tap here to record spiritual activities like prayer, meditation, step work, or service. Each activity improves your spiritual fitness.",
    target: "log-activity-btn",
    placement: "top"
  },
  {
    title: "Bottom Navigation",
    content: "Use these tabs to navigate between different sections of the app.",
    target: "bottom-nav",
    placement: "top"
  },
  {
    title: "Meetings Section",
    content: "Let's check out the meetings section where you can track AA meetings.",
    target: "nav-meetings",
    placement: "top",
    action: "navigate",
    targetView: "meetings"
  },
  {
    title: "Add Meeting",
    content: "Tap the plus button to add new meetings to your schedule.",
    target: "add-meeting-btn",
    placement: "bottom"
  },
  {
    title: "Profile Section",
    content: "Now let's visit your profile to manage personal information and connections.",
    target: "nav-profile",
    placement: "top",
    action: "navigate",
    targetView: "profile"
  },
  {
    title: "Edit Profile",
    content: "Update your sobriety date, contact information, and connect with sponsors here.",
    target: "edit-profile-btn",
    placement: "bottom"
  },
  {
    title: "Tour Complete",
    content: "You're all set! Start by logging your first activity or adding a meeting. Your spiritual fitness will improve as you stay consistent.",
    target: "nav-dashboard",
    placement: "top",
    action: "navigate",
    targetView: "dashboard"
  }
];

function GuidedTour({ isOpen, onClose, onNavigate }: GuidedTourProps) {
  const theme = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const currentTourStep = tourSteps[currentStep];

  // Find and highlight target element
  useEffect(() => {
    if (!isOpen) return;

    const findAndHighlightElement = () => {
      const targetElement = document.querySelector(`[data-tour="${currentTourStep.target}"]`);
      if (targetElement) {
        setHighlightedElement(targetElement);
        
        // Calculate tooltip position
        const rect = targetElement.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        let top = rect.top + scrollTop;
        let left = rect.left + scrollLeft;
        
        // Adjust position based on placement
        switch (currentTourStep.placement) {
          case 'bottom':
            top = rect.bottom + scrollTop + 10;
            left = rect.left + scrollLeft + (rect.width / 2) - 150;
            break;
          case 'top':
            top = rect.top + scrollTop - 10;
            left = rect.left + scrollLeft + (rect.width / 2) - 150;
            break;
          case 'right':
            top = rect.top + scrollTop + (rect.height / 2) - 75;
            left = rect.right + scrollLeft + 10;
            break;
          case 'left':
            top = rect.top + scrollTop + (rect.height / 2) - 75;
            left = rect.left + scrollLeft - 310;
            break;
          default:
            top = rect.bottom + scrollTop + 10;
            left = rect.left + scrollLeft + (rect.width / 2) - 150;
        }
        
        // Keep tooltip within viewport
        left = Math.max(10, Math.min(left, window.innerWidth - 320));
        top = Math.max(10, top);
        
        setTooltipPosition({ top, left });
      }
    };

    // Wait a bit for DOM to update if navigation occurred
    const timeout = setTimeout(findAndHighlightElement, 100);
    return () => clearTimeout(timeout);
  }, [currentStep, isOpen, currentTourStep]);

  const handleNext = () => {
    const step = tourSteps[currentStep];
    
    // Handle navigation if specified
    if (step.action === 'navigate' && step.targetView && onNavigate) {
      onNavigate(step.targetView);
    }
    
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
    setHighlightedElement(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Portal>
      {/* Overlay */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9998,
          pointerEvents: 'none'
        }}
      />
      
      {/* Highlight cutout for target element */}
      {highlightedElement && (
        <Box
          sx={{
            position: 'fixed',
            top: `${highlightedElement.getBoundingClientRect().top - 5}px`,
            left: `${highlightedElement.getBoundingClientRect().left - 5}px`,
            width: `${highlightedElement.getBoundingClientRect().width + 10}px`,
            height: `${highlightedElement.getBoundingClientRect().height + 10}px`,
            backgroundColor: 'transparent',
            border: `3px solid ${theme.palette.primary.main}`,
            borderRadius: '8px',
            boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.5)`,
            zIndex: 9999,
            pointerEvents: 'none',
            animation: 'pulse 2s infinite'
          }}
        />
      )}

      {/* Tooltip */}
      <Box
        sx={{
          position: 'fixed',
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
          width: '300px',
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
          boxShadow: theme.shadows[8],
          zIndex: 10000,
          p: 3
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          {currentTourStep.title}
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.5 }}>
          {currentTourStep.content}
        </Typography>

        {/* Progress indicator */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          {tourSteps.map((_, index) => (
            <Box
              key={index}
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: index === currentStep 
                  ? theme.palette.primary.main 
                  : theme.palette.grey[300],
                mx: 0.3
              }}
            />
          ))}
        </Box>

        <Typography variant="caption" sx={{ 
          display: 'block', 
          textAlign: 'center', 
          color: theme.palette.text.secondary,
          mb: 2 
        }}>
          Step {currentStep + 1} of {tourSteps.length}
        </Typography>

        {/* Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button onClick={handleClose} size="small" color="inherit">
            Skip
          </Button>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              onClick={handlePrevious} 
              disabled={currentStep === 0}
              variant="outlined"
              size="small"
            >
              Back
            </Button>
            <Button 
              onClick={handleNext} 
              variant="contained"
              size="small"
            >
              {currentStep === tourSteps.length - 1 ? 'Done' : 'Next'}
            </Button>
          </Box>
        </Box>
      </Box>

      {/* CSS for pulse animation */}
      <style>
        {`
          @keyframes pulse {
            0% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 0 0 ${theme.palette.primary.main}40; }
            70% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 0 10px ${theme.palette.primary.main}00; }
            100% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 0 0 ${theme.palette.primary.main}00; }
          }
        `}
      </style>
    </Portal>
  );
}

export default GuidedTour;