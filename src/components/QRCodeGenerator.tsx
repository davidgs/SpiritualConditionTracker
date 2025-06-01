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
    if (!canvasRef.current) return;

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Generate QR code
      await QRCode.toCanvas(canvas, data, {
        width: size,
        margin: 2,
        color: {
          dark: '#1a365d', // Dark blue matching app theme
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H' // High error correction for logo overlay
      });

      // Add logo in center
      const logoImg = new Image();
      logoImg.onload = () => {
        const logoSize = size * 0.2; // 20% of QR code size
        const logoX = (size - logoSize) / 2;
        const logoY = (size - logoSize) / 2;

        // Create a white background circle for the logo
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, logoSize / 2 + 8, 0, 2 * Math.PI);
        ctx.fill();

        // Draw the logo
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
        setQrGenerated(true);
      };

      logoImg.onerror = () => {
        // If logo fails to load, just show QR code without logo
        setQrGenerated(true);
      };

      // Try to load the logo
      logoImg.src = '/logo.jpg';
    } catch (error) {
      console.error('Error generating QR code:', error);
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
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