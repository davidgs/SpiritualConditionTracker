import React, { useRef } from 'react';
import { QRCode } from 'react-qrcode-logo';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';

interface QRCodeGeneratorProps {
  data: string;
  title: string;
  open: boolean;
  onClose: () => void;
  size?: number;
}

export default function QRCodeGenerator({ data, title, open, onClose, size = 300 }: QRCodeGeneratorProps) {
  const qrRef = useRef<any>(null);

  const qrSettings = {
    value: data,
    ecLevel: 'H' as const,
    enableCORS: true,
    size: size,
    quietZone: 10,
    bgColor: '#ffffff',
    fgColor: '#000000',
    logoImage: '/assets/gr-logo.png',
    logoWidth: size * 0.2,
    logoHeight: size * 0.2,
    logoOpacity: 1,
    removeQrCodeBehindLogo: true,
    logoPadding: 3,
    logoPaddingStyle: 'circle' as const,
    eyeRadius: [
      { outer: [10, 10, 0, 10], inner: [0, 10, 10, 0] },
      { outer: [10, 10, 10, 0], inner: [10, 0, 0, 10] },
      { outer: [10, 0, 10, 10], inner: [0, 10, 0, 0] }
    ],
    eyeColor: '#000000',
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
      maxWidth="sm" 
      fullWidth
      sx={{
        '& .MuiDialog-container': {
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh'
        },
        '& .MuiDialog-paper': {
          margin: '16px',
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
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

      <DialogActions sx={{ justifyContent: 'center', gap: 1, pb: 3 }}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<i className="fa-solid fa-download"></i>}
          onClick={downloadQRCode}
          sx={{ minWidth: 120 }}
        >
          Download
        </Button>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<i className="fa-solid fa-share"></i>}
          onClick={shareQRCode}
          sx={{ minWidth: 120 }}
        >
          Share
        </Button>
        
        <Button
          variant="outlined"
          color="inherit"
          onClick={onClose}
          sx={{ minWidth: 120 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}