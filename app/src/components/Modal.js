import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Modal component that renders its children in a portal
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
  const { darkMode } = useTheme();
  const modalRef = useRef(null);
  
  // Handle ESC key press to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
      // Restore body scrolling when modal is closed
      document.body.style.overflow = '';
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
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        aria-hidden="true"
      ></div>
      
      <div 
        className="flex min-h-screen items-center justify-center p-4 text-center"
        onClick={handleClickOutside}
      >
        <div 
          ref={modalRef}
          className={`${getModalWidth()} w-full transform overflow-hidden rounded-lg 
            ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} 
            p-6 text-left align-middle shadow-xl transition-all`}
        >
          {title && (
            <h3 
              id="modal-title"
              className="text-xl font-bold mb-4 text-center"
            >
              {title}
            </h3>
          )}
          
          {/* Close button */}
          <button 
            className={`absolute top-3 right-3 
              ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}
              transition-colors duration-200`}
            onClick={onClose}
            aria-label="Close modal"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
          
          <div className="mt-2">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;