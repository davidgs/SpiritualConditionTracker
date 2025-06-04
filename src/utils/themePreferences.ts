/**
 * Theme Preferences Utility
 * Connects user database preferences with theme management
 */

import { useEffect, useState } from 'react';
import { useAppData } from '../contexts/AppDataContext';

export interface ThemePreferences {
  darkMode: boolean;
  theme: string;
  use24HourFormat: boolean;
}

export const useThemePreferences = () => {
  const { state, updateUser } = useAppData();
  const [themePreferences, setThemePreferences] = useState<ThemePreferences>({
    darkMode: false,
    theme: 'default',
    use24HourFormat: false
  });

  // Load preferences from user data when user changes
  useEffect(() => {
    if (state.user?.preferences) {
      const prefs = state.user.preferences;
      setThemePreferences({
        darkMode: prefs.darkMode || false,
        theme: prefs.theme || 'default',
        use24HourFormat: prefs.use24HourFormat || false
      });
    }
  }, [state.user]);

  // Update theme preference in database
  const updateThemePreference = async (key: keyof ThemePreferences, value: boolean | string) => {
    try {
      if (!state.user) return;

      const updatedPreferences = {
        ...state.user.preferences,
        [key]: value
      };

      await updateUser({
        preferences: updatedPreferences
      });

      // Update local state immediately for responsive UI
      setThemePreferences(prev => ({
        ...prev,
        [key]: value
      }));

      console.log(`Theme preference updated: ${key} = ${value}`);
    } catch (error) {
      console.error('Failed to update theme preference:', error);
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    updateThemePreference('darkMode', !themePreferences.darkMode);
  };

  // Change theme
  const changeTheme = (theme: string) => {
    updateThemePreference('theme', theme);
  };

  // Toggle 24-hour format
  const toggle24HourFormat = () => {
    updateThemePreference('use24HourFormat', !themePreferences.use24HourFormat);
  };

  return {
    themePreferences,
    toggleDarkMode,
    changeTheme,
    toggle24HourFormat,
    updateThemePreference
  };
};