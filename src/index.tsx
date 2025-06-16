import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/tailwind.css';
import './styles/main.css';
import { defineCustomElements as defineJeepSqlite } from 'jeep-sqlite/loader';

// Function to initialize SQLite web component
async function initializeSQLiteWeb() {
  // Define jeep-sqlite custom elements for web platform
  await defineJeepSqlite(window);
  
  // Add jeep-sqlite custom element for web platform
  const jeepSqlite = document.createElement('jeep-sqlite');
  document.body.appendChild(jeepSqlite);
  
  // Wait for the component to be defined
  await customElements.whenDefined('jeep-sqlite');
  console.log('[ index.tsx ] jeep-sqlite web component initialized');
}

// Function to initialize the app
async function initializeApp() {
  // Initialize SQLite web component first
  await initializeSQLiteWeb();
  
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