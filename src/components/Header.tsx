import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Typography, Box, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { useAppTheme } from '../contexts/MuiThemeProvider';
import SafeAreaHeader from './SafeAreaHeader';
import GuidedTour from './GuidedTour';

interface HeaderProps {
  title: string;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  isMobile: boolean;
  onNavigate: (view: string) => void;
  autoStartTour?: boolean;
  onTourClose?: () => void;
}

function Header({ title, menuOpen, setMenuOpen, isMobile, onNavigate, autoStartTour, onTourClose }: HeaderProps) {
  const muiTheme = useTheme();
  const { primaryColor, toggleTheme } = useAppTheme();
  const darkMode = muiTheme.palette.mode === 'dark';
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);

  // Auto-start tour for new users
  React.useEffect(() => {
    if (autoStartTour) {
      setTourOpen(true);
    }
  }, [autoStartTour]);

  
  // Use MUI theme colors for consistent styling
  const headerBackgroundColor = darkMode 
    ? muiTheme.palette.background.paper 
    : muiTheme.palette.grey[100];
  // Header text color from MUI theme
  const headerTextColor = muiTheme.palette.text.primary;
  // Add a primary color accent from the user's selected theme
  const accentColor = muiTheme.palette.primary.main;
  
  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          top: 1,
          left: 0,
          right: 0,
          zIndex: 1100,
          backgroundColor: headerBackgroundColor,
          borderBottom: `1px solid ${muiTheme.palette.divider}`,
          padding: '0.5rem 1rem',
          paddingTop: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          gap: 1,
          height: '94px',
        }}
      >
        {/* Logo and title - left aligned */}
        <Box
          component="img" 
          src="/assets/logo.jpg"
          alt="App Logo" 
          sx={{ 
            width: '40px',
            height: '40px',
            objectFit: 'cover',
            borderRadius: '20px'
          }}
        />
        
        <Typography 
          variant="h6" 
          data-tour="tour-welcome"
          sx={{ 
            fontWeight: 600,
            color: headerTextColor,
            fontSize: '1.2rem',
            lineHeight: 1.2,
            flex: 1
          }}
        >
          My Spiritual Condition
        </Typography>



        {/* Help/Tour Button */}
        <IconButton
          onClick={() => setTourOpen(true)}
          sx={{
            padding: '4px',
            fontSize: '1.1rem',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'scale(1.1)'
            }
          }}
          aria-label="Start guided tour"
        >
          <i className="fas fa-question-circle" style={{ fontSize: '1.1rem' }}></i>
        </IconButton>

        {/* Info Button */}
        <IconButton
          onClick={() => setInfoDialogOpen(true)}
          sx={{
            padding: '4px',
            fontSize: '1.1rem',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'scale(1.1)'
            }
          }}
          aria-label="App information"
        >
          <i className="fas fa-info-circle" style={{ fontSize: '1.1rem' }}></i>
        </IconButton>

        {/* Theme Toggle Button */}
        <Box
          component="button"
          onClick={toggleTheme}
          sx={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: '1.2rem',
            padding: '4px',
            borderRadius: '50%',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'scale(1.1)'
            }
          }}
              data-tour="theme-toggle"
          aria-label="Toggle theme"
        >
          {muiTheme.palette.mode === 'dark' ? '🌙' : '☀️'}
        </Box>
      </Box>

      {/* Info Dialog */}
      <Dialog 
        open={infoDialogOpen} 
        onClose={() => setInfoDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: darkMode ? '#1f2937' : '#ffffff',
            color: muiTheme.palette.text.primary
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 'bold',
          borderBottom: `1px solid ${muiTheme.palette.divider}`,
          pb: 2
        }}>
          About My Spiritual Condition (v1.0.6 b123)
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
            This app was inspired by the wisdom found on page 85 of Alcoholics Anonymous (the Big Book) and the AA Grapevine podcast, created to help maintain our spiritual condition on a daily basis.
          </Typography>
          
          <Box sx={{ 
            bgcolor: darkMode ? '#374151' : '#f8f9fa',
            p: 2,
            borderRadius: 1,
            borderLeft: `4px solid ${muiTheme.palette.primary.main}`,
            mb: 3
          }}>
            <Typography variant="body2" sx={{ fontStyle: 'italic', lineHeight: 1.5 }}>
              "Instead, the problem has been removed. It does not exist for us. We are neither cocky nor are we afraid. That is our experience. That is how we react so long as we keep in fit spiritual condition.
              <br /><br />
              It is easy to let up on the spiritual program of action and rest on our laurels. We are headed for trouble if we do, for alcohol is a subtle foe. We are not cured of alcoholism. What we really have is a daily reprieve contingent on the maintenance of our spiritual condition."
            </Typography>
            <Typography variant="caption" sx={{ 
              display: 'block', 
              textAlign: 'right', 
              mt: 1,
              color: muiTheme.palette.text.secondary
            }}>
              — Alcoholics Anonymous, Page 85
            </Typography>
          </Box>
          
          <Typography variant="body2" sx={{ mb: 2, color: muiTheme.palette.text.secondary }}>
            This daily reprieve is contingent on maintaining our spiritual condition through consistent action and mindful tracking of our spiritual activities.
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: muiTheme.palette.text.secondary }}>
            I created this app in order to help me maintain consistency in working my program over time. I hope it helps you as well.
          </Typography>
          
          <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${muiTheme.palette.divider}` }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Website:</strong>{' '}
              <Box 
                component="a" 
                href="https://spiritual-condition.com" 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{ 
                  color: muiTheme.palette.primary.main,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                spiritual-condition.com
              </Box>
            </Typography>
            <Typography variant="body2">
              <strong>Contact:</strong>{' '}
              <Box 
                component="a" 
                href="mailto:help@spiritual-condition.com"
                sx={{ 
                  color: muiTheme.palette.primary.main,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                help@spiritual-condition.com
              </Box>
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${muiTheme.palette.divider}` }}>
          <Button 
            onClick={() => setInfoDialogOpen(false)} 
            variant="contained"
            size="small"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Guided Tour */}
      <GuidedTour 
        isOpen={tourOpen} 
        onClose={() => {
          setTourOpen(false);
          if (onTourClose) {
            onTourClose();
          }
        }}
        onNavigate={onNavigate}
      />
    </>
  );
}

export default Header;