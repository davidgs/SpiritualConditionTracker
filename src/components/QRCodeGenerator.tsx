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
    if (open && data) {
      console.log('Dialog opened, attempting to generate QR code');
      setQrGenerated(false);
      
      // Use a longer delay and multiple attempts to find the canvas
      let attempts = 0;
      const maxAttempts = 10;
      
      const tryGenerate = () => {
        attempts++;
        console.log(`Attempt ${attempts} to find canvas element`);
        
        if (canvasRef.current) {
          console.log('Canvas found! Generating QR code');
          generateQRCode();
        } else if (attempts < maxAttempts) {
          console.log('Canvas not found, trying again in 200ms');
          setTimeout(tryGenerate, 200);
        } else {
          console.error('Canvas never became available after', maxAttempts, 'attempts');
        }
      };
      
      // Start trying after a short delay
      setTimeout(tryGenerate, 300);
    }
  }, [open, data]);

  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.crossOrigin = 'anonymous';
      img.src = url;
    });
  };

  const addLogoToQRCode = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    console.log('Adding logo to QR code');
    
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    // Load the logo image
    logoImg.src = '/assets/logo.png';
    logoImg.onload = () => {
      console.log('Logo loaded successfully, adding to QR code');
      
      // Calculate logo size (about 15% of QR code size for good readability)
      const logoSize = size * 0.15;
      const logoX = (size - logoSize) / 2;
      const logoY = (size - logoSize) / 2;
      
      // Create a white background circle for the logo
      const circleRadius = logoSize / 2 + 8;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, circleRadius, 0, 2 * Math.PI);
      ctx.fill();
      
      // Add a subtle border around the circle
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, circleRadius, 0, 2 * Math.PI);
      ctx.stroke();
      
      // Draw the logo image
      ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
      
      console.log('Logo added to QR code successfully');
    };
    
    logoImg.onerror = (error) => {
      console.log('Logo failed to load, QR code will display without logo:', error);
      // QR code is still functional without the logo
    };
    
    
  };

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

      // Try to load the logo first, then generate QR with it
      try {
        console.log('Loading logo image...');
        const logoImg = await loadImage('/assets/logo.jpg');
        console.log('Logo loaded successfully');
        
        // Generate QR code with logo overlay
        const qrOptions = {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff'
          },
          errorCorrectionLevel: 'H' // High error correction for logo overlay
        };

        console.log('QR options:', qrOptions);

        // Generate the base QR code
        await QRCode.toCanvas(canvas, data, qrOptions);
        console.log('QR code generated successfully');
        
        // Add logo overlay
        const logoSize = size * 0.15;
        const logoX = (size - logoSize) / 2;
        const logoY = (size - logoSize) / 2;
        
        // Create a white background circle for the logo
        const circleRadius = logoSize / 2 + 8;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, circleRadius, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add a subtle border around the circle
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, circleRadius, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Draw the logo image
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
        
        console.log('Logo added to QR code successfully');
      } catch (error) {
        console.log('Logo failed to load, generating QR code without logo:', error);
        
        // Generate QR code without logo
        const qrOptions = {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff'
          },
          errorCorrectionLevel: 'M'
        };

        await QRCode.toCanvas(canvas, data, qrOptions);
        console.log('QR code generated successfully without logo');
      }
      
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