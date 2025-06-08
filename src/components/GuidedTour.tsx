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
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number; placement: string }>({ top: 0, left: 0, placement: 'bottom' });

  const currentTourStep = tourSteps[currentStep];

  // Find and highlight target element
  useEffect(() => {
    if (!isOpen) return;

    const findAndHighlightElement = () => {
      const targetElement = document.querySelector(`[data-tour="${currentTourStep.target}"]`);
      if (targetElement) {
        setHighlightedElement(targetElement);
        
        // Calculate tooltip position with better viewport awareness
        const rect = targetElement.getBoundingClientRect();
        const tooltipWidth = 280;
        const tooltipHeight = 150; // Approximate height
        const arrowSize = 8;
        const padding = 12;
        
        let top = 0;
        let left = 0;
        let actualPlacement = currentTourStep.placement || 'bottom';
        
        // Smart placement based on available space
        const spaceAbove = rect.top;
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceLeft = rect.left;
        const spaceRight = window.innerWidth - rect.right;
        
        // Auto-adjust placement if there's not enough space
        if (actualPlacement === 'bottom' && spaceBelow < tooltipHeight + padding) {
          if (spaceAbove > tooltipHeight + padding) {
            actualPlacement = 'top';
          } else if (spaceRight > tooltipWidth + padding) {
            actualPlacement = 'right';
          } else if (spaceLeft > tooltipWidth + padding) {
            actualPlacement = 'left';
          }
        } else if (actualPlacement === 'top' && spaceAbove < tooltipHeight + padding) {
          if (spaceBelow > tooltipHeight + padding) {
            actualPlacement = 'bottom';
          } else if (spaceRight > tooltipWidth + padding) {
            actualPlacement = 'right';
          } else if (spaceLeft > tooltipWidth + padding) {
            actualPlacement = 'left';
          }
        }
        
        // Position tooltip based on final placement
        switch (actualPlacement) {
          case 'bottom':
            top = rect.bottom + arrowSize + padding;
            left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
            break;
          case 'top':
            top = rect.top - tooltipHeight - arrowSize - padding;
            left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
            break;
          case 'right':
            top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
            left = rect.right + arrowSize + padding;
            break;
          case 'left':
            top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
            left = rect.left - tooltipWidth - arrowSize - padding;
            break;
        }
        
        // Ensure tooltip stays within viewport
        left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding));
        top = Math.max(padding, Math.min(top, window.innerHeight - tooltipHeight - padding));
        
        setTooltipPosition({ top, left, placement: actualPlacement });
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

      {/* Tooltip with arrow */}
      <Box
        sx={{
          position: 'fixed',
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
          width: '280px',
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
          boxShadow: theme.shadows[8],
          zIndex: 10000,
          p: 2.5,
          border: `1px solid ${theme.palette.divider}`,
          '&::before': {
            content: '""',
            position: 'absolute',
            width: 0,
            height: 0,
            borderStyle: 'solid',
            ...(tooltipPosition.placement === 'bottom' && {
              top: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
              borderWidth: '0 8px 8px 8px',
              borderColor: `transparent transparent ${theme.palette.background.paper} transparent`
            }),
            ...(tooltipPosition.placement === 'top' && {
              bottom: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
              borderWidth: '8px 8px 0 8px',
              borderColor: `${theme.palette.background.paper} transparent transparent transparent`
            }),
            ...(tooltipPosition.placement === 'right' && {
              left: '-8px',
              top: '50%',
              transform: 'translateY(-50%)',
              borderWidth: '8px 8px 8px 0',
              borderColor: `transparent ${theme.palette.background.paper} transparent transparent`
            }),
            ...(tooltipPosition.placement === 'left' && {
              right: '-8px',
              top: '50%',
              transform: 'translateY(-50%)',
              borderWidth: '8px 0 8px 8px',
              borderColor: `transparent transparent transparent ${theme.palette.background.paper}`
            })
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            width: 0,
            height: 0,
            borderStyle: 'solid',
            ...(tooltipPosition.placement === 'bottom' && {
              top: '-9px',
              left: '50%',
              transform: 'translateX(-50%)',
              borderWidth: '0 9px 9px 9px',
              borderColor: `transparent transparent ${theme.palette.divider} transparent`
            }),
            ...(tooltipPosition.placement === 'top' && {
              bottom: '-9px',
              left: '50%',
              transform: 'translateX(-50%)',
              borderWidth: '9px 9px 0 9px',
              borderColor: `${theme.palette.divider} transparent transparent transparent`
            }),
            ...(tooltipPosition.placement === 'right' && {
              left: '-9px',
              top: '50%',
              transform: 'translateY(-50%)',
              borderWidth: '9px 9px 9px 0',
              borderColor: `transparent ${theme.palette.divider} transparent transparent`
            }),
            ...(tooltipPosition.placement === 'left' && {
              right: '-9px',
              top: '50%',
              transform: 'translateY(-50%)',
              borderWidth: '9px 0 9px 9px',
              borderColor: `transparent transparent transparent ${theme.palette.divider}`
            })
          }
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