import React from 'react';
import { TourProvider, useTour, StepType } from '@reactour/tour';
import { useTheme, Theme } from '@mui/material/styles';

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (path: string) => void;
}

interface CustomTourNavigateEvent extends CustomEvent {
  detail: string;
}

function TourContent({ isOpen, onClose, onNavigate }: GuidedTourProps): null {
  const { setIsOpen, setCurrentStep }: { 
    setIsOpen: (isOpen: boolean) => void; 
    setCurrentStep: (step: number) => void; 
  } = useTour();

  React.useEffect(() => {
    if (isOpen) {
      // Reset to first step and open tour
      setCurrentStep(0);
      setIsOpen(true);
    } else {
      // Ensure tour is closed and reset
      setIsOpen(false);
      setCurrentStep(0);
    }
  }, [isOpen, setIsOpen, setCurrentStep]);

  React.useEffect(() => {
    const handleNavigate = (event: CustomTourNavigateEvent): void => {
      if (onNavigate) {
        onNavigate(event.detail);
      }
    };

    window.addEventListener('tour-navigate', handleNavigate as EventListener);
    return (): void => window.removeEventListener('tour-navigate', handleNavigate as EventListener);
  }, [onNavigate]);

  return null;
}

export default function GuidedTour({ isOpen, onClose, onNavigate }: GuidedTourProps): React.ReactElement {
  const theme: Theme = useTheme();
  const [tourKey, setTourKey] = React.useState<number>(0);

  // Reset tour key when opening to force new instance
  React.useEffect(() => {
    if (isOpen) {
      setTourKey(prev => prev + 1);
    }
  }, [isOpen]);

  const tourSteps: StepType[] = [
    {
      selector: '[data-tour="sobriety-days"]',
      content: 'Track your continuous sobriety time. This updates automatically based on your sobriety date in your profile.',
      position: 'bottom'
    },
    {
      selector: '[data-tour="spiritual-fitness-score"]',
      content: 'This shows your overall spiritual health based on your daily activities like prayer, meditation, and service work.',
      position: 'bottom'
    },
    {
      selector: '[data-tour="log-activity-btn"]',
      content: 'Tap here to record spiritual activities like prayer, meditation, step work, or service. Each activity improves your spiritual fitness.',
      position: 'top'
    },
    {
      selector: '[data-tour="nav-meetings"]',
      content: 'Find and track AA meetings in your area. You can save favorites and log attendance.',
      action: (): void => {
        const event: CustomTourNavigateEvent = new CustomEvent('tour-navigate', { detail: 'meetings' }) as CustomTourNavigateEvent;
        window.dispatchEvent(event);
      }
    },
    {
      selector: '[data-tour="nav-stepwork"]',
      content: 'Track your progress through the 12 steps with guided exercises and reflection prompts.',
      action: (): void => {
        const event: CustomTourNavigateEvent = new CustomEvent('tour-navigate', { detail: 'stepwork' }) as CustomTourNavigateEvent;
        window.dispatchEvent(event);
      }
    },
    {
      selector: '[data-tour="nav-sponsor"]',
      content: 'Manage your sponsor and sponsee relationships. Connect with others in recovery.',
      action: (): void => {
        const event: CustomTourNavigateEvent = new CustomEvent('tour-navigate', { detail: 'sponsor' }) as CustomTourNavigateEvent;
        window.dispatchEvent(event);
      }
    },
    {
      selector: '[data-tour="nav-profile"]',
      content: 'Update your personal information, sobriety date, and app preferences.',
      action: (): void => {
        const event: CustomTourNavigateEvent = new CustomEvent('tour-navigate', { detail: 'profile' }) as CustomTourNavigateEvent;
        window.dispatchEvent(event);
      }
    },
    {
      selector: '[data-tour="edit-profile-btn"]',
      content: 'Update your sobriety date, contact information, and connect with sponsors here.'
    }
  ];

  const tourStyles = {
    popover: (base: { [key: string]: any }) => ({
      ...base,
      '--reactour-accent': theme.palette.primary.main,
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      maxWidth: '280px',
      fontSize: '14px',
      padding: '16px'
    }),
    maskArea: (base: { [key: string]: any }) => ({
      ...base,
      rx: 8
    }),
    maskWrapper: (base: { [key: string]: any }) => ({
      ...base,
      color: 'rgba(0, 0, 0, 0.3)'
    }),
    badge: (base: { [key: string]: any }) => ({
      ...base,
      left: 'auto',
      right: '-0.8125em'
    }),
    controls: (base: { [key: string]: any }) => ({
      ...base,
      marginTop: '16px',
      display: 'flex',
      gap: '8px',
      justifyContent: 'space-between'
    }),
    close: (base: { [key: string]: any }) => ({
      ...base,
      right: '8px',
      top: '8px'
    })
  };

  const handleTourClose = (): void => {
    onClose();
  };

  return (
    <TourProvider
      key={tourKey}
      steps={tourSteps}
      styles={tourStyles}
      padding={10}
      scrollSmooth
      showBadge
      showCloseButton
      showNavigation
    >
      <TourContent isOpen={isOpen} onClose={handleTourClose} onNavigate={onNavigate} />
    </TourProvider>
  );
}