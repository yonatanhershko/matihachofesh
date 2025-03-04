import { database } from '../utils/firebaseConfig';
import { ref, set, get, child } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { PATHS, STORAGE_KEYS, HEBREW_GREGORIAN_MONTHS } from '../utils/constants';

/**
 * Get a unique device identifier to use for storing user preferences
 * @returns {Promise<string>} The device ID
 */
export const getDeviceId = async () => {
  try {
    // First check if we already have a stored device ID
    let deviceId = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID);
    
    if (!deviceId) {
      // If no stored ID, generate one based on device info
      if (Device.isDevice) {
        // Use the installationId on real devices if available
        deviceId = Application.androidId || 
                   Application.applicationId || 
                   `${Device.modelName}-${Device.deviceName}-${Date.now()}`;
      } else {
        // For simulators/development, create a random ID
        deviceId = `dev-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
      }
      
      // Save the device ID for future use
      await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
    }
    
    return deviceId;
  } catch (error) {
    console.error('Error getting device ID:', error);
    // Fallback to a timestamp-based ID if all else fails
    return `fallback-${Date.now()}`;
  }
};

/**
 * Save Hebrew-Gregorian months data to Realtime Database with local fallback
 * @param {Object} monthsData - The months data to save
 * @returns {Promise<void>}
 */
export const saveHebrewGregorianMonths = async (monthsData) => {
  try {
    // Always save to local storage as a fallback
    await AsyncStorage.setItem(
      STORAGE_KEYS.HEBREW_MONTHS, 
      JSON.stringify({
        data: monthsData
      })
    );
    
    // Try to save to Firebase - directly save the data without updatedAt field
    const monthsRef = ref(database, PATHS.HEBREW_MONTHS);
    await set(monthsRef, monthsData);
    console.log('Hebrew-Gregorian months data saved to Firebase');
  } catch (error) {
    console.error('Error saving months data to Firebase:', error);
    // Continue with local storage only
    console.log('Using local storage fallback for months data');
  }
};

/**
 * Get Hebrew-Gregorian months data from Realtime Database with local fallback
 * @returns {Promise<Object|null>} - The months data or null if not found
 */
export const getHebrewGregorianMonths = async () => {
  try {
    // Try Firebase first
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, PATHS.HEBREW_MONTHS));
    
    if (snapshot.exists()) {
      console.log('Retrieved months data from Firebase');
      const data = snapshot.val();
      
      // Check data structure - if data has keys like '01', '02', etc., it's the direct format
      if (data['01'] || data['1']) {
        console.log('Using direct format data from Firebase');
        return data;
      } 
      // Otherwise, it might be in the old nested format with a data field
      else if (data.data) {
        console.log('Using nested format data from Firebase');
        return data.data;
      }
      // If the structure is completely different, log it for debugging
      else {
        console.log('Unknown data format from Firebase:', data);
        return null;
      }
    } 
    
    // If Firebase fails or returns no data, try local storage
    const localData = await AsyncStorage.getItem(STORAGE_KEYS.HEBREW_MONTHS);
    if (localData) {
      const parsedData = JSON.parse(localData);
      console.log('Retrieved months data from local storage');
      
      // Check local storage data structure too
      if (parsedData.data) {
        return parsedData.data;
      } else {
        return parsedData;
      }
    }
    
    console.log('No months data found in Firebase or local storage');
    return null;
  } catch (error) {
    console.error('Error getting months data from Firebase:', error);
    
    // Try local storage as fallback
    try {
      const localData = await AsyncStorage.getItem(STORAGE_KEYS.HEBREW_MONTHS);
      if (localData) {
        const parsedData = JSON.parse(localData);
        console.log('Retrieved months data from local storage (fallback)');
        
        // Check local storage data structure
        if (parsedData.data) {
          return parsedData.data;
        } else {
          return parsedData;
        }
      }
    } catch (localError) {
      console.error('Error getting months data from local storage:', localError);
    }
    
    return null;
  }
};

/**
 * Initialize Firebase with default Hebrew-Gregorian months data
 * This should be called once during app startup to ensure data exists
 * @param {Object} defaultData - The default months data to use if none exists
 */
export const initializeMonthsData = async (defaultData) => {
  try {
    // Check if the data already exists
    const existingData = await getHebrewGregorianMonths();
    
    // If data doesn't exist, save the default data
    if (!existingData) {
      await saveHebrewGregorianMonths(defaultData);
      console.log('Initialized with default Hebrew-Gregorian months data');
    }
  } catch (error) {
    console.error('Error initializing months data:', error);
    // Save to local storage as fallback
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.HEBREW_MONTHS, 
        JSON.stringify({
          data: defaultData,
          updatedAt: new Date().toISOString()
        })
      );
      console.log('Initialized local storage with default Hebrew-Gregorian months data');
    } catch (localError) {
      console.error('Error initializing local months data:', localError);
    }
  }
};

/**
 * Save user theme preference with local fallback
 * @param {boolean} isDarkMode - Whether dark mode is enabled
 * @returns {Promise<void>}
 */
export const saveUserThemePreference = async (isDarkMode) => {
  try {
    // Always save to local storage
    await AsyncStorage.setItem(
      STORAGE_KEYS.USER_THEME, 
      JSON.stringify({
        isDarkMode,
        updatedAt: new Date().toISOString()
      })
    );
    
    // Get device ID for Firebase path
    const deviceId = await getDeviceId();
    
    // Try to save to Firebase under device-specific path
    const userPrefsRef = ref(database, `${PATHS.USER_PREFERENCES}/${deviceId}/theme`);
    await set(userPrefsRef, {
      isDarkMode,
      updatedAt: new Date().toISOString()
    });
    console.log('User theme preference saved to Firebase:', isDarkMode ? 'dark' : 'light');
  } catch (error) {
    console.error('Error saving user theme preference to Firebase:', error);
    console.log('Using local storage for theme preference');
  }
};

/**
 * Get user theme preference with local fallback
 * @returns {Promise<boolean|null>} - Whether dark mode is enabled, or null if not found
 */
export const getUserThemePreference = async () => {
  try {
    // Get device ID for Firebase path
    const deviceId = await getDeviceId();
    
    // Try Firebase first with device-specific path
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, `${PATHS.USER_PREFERENCES}/${deviceId}/theme`));
    
    if (snapshot.exists()) {
      return snapshot.val().isDarkMode;
    }
    
    // Try local storage as fallback
    const localData = await AsyncStorage.getItem(STORAGE_KEYS.USER_THEME);
    if (localData) {
      const parsedData = JSON.parse(localData);
      console.log('Retrieved theme preference from local storage');
      return parsedData.isDarkMode;
    }
    
    console.log('No user theme preference found');
    return null;
  } catch (error) {
    console.error('Error getting user theme preference from Firebase:', error);
    
    // Try local storage as fallback
    try {
      const localData = await AsyncStorage.getItem(STORAGE_KEYS.USER_THEME);
      if (localData) {
        const parsedData = JSON.parse(localData);
        console.log('Retrieved theme preference from local storage (fallback)');
        return parsedData.isDarkMode;
      }
    } catch (localError) {
      console.error('Error getting theme preference from local storage:', localError);
    }
    
    return null;
  }
};
