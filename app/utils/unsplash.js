import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UNSPLASH_ACCESS_KEY } from '@env';

const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_REQUESTS_PER_HOUR = 50; // Unsplash demo app limit

const imageCache = {};
let requestCount = 0;
let lastRequestTime = 0;

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1584646098378-0874589d76b1?auto=format&fit=crop&w=800';

// Fallback images for when we hit rate limits - all verified working
const fallbackImages = {
  'pesach': DEFAULT_FALLBACK,
  'yom_haatzmaut': 'https://images.unsplash.com/photo-1556804335-2fa563e93aae?auto=format&fit=crop&w=800',
  'lag_baomer': 'https://images.unsplash.com/photo-1517142089942-ba376ce32a2e?auto=format&fit=crop&w=800',
  'shavuot': 'https://images.unsplash.com/photo-1589156569069-7f3a2513f5b5?auto=format&fit=crop&w=800',
  'summer_vacation': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800',
  'rosh_hashana': 'https://images.unsplash.com/photo-1567861911437-538298e4232c?auto=format&fit=crop&w=800',
  'yom_kippur': 'https://images.unsplash.com/photo-1504256624605-c31cde11be74?auto=format&fit=crop&w=800',
  'sukkot': 'https://images.unsplash.com/photo-1601159093357-13f3e2c21faf?auto=format&fit=crop&w=800',
  'chanukah': 'https://images.unsplash.com/photo-1607317146126-72a411daa11c?auto=format&fit=crop&w=800',
  'tu_bishvat': 'https://images.unsplash.com/photo-1518114581056-e54e9f3108f6?auto=format&fit=crop&w=800',
  'purim': 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?auto=format&fit=crop&w=800'
};

// Create axios instance with default config
const unsplashApi = axios.create({
  baseURL: 'https://api.unsplash.com',
  headers: {
    'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
    'Accept-Version': 'v1'
  }
});

const checkRateLimit = () => {
  const now = Date.now();
  if (now - lastRequestTime >= RATE_LIMIT_WINDOW) {
    // Reset counter if window has passed
    requestCount = 0;
    lastRequestTime = now;
    return true;
  }
  return requestCount < MAX_REQUESTS_PER_HOUR;
};

const getFallbackImage = (holidayId) => {
  return fallbackImages[holidayId] || DEFAULT_FALLBACK;
};

export const getHolidayImage = async (searchTerm, holidayId) => {
  try {
    // Check memory cache first
    if (imageCache[holidayId]) {
      const { url, timestamp } = imageCache[holidayId];
      if (Date.now() - timestamp < CACHE_EXPIRY) {
        return url;
      }
    }

    // Check AsyncStorage cache
    const cacheKey = `holiday_image_${holidayId}`;
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const { url, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_EXPIRY) {
        // Update memory cache
        imageCache[holidayId] = { url, timestamp };
        return url;
      }
    }

    // Check rate limit before making request
    if (!checkRateLimit()) {
      console.log('Rate limit reached, using fallback image');
      return getFallbackImage(holidayId);
    }

    // Fetch new image
    requestCount++;
    lastRequestTime = Date.now();
    
    const response = await unsplashApi.get('/photos/random', {
      params: {
        query: searchTerm,
        orientation: 'portrait',
        count: 1
      }
    });

    if (response.data) {
      const imageData = {
        url: response.data.urls.regular,
        timestamp: Date.now()
      };

      // Update both caches
      imageCache[holidayId] = imageData;
      await AsyncStorage.setItem(cacheKey, JSON.stringify(imageData));

      return imageData.url;
    }

    return getFallbackImage(holidayId);
  } catch (error) {
    console.error('Error fetching holiday image:', error.response?.data || error.message);
    return getFallbackImage(holidayId);
  }
};

export const clearImageCache = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const imageCacheKeys = keys.filter(key => key.startsWith('holiday_image_'));
    await AsyncStorage.multiRemove(imageCacheKeys);
    Object.keys(imageCache).forEach(key => delete imageCache[key]);
    console.log('Image cache cleared');
  } catch (error) {
    console.error('Error clearing image cache:', error);
  }
};

export const preloadHolidayImages = async (holidays) => {
  try {
    // Load images sequentially to avoid rate limiting
    const results = [];
    for (const holiday of holidays) {
      const imageUrl = await getHolidayImage(holiday.searchTerm, holiday.id);
      results.push(imageUrl);
      // Add a small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    console.log('Holiday images preloaded');
    return results;
  } catch (error) {
    console.error('Error preloading holiday images:', error);
    return [];
  }
};
