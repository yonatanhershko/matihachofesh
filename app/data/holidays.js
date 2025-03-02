import moment from 'moment-timezone';
import { getHolidayImage, preloadHolidayImages } from '../utils/unsplash';
import { fetchHolidays } from '../utils/hebcal';
import { saveHolidays, loadHolidays } from '../utils/storageService';
import NetInfo from '@react-native-community/netinfo';

export const getHolidays = async () => {
  try {
    // Check network connectivity
    const netInfo = await NetInfo.fetch();
    const isConnected = netInfo.isConnected;

    // Try to load cached holidays first
    const cachedData = await loadHolidays();
    
    // If we're offline and have cached data, use it
    if (!isConnected && cachedData) {
      console.log('Offline: using cached holidays');
      return cachedData.holidays;
    }

    // If we're online or cache is invalid, fetch new data
    if (isConnected && (!cachedData || !cachedData.isCacheValid)) {
      console.log('Fetching fresh holidays data');
      // Fetch holidays from Hebcal API
      const holidays = await fetchHolidays();
      console.log('Fetched holidays count:', holidays.length);
      
      try {
        // Start preloading images in the background
        preloadHolidayImages(holidays);

        // Add images and calculate days left
        const holidaysWithImages = await Promise.all(
          holidays.map(async (holiday) => {
            const imageUrl = await getHolidayImage(holiday.searchTerm, holiday.id);
            const now = moment().tz('Asia/Jerusalem');
            const daysLeft = holiday.date.diff(now, 'days');
            
            console.log(`Processing holiday: ${holiday.englishName}, Date: ${holiday.date.format('YYYY-MM-DD')}, Days left: ${daysLeft}`);
            
            return {
              ...holiday,
              daysLeft,
              imageUrl,
            };
          })
        );

        const upcomingHolidays = holidaysWithImages
          .filter(holiday => holiday.daysLeft >= 0)
          .sort((a, b) => a.daysLeft - b.daysLeft);

        // Save the fresh data to storage
        await saveHolidays(upcomingHolidays);

        console.log('Upcoming holidays count:', upcomingHolidays.length);
        return upcomingHolidays;

      } catch (error) {
        console.error('Error processing holiday images:', error);
        // If we have cached data and encounter an error, use the cache
        if (cachedData) {
          console.log('Error fetching fresh data, using cache');
          return cachedData.holidays;
        }
        // Otherwise, return holidays with fallback images
        const now = moment().tz('Asia/Jerusalem');
        return holidays
          .map(holiday => ({
            ...holiday,
            daysLeft: holiday.date.diff(now, 'days'),
            imageUrl: getDefaultImageForHoliday(holiday.id),
          }))
          .filter(holiday => holiday.daysLeft >= 0)
          .sort((a, b) => a.daysLeft - b.daysLeft);
      }
    }

    // If we're online but cache is still valid, use cached data
    if (cachedData && cachedData.isCacheValid) {
      console.log('Using valid cached data');
      return cachedData.holidays;
    }

  } catch (error) {
    console.error('Error fetching holidays:', error);
    // If we have cached data and encounter an error, use the cache
    const cachedData = await loadHolidays();
    if (cachedData) {
      console.log('Error fetching data, using cache');
      return cachedData.holidays;
    }
    return [];
  }
};
