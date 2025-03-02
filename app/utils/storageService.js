import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment-timezone';

const STORAGE_KEYS = {
  HOLIDAYS: 'holidays_data',
  LAST_FETCH: 'holidays_last_fetch'
};

// Cache duration of 24 hours
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export const saveHolidays = async (holidays) => {
  try {
    const data = {
      holidays,
      timestamp: Date.now()
    };
    await AsyncStorage.setItem(STORAGE_KEYS.HOLIDAYS, JSON.stringify(data));
    console.log('Holidays saved to storage');
  } catch (error) {
    console.error('Error saving holidays:', error);
  }
};

export const loadHolidays = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.HOLIDAYS);
    if (!data) return null;

    const { holidays, timestamp } = JSON.parse(data);
    const now = moment().tz('Asia/Jerusalem');

    // Filter out past holidays and update days left
    const updatedHolidays = holidays
      .map(holiday => ({
        ...holiday,
        date: moment(holiday.date), // Convert date string back to moment object
        daysLeft: moment(holiday.date).diff(now, 'days')
      }))
      .filter(holiday => holiday.daysLeft >= 0)
      .sort((a, b) => a.daysLeft - b.daysLeft);

    // Check if cache is still valid (less than 24 hours old)
    const isCacheValid = Date.now() - timestamp < CACHE_DURATION;
    
    return {
      holidays: updatedHolidays,
      isCacheValid
    };
  } catch (error) {
    console.error('Error loading holidays:', error);
    return null;
  }
};

export const clearHolidaysCache = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.HOLIDAYS);
    console.log('Holidays cache cleared');
  } catch (error) {
    console.error('Error clearing holidays cache:', error);
  }
};
