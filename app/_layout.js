import React, { useEffect } from 'react';
import { Slot } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast, { ToastProvider } from 'react-native-toast-notifications';
import { ThemeProvider } from '@shopify/restyle';
import { lightTheme, darkTheme } from './theme';
import { app } from './utils/firebaseConfig';
import { initializeFirebaseMonths } from './utils/hebrewDate';
import { useThemePreference } from './services/userPreferencesService';

export default function RootLayout() {
  const { isDarkMode, loading } = useThemePreference();
  
  useEffect(() => {
    // Initialize Firebase data
    const initializeFirebase = async () => {
      try {
        // Initialize the Hebrew-Gregorian months data in Firebase
        await initializeFirebaseMonths();
        console.log('Firebase initialized successfully');
      } catch (error) {
        console.error('Error initializing Firebase:', error);
      }
    };
    
    initializeFirebase();
  }, []);
  
  // Use a simplified theme while loading to avoid flash of wrong theme
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <Slot />
      </View>
    );
  }
  
  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <ToastProvider>
        <View style={{ flex: 1 }}>
          <Toast />
          <Slot />
        </View>
      </ToastProvider>
    </ThemeProvider>
  );
}