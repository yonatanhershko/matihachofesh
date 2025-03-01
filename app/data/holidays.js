import moment from 'moment-timezone';
import { getHolidayImage, preloadHolidayImages } from '../utils/unsplash';

const holidays = [
  {
    id: 'pesach',
    name: 'פסח',
    englishName: 'Passover',
    searchTerm: 'Jewish Passover Seder',
    date: moment('2025-04-18').tz('Asia/Jerusalem'),
  },
  {
    id: 'yom_haatzmaut',
    name: 'יום העצמאות',
    englishName: 'Independence Day',
    searchTerm: 'Israel Independence Day',
    date: moment('2025-05-14').tz('Asia/Jerusalem'),
  },
  {
    id: 'lag_baomer',
    name: 'ל"ג בעומר',
    englishName: 'Lag BaOmer',
    searchTerm: 'Lag BaOmer bonfire ',
    date: moment('2025-05-18').tz('Asia/Jerusalem'),
  },
  {
    id: 'shavuot',
    name: 'שבועות',
    englishName: 'Shavuot',
    searchTerm: 'Jewish Shavuot',
    date: moment('2025-06-04').tz('Asia/Jerusalem'),
  },
  {
    id: 'summer_vacation',
    name: 'חופש גדול',
    englishName: 'Summer Vacation',
    searchTerm: 'summer beach',
    date: moment('2025-06-23').tz('Asia/Jerusalem'),
  },
  {
    id: 'rosh_hashana',
    name: 'ראש השנה',
    englishName: 'Rosh Hashana',
    searchTerm: 'Jewish New Year',
    date: moment('2025-09-23').tz('Asia/Jerusalem'),
  },
  {
    id: 'yom_kippur',
    name: 'יום כיפור',
    englishName: 'Yom Kippur',
    searchTerm: 'Yom Kippur',
    date: moment('2025-10-02').tz('Asia/Jerusalem'),
  },
  {
    id: 'sukkot',
    name: 'סוכות',
    englishName: 'Sukkot',
    searchTerm: 'Jewish Sukkah holiday',
    date: moment('2025-10-07').tz('Asia/Jerusalem'),
  },
  {
    id: 'chanukah',
    name: 'חנוכה',
    englishName: 'Hanukkah',
    searchTerm: 'Hanukkah',
    date: moment('2025-12-25').tz('Asia/Jerusalem'),
  },
  {
    id: 'tu_bishvat',
    name: 'ט"ו בשבט',
    englishName: 'Tu BiShvat',
    searchTerm: 'tree planting',
    date: moment('2026-01-14').tz('Asia/Jerusalem'),
  },
  {
    id: 'purim',
    name: 'פורים',
    englishName: 'Purim',
    searchTerm: 'Purim carnival',
    date: moment('2025-03-14').tz('Asia/Jerusalem'),
  },
];

export const getHolidays = async () => {
  const now = moment().tz('Asia/Jerusalem');
  
  try {
    // Start preloading images in the background
    preloadHolidayImages(holidays);

    // Add images and calculate days left
    const holidaysWithImages = await Promise.all(
      holidays.map(async (holiday) => {
        const imageUrl = await getHolidayImage(holiday.searchTerm, holiday.id);
        console.log(`Got image for ${holiday.englishName} (${holiday.id}): ${imageUrl}`);
        return {
          ...holiday,
          daysLeft: holiday.date.diff(now, 'days'),
          imageUrl,
        };
      })
    );

    return holidaysWithImages
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .filter(holiday => holiday.daysLeft >= 0);
  } catch (error) {
    console.error('Error processing holidays:', error);
    // Return holidays with fallback images in case of error
    return holidays
      .map(holiday => ({
        ...holiday,
        daysLeft: holiday.date.diff(now, 'days'),
        imageUrl: `https://images.unsplash.com/photo-1584646098378-0874589d76b1?auto=format&fit=crop&w=800`,
      }))
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .filter(holiday => holiday.daysLeft >= 0);
  }
};
