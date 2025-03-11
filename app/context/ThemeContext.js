import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { saveUserThemePreference, getUserThemePreference } from '../services/firebaseService';
import { STORAGE_KEYS } from '../utils/constants';
import { lightTheme, darkTheme } from '../theme';

// Create a context for the theme
const ThemeContext = createContext();

// Custom hook to use the theme context
export const useThemeContext = () => useContext(ThemeContext);

// Theme provider component
export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [theme, setTheme] = useState(lightTheme);
  const [loading, setLoading] = useState(true);
  const systemColorScheme = useColorScheme();

  // Load theme preference on component mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        setLoading(true);
        // First try to get theme from local storage for immediate UI update
        const savedTheme = await AsyncStorage.getItem(STORAGE_KEYS.USER_THEME);
        
        let darkMode = false;
        if (savedTheme !== null) {
          // Check if the saved theme is a JSON object or a simple string
          try {
            const parsedTheme = JSON.parse(savedTheme);
            darkMode = parsedTheme.isDarkMode;
          } catch (parseError) {
            // For backward compatibility with older format
            darkMode = savedTheme === 'dark';
          }
        } else {
          // If not in local storage, try to fetch from Firebase
          const firebaseTheme = await getUserThemePreference();
          
          if (firebaseTheme !== null) {
            darkMode = firebaseTheme;
            // Save to local storage for next time
            await AsyncStorage.setItem(
              STORAGE_KEYS.USER_THEME, 
              JSON.stringify({
                isDarkMode: firebaseTheme,
                updatedAt: new Date().toISOString()
              })
            );
          } else {
            // If neither exist, use system preference
            darkMode = systemColorScheme === 'dark';
          }
        }

        setIsDarkMode(darkMode);
        setTheme(darkMode ? darkTheme : lightTheme);
      } catch (error) {
        console.error('Error loading theme preference:', error);
        // Fall back to system preference if there's an error
        const darkMode = systemColorScheme === 'dark';
        setIsDarkMode(darkMode);
        setTheme(darkMode ? darkTheme : lightTheme);
      } finally {
        setLoading(false);
      }
    };

    loadTheme();
  }, [systemColorScheme]);

  // Function to toggle the theme
  const toggleTheme = async () => {
    try {
      const newIsDarkMode = !isDarkMode;
      setIsDarkMode(newIsDarkMode);
      setTheme(newIsDarkMode ? darkTheme : lightTheme);
      
      // Update local storage
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_THEME, 
        JSON.stringify({
          isDarkMode: newIsDarkMode,
          updatedAt: new Date().toISOString()
        })
      );
      
      // Update Firebase (don't wait for this to complete for better UX)
      saveUserThemePreference(newIsDarkMode).catch(error => {
        console.error('Error saving theme preference to Firebase:', error);
      });

      console.log('Theme toggled to:', newIsDarkMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error toggling theme:', error);
    }
  };

  // Create the theme context value with the current theme and toggle function
  const themeContextValue = {
    isDarkMode,
    theme,
    toggleTheme,
    loading
  };

  return (
    <ThemeContext.Provider value={themeContextValue}>
      {children}
    </ThemeContext.Provider>
  );
}
