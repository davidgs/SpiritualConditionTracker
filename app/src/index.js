import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/main.css';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize the database
  if (window.db) {
    await window.db.init();
  } else {
    console.error('Database not initialized. Make sure database.js is loaded first.');
  }
  
  // Render the React application
  const rootElement = document.getElementById('app');
  const root = createRoot(rootElement);
  root.render(<App />);
});