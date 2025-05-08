/**
 * IconFallback Component (DISABLED VERSION)
 * 
 * This is a completely disabled version of IconFallback that 
 * returns null to prevent Metro bundler hanging issues.
 * 
 * IMPORTANT: This component has been intentionally disabled
 * because it was causing Metro bundler to hang indefinitely.
 * Use SimpleIconFallback instead.
 */

import React from 'react';
import { View } from 'react-native';

// Return null to avoid any side effects
export default function IconFallback({ name, size, color, style }) {
  // Just return an empty view - no DOM manipulation
  return null;
}