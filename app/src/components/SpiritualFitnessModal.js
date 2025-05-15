import * as React from 'react';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
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
              Base Points for Activities
            </Typography>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
              <Typography component="li" variant="body2" gutterBottom>
                AA Meeting: 5 points (speaker +3, shared +1, chair +1)
              </Typography>
              <Typography component="li" variant="body2" gutterBottom>
                Reading Literature: 2 points per 30 min
              </Typography>
              <Typography component="li" variant="body2" gutterBottom>
                Prayer/Meditation: 2 points per 30 min
              </Typography>
              <Typography component="li" variant="body2" gutterBottom>
                Talking with Sponsor: 3 points per 30 min
              </Typography>
              <Typography component="li" variant="body2" gutterBottom>
                Working with Sponsee: 4 points per 30 min (max 20)
              </Typography>
              <Typography component="li" variant="body2" gutterBottom>
                AA Calls: 1 point each (no limit)
              </Typography>
              <Typography component="li" variant="body2" gutterBottom>
                Variety of activities: 1-5 bonus points
              </Typography>
            </ul>
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
              Timeframe Adjustments
            </Typography>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
              <Typography component="li" variant="body2" gutterBottom>
                Consistency bonus for regular activity across weeks
              </Typography>
              <Typography component="li" variant="body2" gutterBottom>
                Higher expectations for longer timeframes
              </Typography>
              <Typography component="li" variant="body2" gutterBottom>
                Recent activity weighted more heavily
              </Typography>
              <Typography component="li" variant="body2" gutterBottom>
                Score reflects sustained engagement over time
              </Typography>
            </ul>
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
              How Timeframes Affect Your Score
            </Typography>
            <Typography variant="body2" gutterBottom>
              Shorter timeframes (30 days) focus on recent activity, while 
              longer timeframes (60-365 days) measure your consistent 
              engagement over time. A high score over a 365-day period 
              demonstrates sustained spiritual fitness.
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