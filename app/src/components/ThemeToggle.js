import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
      <div>
        <h3 className="font-medium text-gray-800 dark:text-gray-200">Dark Mode</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark themes</p>
      </div>
      <button
        onClick={toggleTheme}
        className="theme-toggle"
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? (
          <i className="fas fa-moon text-xl"></i>
        ) : (
          <i className="fas fa-sun text-xl"></i>
        )}
      </button>
    </div>
  );
}