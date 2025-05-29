import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App-simple';
import './styles/tailwind.css';
import './styles/main.css';

// Function to initialize the app
function initializeApp() {
  const rootElement = document.getElementById('app');
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<App />);
  } else {
    // If DOM isn't ready yet, wait a bit and try again
    setTimeout(initializeApp, 100);
  }
}

// Start initialization when DOM is ready or immediately if already ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}