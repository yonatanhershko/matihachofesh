import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UNSPLASH_ACCESS_KEY } from '@env';
import moment from 'moment-timezone';

const unsplashApi = axios.create({
  baseURL: 'https://api.unsplash.com',
  headers: {
    Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
  },
});

// Cache duration set to 1 week
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_REQUESTS_PER_HOUR = 50;

// Track API requests
let requestCount = 0;
let lastRequestTime = 0;


// Get current week number (1-52) for the year
const getCurrentWeekNumber = () => {
  return moment().tz('Asia/Jerusalem').week();
};

// Get current year
const getCurrentYear = () => {
  return moment().tz('Asia/Jerusalem').year();
};

// Generate a consistent cache key based on week number and search term
const generateCacheKey = (searchTerm) => {
  const week = getCurrentWeekNumber();
  const year = getCurrentYear();
  return `unsplash_${searchTerm}_${year}_${week}`;
};

export const clearImageCache = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith('unsplash_'));
    await AsyncStorage.multiRemove(cacheKeys);
    console.log('Image cache cleared');
  } catch (error) {
    console.error('Failed to clear image cache:', error);
  }
};

const getCachedImage = async (searchTerm) => {
  try {
    const cacheKey = generateCacheKey(searchTerm);
    const cached = await AsyncStorage.getItem(cacheKey);
    
    if (cached) {
      const { url } = JSON.parse(cached);
      return url;
    }
    return null;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
};

const cacheImage = async (searchTerm, url) => {
  try {
    const cacheKey = generateCacheKey(searchTerm);
    const cacheData = {
      url,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error caching image:', error);
  }
};

const getDefaultImageForHoliday = (holidayId) => {
  const defaultImages = {
    pesach: 'https://images.unsplash.com/photo-1584646098378-0874589d76b1',
    purim: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d',
    chanukah: 'https://images.unsplash.com/photo-1607317146126-54c16c1757c7',
    roshhashana: 'https://images.unsplash.com/photo-1506368249639-73a05d6f6488',
    yomkippur: 'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6',
    sukkot: 'https://images.unsplash.com/photo-1601375863404-5b912f4536df',
    shavuot: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04',
    lagbaomer: 'https://images.unsplash.com/photo-1578950435899-d1c1bf063534',
    tubishvat: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc',
    summer_vacation: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
    yomhaatzmaut: 'https://images.unsplash.com/photo-1542820229-081e0c12af0b'
  };
  return defaultImages[holidayId];
};

export const getHolidayImage = async (searchTerm, holidayId) => {
  try {
    // First check if we have a valid cached image for this week
    const cachedUrl = await getCachedImage(searchTerm);
    if (cachedUrl) {
      return cachedUrl;
    }

    // Check rate limiting
    const now = Date.now();
    if (now - lastRequestTime > RATE_LIMIT_WINDOW) {
      requestCount = 0;
      lastRequestTime = now;
    }

    if (requestCount >= MAX_REQUESTS_PER_HOUR) {
      return getDefaultImageForHoliday(holidayId);
    }

    // Fetch new image from Unsplash
    const response = await unsplashApi.get('/photos/random', {
      params: {
        query: searchTerm,
        orientation: 'landscape',
      }
    });

    requestCount++;
    lastRequestTime = now;

    if (response.data && response.data.urls) {
      const imageUrl = response.data.urls.regular;
      await cacheImage(searchTerm, imageUrl);
      return imageUrl;
    }

    return getDefaultImageForHoliday(holidayId);
  } catch (error) {
    console.error('Error fetching holiday image:', error);
    return getDefaultImageForHoliday(holidayId);
  }
};

export const getHeaderImage = async () => {
  // Use week-based caching for header image
  const cacheKey = `header_image_${getCurrentYear()}_${getCurrentWeekNumber()}`;
  const cachedUrl = await AsyncStorage.getItem(cacheKey);
  
  if (cachedUrl) {
    return cachedUrl;
  }

  try {
    // Fixed list of Jewish-themed queries
    const queries = [
      'torah scroll parchment',
      'jewish manuscript',
      'hebrew scroll',
      'ancient jewish text',
      'sefer torah'
    ];
    
    // Use the week number to consistently select the same query each week
    const weekNumber = getCurrentWeekNumber();
    const queryIndex = weekNumber % queries.length;
    const query = queries[queryIndex];
    
    const response = await unsplashApi.get('/photos/random', {
      params: {
        query: query,
        orientation: 'landscape',
        content_filter: 'high'
      }
    });

    const imageUrl = response.data.urls.regular;
    await AsyncStorage.setItem(cacheKey, imageUrl);
    return imageUrl;
  } catch (error) {
    console.error('Error fetching header image:', error);
    return 'https://images.unsplash.com/photo-1505243542579-da5adfe8338f?w=800&q=80'; // Fallback Torah scroll image
  }
};

export const preloadHolidayImages = async (holidays) => {
  try {
    for (const holiday of holidays) {
      const cachedUrl = await getCachedImage(holiday.searchTerm);
      if (!cachedUrl) {
        await getHolidayImage(holiday.searchTerm, holiday.id);
      }
    }
  } catch (error) {
    console.error('Error preloading images:', error);
  }
};
