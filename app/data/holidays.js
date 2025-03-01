import moment from 'moment-timezone';
import { getHolidayImage, preloadHolidayImages } from '../utils/unsplash';
import { fetchHolidays } from '../utils/hebcal';

export const getHolidays = async () => {
  try {
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

      console.log('Upcoming holidays count:', upcomingHolidays.length);
      return upcomingHolidays;

    } catch (error) {
      console.error('Error processing holiday images:', error);
      // Return holidays with fallback images in case of error
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
  } catch (error) {
    console.error('Error fetching holidays:', error);
    return [];
  }
};
