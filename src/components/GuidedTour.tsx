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

function TourContent({ onNavigate, onClose }: { onNavigate?: (path: string) => void; onClose: () => void }): null {
  const { isOpen } = useTour();
  const prevIsOpenRef = React.useRef<boolean>(true);

  React.useEffect(() => {
    const handleNavigate = (event: CustomTourNavigateEvent): void => {
      if (onNavigate) {
        onNavigate(event.detail);
      }
    };

    window.addEventListener('tour-navigate', handleNavigate as EventListener);
    return (): void => window.removeEventListener('tour-navigate', handleNavigate as EventListener);
  }, [onNavigate]);

  React.useEffect(() => {
    if (prevIsOpenRef.current && !isOpen) {
      onClose();
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, onClose]);

  return null;
}

export default function GuidedTour({ isOpen, onClose, onNavigate }: GuidedTourProps): React.ReactElement {
  const theme: Theme = useTheme();
  const [tourKey, setTourKey] = React.useState<number>(0);

  React.useEffect(() => {
    if (isOpen) {
      setTourKey(prev => prev + 1);
    }
  }, [isOpen]);

  const tourSteps: StepType[] = [
    {
      selector: '[data-tour="sobriety-counter-box"]',
      content:
        "Track your continuous sobriety time. This updates automatically based on your sobriety date in your profile.",
      position: "bottom",
      action: (): void => {
        const event: CustomTourNavigateEvent = new CustomEvent(
          "tour-navigate",
          { detail: "dashboard" }
        ) as CustomTourNavigateEvent;
        window.dispatchEvent(event);
      },
    },
    {
      selector: '[data-tour="spiritual-fitness-score"]',
      content:
        "This shows your overall spiritual health based on your daily activities like prayer, meditation, and service work. You also get a color-coded quick look at how you are doing. Keep your indicator in the green!",
      position: "bottom",
    },
   // {
   //   selector: '[data-tour="spiritual-fitness-display"]',
   //   content:
   //     "",
    //  position: "bottom",
   // },
    {
      selector: '[data-tour="spiritual-fitness-time"]',
      content:
        "See how you are doing over the last 7, 30, 60, 90, 180 or even a full year. Justs click the button to change the time.",
      position: "bottom",
    },
    {
      selector: '[data-tour="log-activity-btn"]',
      content:
        "Tap here to record spiritual activities like prayer, meditation, step work, or service. Each activity improves your spiritual fitness.",
      position: "top",
    },
    {
      selector: '[data-tour="add-meeting-btn"]',
      content:
        "Keep track of the meetings you like to attend. You can save favorites and log attendance. Click to add your first meeting!",
      position: "bottom",
      action: (): void => {
        const event: CustomTourNavigateEvent = new CustomEvent(
          "tour-navigate",
          { detail: "meetings" }
        ) as CustomTourNavigateEvent;
        window.dispatchEvent(event);
      },
    },
   // {
    //  selector: '[data-tour="add-meeting-btn"]',
    //  content: "Click to add your first meeting!",
   // },
    {
      selector: '[data-tour="nav-stepwork"]',
      content:
        "This feature is under development. You will be able to track your progress through the 12 steps with guided exercises and reflection prompts.",
      action: (): void => {
        const event: CustomTourNavigateEvent = new CustomEvent(
          "tour-navigate",
          { detail: "stepwork" }
        ) as CustomTourNavigateEvent;
        window.dispatchEvent(event);
      },
    },
    {
      selector: '[data-tour="nav-sponsor"]',
      content:
        "Manage your sponsor and sponsee relationships. Keep track of the work you do with your sponsor and your sponsees.",
      action: (): void => {
        const event: CustomTourNavigateEvent = new CustomEvent(
          "tour-navigate",
          { detail: "sponsor" }
        ) as CustomTourNavigateEvent;
        window.dispatchEvent(event);
      },
    },
    // {
    //   selector: '[data-tour="add-sponsor-btn"]',
    //   content: 'Add your sponsor\'s contact information here. Your sponsor is your guide through the 12 steps.',
    //   position: 'bottom'
    // },
    // {
    //   selector: '[data-tour="add-sponsee-btn"]',
    //   content: 'Add sponsees - people you are helping through their recovery journey. Track their progress and maintain contact.',
    //   position: 'bottom'
    // },
    {
      selector: '[data-tour="nav-profile"]',
      content:
        "Update your personal information, sobriety date, and app preferences.",
      action: (): void => {
        const event: CustomTourNavigateEvent = new CustomEvent(
          "tour-navigate",
          { detail: "profile" }
        ) as CustomTourNavigateEvent;
        window.dispatchEvent(event);
      },
    },
    {
      selector: '[data-tour="add-sobriety-btn"]',
      content:
        "Set your sobriety date here. This is the foundation for your sobriety counter and spiritual fitness score.",
    },

    {
      selector: '[data-tour="edit-profile-btn"]',
      content:
        "Update your contact information, so you can share it with others.",
    },
    {
      selector: '[data-tour="share-contact-btn"]',
      content:
        "Clicking here will allow you to share your contact information with others in recovery. This is important for building your support network. Anywhere you you see this button you can click to share that information.",
      position: "bottom",
    },
    {
      selector: '[data-tour="theme-toggle"]',
      content:
        "Switch between light and dark mode to customize your app appearance. Try tapping it now!",
      position: "bottom",
    },
  ];

  const tourStyles = {
    popover: (base: { [key: string]: any }) => ({
      ...base,
      '--reactour-accent': theme.palette.primary.main,
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      maxWidth: '280px',
      fontSize: '14px',
      padding: '16px',
      backgroundColor: '#ffffff',
      color: '#333333'
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
      right: '-0.8125em',
      backgroundColor: theme.palette.primary.main,
      color: '#ffffff'
    }),
    controls: (base: { [key: string]: any }) => ({
      ...base,
      marginTop: '16px',
      display: 'flex',
      gap: '8px',
      justifyContent: 'space-between',
      '& button': {
        color: '#333333',
        backgroundColor: 'transparent',
        border: '1px solid #333333'
      }
    }),
    close: (base: { [key: string]: any }) => ({
      ...base,
      right: '8px',
      top: '8px',
      color: '#333333'
    })
  };

  const handleTourFinish = React.useCallback(() => {
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

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
      defaultOpen={true}
    >
      <TourContent onNavigate={onNavigate} onClose={handleTourFinish} />
    </TourProvider>
  );
}