import moment from 'moment-timezone';
import { useEffect, useState } from 'react';
import { 
  saveHebrewGregorianMonths, 
  getHebrewGregorianMonths
} from '../services/firebaseService';
import { HEBREW_MONTHS, HEBREW_GREGORIAN_MONTHS } from './constants';

// Initialize Firebase with the default data when the app starts
export const initializeFirebaseMonths = async () => {
  try {
    const existingMonths = await getHebrewGregorianMonths();
    
    if (!existingMonths) {
      console.log('Initializing Hebrew-Gregorian months in Firebase');
      await saveHebrewGregorianMonths(HEBREW_GREGORIAN_MONTHS);
      return true;
    } else {
      console.log('Hebrew-Gregorian months already exist in Firebase');
      return false;
    }
  } catch (error) {
    console.error('Error initializing months in Firebase:', error);
    return false;
  }
};

// Custom hook to get Hebrew-Gregorian months from Firebase
export const useHebrewGregorianMonths = () => {
  const [months, setMonths] = useState(HEBREW_GREGORIAN_MONTHS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMonths = async () => {
      try {
        setLoading(true);
        const firebaseMonths = await getHebrewGregorianMonths();
        
        if (firebaseMonths) {
          // Handle both data formats - the old nested format and the new direct format
          if (typeof firebaseMonths === 'object') {
            setMonths(firebaseMonths);
          }
        } else {
          // If no data in Firebase, save the default data
          console.log('No months data in Firebase, using default');
          await saveHebrewGregorianMonths(HEBREW_GREGORIAN_MONTHS);
        }
      } catch (err) {
        console.error('Error fetching Hebrew-Gregorian months:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMonths();
  }, []);

  return { months, loading, error };
};

export const formatHebrewDate = (date, customMonths = null) => {
  const now = moment().tz('Asia/Jerusalem');
  const day = date.format('D');
  const month = date.format('MM');
  const year = date.format('YYYY');
  
  // Use custom months if provided (from Firebase), otherwise use default
  const monthsData = customMonths || HEBREW_GREGORIAN_MONTHS;
  const hebrewMonth = monthsData[month];
  
  // Show year only if it's different from current year
  const currentYear = now.format('YYYY');
  const yearDisplay = year !== currentYear ? ` (${year})` : '';
  
  return `${day} ב${hebrewMonth}${yearDisplay}`;
};

export const formatRelativeTime = (daysLeft) => {
  if (daysLeft === 0) {
    return 'היום';
  } else if (daysLeft === 1) {
    return 'מחר';
  } else {
    // Change order for proper RTL display in context
    return `${daysLeft} ימים שנשארו`;
  }
};
