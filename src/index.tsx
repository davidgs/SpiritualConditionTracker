import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './styles/tailwind.css';
import './styles/main.css';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', async () => {
  // Render the React application - database initialization is now handled in App.js
  // This prevents race conditions and ensures proper loading sequence
  const rootElement = document.getElementById('app');
  const root = createRoot(rootElement);
  root.render(<App />);
});