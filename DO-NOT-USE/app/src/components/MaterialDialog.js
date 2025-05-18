import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../contexts/ThemeContext';

/**
 * A Material Design inspired Dialog component
 * 
 * @param {Object} props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Function to call when the dialog should close
 * @param {React.ReactNode} props.children - Content to render inside the dialog
 * @param {string} props.title - Dialog title
 * @param {React.ReactNode} props.actions - Actions to show in the dialog footer
 * @param {string} props.maxWidth - Maximum width of the dialog ('xs', 'sm', 'md', 'lg', 'xl')
 * @returns {React.ReactPortal|null}
 */
const MaterialDialog = ({
  open,
  onClose,
  children,
  title,
  actions,
  maxWidth = 'sm'
}) => {
  const { darkMode } = useTheme();
  const dialogRef = useRef(null);
  const contentRef = useRef(null);
  
  // Handle ESC key to close dialog
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && open) {
        onClose();
      }
    };
    
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent background scrolling
      document.body.style.overflow = 'hidden';
      
      // Add animation class
      if (contentRef.current) {
        contentRef.current.classList.add('modal-enter');
        setTimeout(() => {
          if (contentRef.current) {
            contentRef.current.classList.remove('modal-enter');
          }
        }, 300);
      }
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);
  
  // Handle click outside dialog
  const handleBackdropClick = (e) => {
    if (dialogRef.current && e.target === e.currentTarget) {
      onClose();
    }
  };
  
  // Get width based on size
  const getMaxWidth = () => {
    switch(maxWidth) {
      case 'xs': return 'max-w-xs';
      case 'sm': return 'max-w-sm';
      case 'md': return 'max-w-md';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-xl';
      default: return 'max-w-sm';
    }
  };
  
  if (!open) return null;
  
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
      ref={dialogRef}
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? "dialog-title" : undefined}
    >
      {/* Backdrop with animation */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        style={{ animation: 'fadeIn 0.2s ease-out forwards' }}
      />
      
      {/* Dialog Paper */}
      <div
        ref={contentRef}
        className={`${getMaxWidth()} w-full relative rounded-md overflow-hidden
          ${darkMode ? 'bg-gray-800' : 'bg-white'} my-8 shadow-2xl`}
        style={{
          boxShadow: darkMode 
            ? '0 24px 38px 3px rgba(0,0,0,0.14), 0 9px 46px 8px rgba(0,0,0,0.12), 0 11px 15px -7px rgba(0,0,0,0.2)'
            : '0 24px 38px 3px rgba(0,0,0,0.07), 0 9px 46px 8px rgba(0,0,0,0.06), 0 11px 15px -7px rgba(0,0,0,0.1)'
        }}
      >
        {/* Title */}
        {title && (
          <div className={`px-6 py-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
            <h2
              id="dialog-title"
              className={`text-xl font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}
            >
              {title}
            </h2>
          </div>
        )}
        
        {/* Close button */}
        <button
          className={`absolute right-4 top-4 p-1.5 rounded-full
            ${darkMode 
              ? 'text-gray-400 hover:bg-gray-700 focus:bg-gray-700' 
              : 'text-gray-500 hover:bg-gray-100 focus:bg-gray-100'
            } transition-colors duration-200 focus:outline-none`}
          onClick={onClose}
          aria-label="close"
        >
          <i className="fa-solid fa-times" />
        </button>
        
        {/* Content */}
        <div className={`px-6 py-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'} 
          overflow-y-auto ${actions ? 'border-b border-gray-200' : ''}`}
        >
          {children}
        </div>
        
        {/* Actions */}
        {actions && (
          <div className={`px-4 py-3 flex justify-end space-x-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            {actions}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

/**
 * Dialog Title component
 */
MaterialDialog.Title = ({ children, className, ...props }) => {
  const { darkMode } = useTheme();
  
  return (
    <h3 
      className={`text-xl font-medium mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'} ${className || ''}`}
      {...props}
    >
      {children}
    </h3>
  );
};

/**
 * Dialog Content Text component
 */
MaterialDialog.ContentText = ({ children, className, ...props }) => {
  const { darkMode } = useTheme();
  
  return (
    <p 
      className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'} ${className || ''}`}
      {...props}
    >
      {children}
    </p>
  );
};

/**
 * Dialog Action Button component
 */
MaterialDialog.Button = ({ 
  children, 
  onClick, 
  color = 'primary', 
  variant = 'text',
  className,
  ...props 
}) => {
  const { darkMode } = useTheme();
  
  // Get button styling based on color and variant
  const getButtonStyle = () => {
    // Base styles for all buttons
    let styles = 'px-4 py-2 rounded-md text-sm font-medium focus:outline-none transition-colors';
    
    if (variant === 'contained') {
      if (color === 'primary') {
        styles += darkMode 
          ? ' bg-blue-600 text-white hover:bg-blue-700'
          : ' bg-blue-500 text-white hover:bg-blue-600';
      } else if (color === 'secondary') {
        styles += darkMode
          ? ' bg-purple-600 text-white hover:bg-purple-700'
          : ' bg-purple-500 text-white hover:bg-purple-600';
      } else if (color === 'error') {
        styles += darkMode
          ? ' bg-red-600 text-white hover:bg-red-700'
          : ' bg-red-500 text-white hover:bg-red-600';
      }
    } else {
      // Text and outlined variants
      if (color === 'primary') {
        styles += darkMode
          ? ' text-blue-400 hover:bg-blue-900 hover:bg-opacity-20'
          : ' text-blue-600 hover:bg-blue-100 hover:bg-opacity-40';
      } else if (color === 'secondary') {
        styles += darkMode
          ? ' text-purple-400 hover:bg-purple-900 hover:bg-opacity-20'
          : ' text-purple-600 hover:bg-purple-100 hover:bg-opacity-40';
      } else if (color === 'error') {
        styles += darkMode
          ? ' text-red-400 hover:bg-red-900 hover:bg-opacity-20'
          : ' text-red-600 hover:bg-red-100 hover:bg-opacity-40';
      }
      
      if (variant === 'outlined') {
        if (color === 'primary') {
          styles += darkMode
            ? ' border border-blue-500'
            : ' border border-blue-500';
        } else if (color === 'secondary') {
          styles += darkMode
            ? ' border border-purple-500'
            : ' border border-purple-500';
        } else if (color === 'error') {
          styles += darkMode
            ? ' border border-red-500'
            : ' border border-red-500';
        }
      }
    }
    
    return styles;
  };
  
  return (
    <button
      className={`${getButtonStyle()} ${className || ''}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default MaterialDialog;