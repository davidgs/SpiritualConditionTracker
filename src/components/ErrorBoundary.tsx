/**
 * Error Boundary Component
 * Catches React errors and displays fallback UI
 */

import React, { Component, ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          backgroundColor="#1a1a1a"
          color="#ffffff"
          padding={3}
        >
          <Typography variant="h4" gutterBottom color="error">
            Something went wrong
          </Typography>
          
          <Typography variant="body1" gutterBottom textAlign="center" style={{ maxWidth: '500px' }}>
            The app encountered an unexpected error. Please try refreshing the page.
          </Typography>
          
          {this.state.error && (
            <Typography variant="body2" color="textSecondary" style={{ marginTop: '16px', fontFamily: 'monospace' }}>
              {this.state.error.message}
            </Typography>
          )}
          
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.reload()}
            style={{ marginTop: '24px' }}
          >
            Refresh Page
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;