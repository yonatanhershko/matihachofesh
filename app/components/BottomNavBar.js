import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { navigateToRoute } from '../utils/navigationUtils';
import { useThemeContext } from '../context/ThemeContext';

export default function BottomNavBar({ 
  openParashaDetails 
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isDarkMode, theme, toggleTheme } = useThemeContext();
  
  return (
    <View style={[styles.navigation, { backgroundColor: theme.navigationBackground }]}>
      <TouchableOpacity 
        style={styles.navButton}
        onPress={openParashaDetails}
      >
        <Ionicons name="calendar" size={24} color={theme.navigationIcon} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => navigateToRoute(pathname, router, '/')}
      >
        <Ionicons name="home" size={24} color={theme.navigationIcon} />
      </TouchableOpacity>
    
      <TouchableOpacity style={styles.navButton} onPress={toggleTheme}>
        <Ionicons 
          name={isDarkMode ? "sunny" : "moon"} 
          size={24} 
          color={theme.navigationIcon} 
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
  },
});
