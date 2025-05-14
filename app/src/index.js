import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './styles/index.css';

// Wait for DOM content to be loaded before mounting React
document.addEventListener('DOMContentLoaded', function() {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('app')
  );
});