import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';

interface QRCodeGeneratorProps {
  data: string;
  title: string;
  open: boolean;
  onClose: () => void;
  size?: number;
}

export default function QRCodeGenerator({ data, title, open, onClose, size = 300 }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrGenerated, setQrGenerated] = useState(false);

  useEffect(() => {
    if (open && data && canvasRef.current) {
      generateQRCode();
    }
  }, [open, data]);

  const generateQRCode = async () => {
    if (!canvasRef.current || !data) {
      console.log('Canvas ref or data missing:', { canvas: !!canvasRef.current, data });
      return;
    }

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('Could not get canvas context');
        return;
      }

      console.log('Starting QR code generation...');
      console.log('Canvas element:', canvas);
      console.log('Data to encode:', data);
      console.log('Size:', size);

      // Clear the canvas first
      canvas.width = size;
      canvas.height = size;
      ctx.clearRect(0, 0, size, size);

      // Set white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);

      console.log('Canvas cleared and sized');

      // Generate QR code with basic settings first
      const qrOptions = {
        width: size,
        margin: 2,
        color: {
          dark: '#000000', // Use black for better visibility
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M' // Medium error correction
      };

      console.log('QR options:', qrOptions);

      // Generate the QR code
      await QRCode.toCanvas(canvas, data, qrOptions);
      
      console.log('QR code generated successfully');
      setQrGenerated(true);

    } catch (error) {
      console.error('Error generating QR code:', error);
      console.error('Error details:', error.message, error.stack);
      
      // Fallback: draw a simple rectangle to show something is working
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = '#000000';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('QR Error', size/2, size/2);
      }
      setQrGenerated(true);
    }
  };

  const downloadQRCode = () => {
    if (!canvasRef.current) return;

    const link = document.createElement('a');
    link.download = `${title.replace(/\s+/g, '_')}_QR.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const shareQRCode = async () => {
    if (!canvasRef.current) return;

    try {
      if (navigator.share) {
        // Use native sharing if available (mobile)
        canvasRef.current.toBlob(async (blob) => {
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
        canvasRef.current.toBlob(async (blob) => {
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
          <canvas
            ref={canvasRef}
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              maxWidth: '100%',
              height: 'auto'
            }}
          />
          
          {qrGenerated && (
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
              Scan this QR code with any QR reader to access the shared information
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 3 }}>
        <Button
          variant="outlined"
          onClick={downloadQRCode}
          startIcon={<i className="fa-solid fa-download"></i>}
        >
          Download
        </Button>
        
        <Button
          variant="contained"
          onClick={shareQRCode}
          startIcon={<i className="fa-solid fa-share"></i>}
        >
          Share
        </Button>
        
        <Button
          variant="outlined"
          onClick={onClose}
          color="inherit"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}