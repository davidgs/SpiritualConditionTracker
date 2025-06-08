import React from 'react';
import { TourProvider, useTour } from '@reactour/tour';
import { useTheme } from '@mui/material';

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (path: string) => void;
}

function TourContent({ isOpen, onClose, onNavigate }: GuidedTourProps) {
  const { setIsOpen, setCurrentStep } = useTour();

  React.useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [isOpen, setIsOpen, setCurrentStep]);

  React.useEffect(() => {
    const handleNavigate = (event: CustomEvent) => {
      if (onNavigate) {
        onNavigate(event.detail);
      }
    };

    window.addEventListener('tour-navigate', handleNavigate as EventListener);
    return () => window.removeEventListener('tour-navigate', handleNavigate as EventListener);
  }, [onNavigate]);

  return null;
}

export default function GuidedTour({ isOpen, onClose, onNavigate }: GuidedTourProps) {
  const theme = useTheme();

  const tourSteps = [
    {
      selector: '[data-tour="spiritual-fitness-score"]',
      content: 'This shows your overall spiritual health based on your daily activities like prayer, meditation, and service work.'
    },
    {
      selector: '[data-tour="sobriety-days"]',
      content: 'Track your continuous sobriety time. This updates automatically based on your sobriety date in your profile.'
    },
    {
      selector: '[data-tour="log-activity-btn"]',
      content: 'Tap here to record spiritual activities like prayer, meditation, step work, or service. Each activity improves your spiritual fitness.'
    },
    {
      selector: '[data-tour="nav-meetings"]',
      content: 'Find and track AA meetings in your area. You can save favorites and log attendance.',
      actionAfter: () => {
        const event = new CustomEvent('tour-navigate', { detail: 'meetings' });
        window.dispatchEvent(event);
      }
    },
    {
      selector: '[data-tour="nav-steps"]',
      content: 'Track your progress through the 12 steps with guided exercises and reflection prompts.',
      actionAfter: () => {
        const event = new CustomEvent('tour-navigate', { detail: 'steps' });
        window.dispatchEvent(event);
      }
    },
    {
      selector: '[data-tour="nav-sponsorship"]',
      content: 'Manage your sponsor and sponsee relationships. Connect with others in recovery.',
      actionAfter: () => {
        const event = new CustomEvent('tour-navigate', { detail: 'sponsor' });
        window.dispatchEvent(event);
      }
    },
    {
      selector: '[data-tour="nav-profile"]',
      content: 'Update your personal information, sobriety date, and app preferences.',
      actionAfter: () => {
        const event = new CustomEvent('tour-navigate', { detail: 'profile' });
        window.dispatchEvent(event);
      }
    },
    {
      selector: '[data-tour="edit-profile-btn"]',
      content: 'Update your sobriety date, contact information, and connect with sponsors here.'
    }
  ];

  return (
    <TourProvider
      steps={tourSteps}
      styles={{
        popover: (base) => ({
          ...base,
          '--reactour-accent': theme.palette.primary.main,
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          maxWidth: '280px',
          fontSize: '14px',
          padding: '16px'
        }),
        maskArea: (base) => ({
          ...base,
          rx: 8
        }),
        maskWrapper: (base) => ({
          ...base,
          color: 'rgba(0, 0, 0, 0.3)'
        }),
        badge: (base) => ({
          ...base,
          left: 'auto',
          right: '-0.8125em'
        }),
        controls: (base) => ({
          ...base,
          marginTop: '16px',
          display: 'flex',
          gap: '8px',
          justifyContent: 'space-between'
        }),
        close: (base) => ({
          ...base,
          right: '8px',
          top: '8px'
        })
      }}
      padding={10}
      scrollSmooth
      showBadge
      showCloseButton
      showNavigation
      onRequestClose={onClose}
    >
      <TourContent isOpen={isOpen} onClose={onClose} onNavigate={onNavigate} />
    </TourProvider>
  );
}