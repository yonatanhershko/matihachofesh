import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { saveUserThemePreference, getUserThemePreference } from './firebaseService';

const STORAGE_KEYS = {
  THEME: 'theme',
};

/**
 * Custom hook to manage user theme preferences
 * Uses both AsyncStorage (for immediate local access) and Firebase (for persistence across devices)
 * @returns {Object} The theme preference state and setter
 */
export const useThemePreference = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const systemColorScheme = useColorScheme();

  // Load theme preference on component mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        setLoading(true);
        // First try to get theme from local storage for immediate UI update
        const savedTheme = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
        
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'dark');
        } else {
          // If not in local storage, try to fetch from Firebase
          const firebaseTheme = await getUserThemePreference();
          
          if (firebaseTheme !== null) {
            setIsDarkMode(firebaseTheme);
            // Save to local storage for next time
            await AsyncStorage.setItem(STORAGE_KEYS.THEME, firebaseTheme ? 'dark' : 'light');
          } else {
            // If neither exist, use system preference
            const useSystemTheme = systemColorScheme === 'dark';
            setIsDarkMode(useSystemTheme);
          }
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
        // Fall back to system preference if there's an error
        setIsDarkMode(systemColorScheme === 'dark');
      } finally {
        setLoading(false);
      }
    };

    loadTheme();
  }, [systemColorScheme]);

  // Function to update theme preference
  const setThemePreference = async (darkMode) => {
    try {
      setIsDarkMode(darkMode);
      
      // Update local storage
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, darkMode ? 'dark' : 'light');
      
      // Update Firebase (don't wait for this to complete for better UX)
      saveUserThemePreference(darkMode).catch(error => {
        console.error('Error saving theme preference to Firebase:', error);
      });
    } catch (error) {
      console.error('Error setting theme preference:', error);
    }
  };

  return { 
    isDarkMode, 
    setThemePreference, 
    loading 
  };
};
