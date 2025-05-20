import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '@mui/material/styles';

/**
 * Material Design inspired Modal component
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when the modal should close
 * @param {React.ReactNode} props.children - Content to render inside the modal
 * @param {string} props.title - Modal title (optional)
 * @param {string} props.size - Size of the modal ('sm', 'md', 'lg', 'xl', 'full')
 * @returns {React.ReactPortal|null} The modal portal or null if closed
 */
const Modal = ({ isOpen, onClose, children, title, size = 'md' }) => {
  const theme = useTheme();
  const darkMode = theme.palette.mode === 'dark';
  const modalRef = useRef(null);
  const contentRef = useRef(null);
  
  // Handle ESC key press to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      
      // Prevent scrolling with better iOS compatibility
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      
      // Add entrance animation class
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
      document.removeEventListener('keydown', handleEscKey);
      
      // Restore scrolling when modal is closed
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, [isOpen, onClose]);
  
  // Click outside to close
  const handleClickOutside = (e) => {
    if (modalRef.current && e.target === e.currentTarget) {
      onClose();
    }
  };
  
  // Determine max width based on size
  const getModalWidth = () => {
    switch (size) {
      case 'sm': return 'max-w-sm';
      case 'md': return 'max-w-md';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-xl';
      case 'full': return 'max-w-screen-md';
      default: return 'max-w-md';
    }
  };
  
  if (!isOpen) return null;
  
  // Create portal to render modal at the body level
  return createPortal(
    <div 
      className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden"
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? 'modal-title' : undefined}
      ref={modalRef}
      onClick={handleClickOutside}
    >
      {/* Backdrop with Material-like animation */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm"
        style={{
          animation: 'fadeIn 0.2s ease-out forwards'
        }}
        aria-hidden="true"
      ></div>
      
      {/* Modal container with proper centering */}
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        {/* Modal content with Material design elevation */}
        <div 
          ref={contentRef}
          className={`${getModalWidth()} w-full overflow-hidden rounded-md
            ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} 
            text-left shadow-xl transform transition-all`}
          style={{
            boxShadow: darkMode ? 
              '0 24px 38px 3px rgba(0,0,0,0.14), 0 9px 46px 8px rgba(0,0,0,0.12), 0 11px 15px -7px rgba(0,0,0,0.2)' :
              '0 24px 38px 3px rgba(0,0,0,0.07), 0 9px 46px 8px rgba(0,0,0,0.06), 0 11px 15px -7px rgba(0,0,0,0.1)'
          }}
        >
          {/* Title bar with more prominent styling */}
          {title && (
            <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 
                id="modal-title"
                className={`text-xl font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}
              >
                {title}
              </h3>
            </div>
          )}
          
          {/* Close button with better positioning and material-like ripple effect */}
          <button 
            className={`absolute top-4 right-4 rounded-full p-1.5
              ${darkMode ? 'text-gray-400 hover:bg-gray-700 focus:bg-gray-700' : 
                          'text-gray-500 hover:bg-gray-100 focus:bg-gray-100'}
              transition-colors duration-200 focus:outline-none`}
            onClick={onClose}
            aria-label="Close modal"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
          
          {/* Content area with proper padding */}
          <div className={`px-6 py-5 ${!title ? 'pt-10' : ''}`}>
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;