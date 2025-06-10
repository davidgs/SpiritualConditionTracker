import * as React from 'react';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
// Temporary fix for icon imports
const CloseIcon = () => <span>×</span>;
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import MuiThemeProvider from '../contexts/MuiThemeProvider';

// Style the Dialog
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(3),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
  '& .MuiPaper-root': {
    maxWidth: '500px',
    width: '100%',
  },
}));

/**
 * Material UI Dialog component that explains how the Spiritual Fitness score is calculated
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Function to call when the dialog should close
 * @returns {React.ReactElement} The dialog component
 */
const SpiritualFitnessModal = ({ open, onClose }) => {
  return (
    <MuiThemeProvider>
      <StyledDialog
        onClose={onClose}
        aria-labelledby="spiritual-fitness-dialog-title"
        open={open}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="spiritual-fitness-dialog-title">
          Spiritual Fitness Score
        </DialogTitle>
        
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
              Activity Point Values
            </Typography>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
              <Typography component="li" variant="body2" gutterBottom>
                <strong>Meetings:</strong> 10 points (plus speaker, chair, share bonuses)
              </Typography>
              <Typography component="li" variant="body2" gutterBottom>
                <strong>Step Work:</strong> 10 points
              </Typography>
              <Typography component="li" variant="body2" gutterBottom>
                <strong>Service:</strong> 9 points
              </Typography>
              <Typography component="li" variant="body2" gutterBottom>
                <strong>Prayer/Meditation:</strong> 8 points each
              </Typography>
              <Typography component="li" variant="body2" gutterBottom>
                <strong>Reading/Literature:</strong> 6 points each
              </Typography>
              <Typography component="li" variant="body2" gutterBottom>
                <strong>Sponsor Calls:</strong> 5 points
              </Typography>
              <Typography component="li" variant="body2" gutterBottom>
                <strong>Sponsee Calls:</strong> 4 points
              </Typography>
              <Typography component="li" variant="body2" gutterBottom>
                <strong>AA Member Calls:</strong> 5 points
              </Typography>
              <Typography component="li" variant="body2" gutterBottom>
                <strong>Action Items:</strong> +0.5 points when completed, -0.5 points when deleted
              </Typography>
            </ul>
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
              Calculation Method
            </Typography>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
              <Typography component="li" variant="body2" gutterBottom>
                Points are calculated based on weighted activity values
              </Typography>
              <Typography component="li" variant="body2" gutterBottom>
                Consistency bonus for regular activity across multiple days
              </Typography>
              <Typography component="li" variant="body2" gutterBottom>
                Variety bonus for engaging in different types of activities
              </Typography>
              <Typography component="li" variant="body2" gutterBottom>
                Action items only count when completed (positive) or deleted (negative)
              </Typography>
            </ul>
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
              Timeframe Impact
            </Typography>
            <Typography variant="body2" gutterBottom>
              Different timeframes use adjusted scoring formulas. Shorter periods 
              (30 days) emphasize recent activity, while longer periods require 
              sustained engagement. The score displays with decimal precision 
              to reflect your exact spiritual fitness level.
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography 
              variant="body1" 
              sx={{ 
                fontWeight: 'medium', 
                color: 'primary.main'
              }}
            >
              Maximum score is 100
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </StyledDialog>
    </MuiThemeProvider>
  );
};

export default SpiritualFitnessModal;