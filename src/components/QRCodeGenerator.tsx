import React, { useRef } from 'react';
import { QRCode } from 'react-qrcode-logo';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface QRCodeGeneratorProps {
  data: string;
  title: string;
  open: boolean;
  onClose: () => void;
  size?: number;
}

export default function QRCodeGenerator({ data, title, open, onClose, size = 300 }: QRCodeGeneratorProps) {
  const qrRef = useRef<any>(null);
  const theme = useTheme();

  const qrSettings = {
    value: data,
    ecLevel: 'H' as const,
    enableCORS: true,
    size: size,
    quietZone: 10,
    bgColor: theme.palette.background.paper,
    fgColor: theme.palette.text.primary,
    logoImage: '/assets/qr-logo.png',
    logoWidth: size * 0.3,
    logoHeight: size * 0.3,
    logoOpacity: 1,
    removeQrCodeBehindLogo: true,
    logoPadding: 3,
    logoPaddingStyle: 'circle' as const,

    eyeColor: theme.palette.text.primary,
    qrStyle: 'dots' as const,
    id: 'react-qrcode-logo'
  };

  const downloadQRCode = () => {
    if (qrRef.current) {
      const canvas = qrRef.current.querySelector('canvas');
      if (canvas) {
        const link = document.createElement('a');
        link.download = `${title.replace(/\s+/g, '_')}_QR.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    }
  };

  const shareQRCode = async () => {
    if (qrRef.current) {
      const canvas = qrRef.current.querySelector('canvas');
      if (canvas) {
        try {
          if (navigator.share) {
            // Use native sharing if available (mobile)
            canvas.toBlob(async (blob) => {
              if (blob) {
                const file = new File([blob], `${title}_QR.png`, { type: 'image/png' });
                await navigator.share({
                  title: title,
                  text: `Check out: ${title}`,
                  files: [file]
                });
              }
            });
          } else {
            // Fallback to clipboard
            canvas.toBlob(async (blob) => {
              if (blob) {
                await navigator.clipboard.write([
                  new ClipboardItem({ 'image/png': blob })
                ]);
                alert('QR code copied to clipboard!');
              }
            });
          }
        } catch (error) {
          console.error('Error sharing QR code:', error);
          // Fallback to download
          downloadQRCode();
        }
      }
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xs" 
      fullWidth
      sx={{
        '& .MuiDialog-container': {
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh'
        },
        '& .MuiDialog-paper': {
          margin: { xs: '8px', sm: '16px' },
          maxWidth: { xs: 'calc(100vw - 16px)', sm: '400px' },
          width: '100%',
          maxHeight: 'calc(100vh - 32px)'
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <i className="fa-solid fa-qrcode mr-2"></i>
        {title}
      </DialogTitle>
      
      <DialogContent sx={{ textAlign: 'center', py: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <div ref={qrRef}>
            <QRCode {...qrSettings} />
          </div>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Scan with your phone's camera or QR code reader
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        justifyContent: 'center', 
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 1, sm: 2 }, 
        pb: 3,
        px: 3
      }}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<i className="fa-solid fa-download"></i>}
          onClick={downloadQRCode}
          sx={{ 
            flex: { xs: 1, sm: 'none' },
            minWidth: { xs: 'auto', sm: 100 },
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          Download
        </Button>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<i className="fa-solid fa-share"></i>}
          onClick={shareQRCode}
          sx={{ 
            flex: { xs: 1, sm: 'none' },
            minWidth: { xs: 'auto', sm: 100 },
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          Share
        </Button>
        
        <Button
          variant="outlined"
          color="inherit"
          onClick={onClose}
          sx={{ 
            flex: { xs: 1, sm: 'none' },
            minWidth: { xs: 'auto', sm: 100 },
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}