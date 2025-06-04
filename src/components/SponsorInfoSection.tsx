import React from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { formatDateForDisplay } from '../utils/dateUtils';

interface Sponsor {
  id: number;
  name: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  sobrietyDate?: string;
  notes?: string;
}

interface SponsorInfoSectionProps {
  sponsor: Sponsor;
  theme: any;
}

export const SponsorInfoSection: React.FC<SponsorInfoSectionProps> = ({
  sponsor,
  theme
}) => {
  const hasInfo = sponsor.sobrietyDate || sponsor.notes;
  
  if (!hasInfo) {
    return null;
  }
  
  return (
    <Accordion 
      elevation={0}
      sx={{ 
        backgroundColor: 'transparent',
        '&:before': { display: 'none' },
        boxShadow: 'none'
      }}
    >
      <AccordionSummary
        expandIcon={<i className="fa-solid fa-chevron-down" style={{ color: theme.palette.text.secondary }}></i>}
        sx={{
          padding: 0,
          minHeight: 'auto',
          '& .MuiAccordionSummary-content': {
            margin: '8px 0',
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <i className="fa-solid fa-info-circle" style={{ color: theme.palette.primary.main, fontSize: '14px' }}></i>
          <Typography variant="body2" sx={{ color: theme.palette.primary.main }}>
            Additional Information
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ padding: '0 0 16px 0' }}>
        <Box sx={{ pl: 2 }}>
          {sponsor.sobrietyDate && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                Sobriety Date:
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                {formatDateForDisplay(sponsor.sobrietyDate)}
              </Typography>
            </Box>
          )}
          
          {sponsor.notes && (
            <Box>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                Notes:
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                {sponsor.notes}
              </Typography>
            </Box>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};