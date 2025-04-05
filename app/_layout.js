import React, { useEffect } from 'react';
import { Slot } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import Toast, { ToastProvider } from 'react-native-toast-notifications';
import { initializeFirebaseMonths } from './utils/hebrewDate';
import { ThemeProvider, useThemeContext } from './context/ThemeContext';
import { HomeScreenSkeleton } from './components/Skeletons';

function MainApp() {
  const { loading, theme } = useThemeContext();
  
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <HomeScreenSkeleton />
      </View>
    );
  }
  
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Slot />
    </View>
  );
}

export default function RootLayout() {
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
  
  return (
    <ThemeProvider>
      <ToastProvider>
        <Toast />
        <MainApp />
      </ToastProvider>
    </ThemeProvider>
  );
}