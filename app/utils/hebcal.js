import axios from 'axios';
import moment from 'moment-timezone';
import { generateHolidayId } from './utilService';

const hebcalApi = axios.create({
  baseURL: 'https://www.hebcal.com/hebcal',
});

const HOLIDAY_MAPPINGS = {
  'Pesach I': { baseId: 'pesach', name: 'פסח', englishName: 'Passover', searchTerm: 'passover seder matzah' },
  'Yom HaAtzma\'ut': { baseId: 'yomhaatzmaut', name: 'יום העצמאות', englishName: 'Independence Day', searchTerm: 'israel flag celebration party' },
  'Lag BaOmer': { baseId: 'lagbaomer', name: 'ל"ג בעומר', englishName: 'Lag BaOmer', searchTerm: 'bonfire Lag BaOmer' },
  'Shavuot': { baseId: 'shavuot', name: 'שבועות', englishName: 'Shavuot', searchTerm: 'Jewish Shavuot' },
  'Rosh Hashana': { baseId: 'roshhashana', name: 'ראש השנה', englishName: 'Rosh Hashana', searchTerm: 'Jewish New Year' },
  'Yom Kippur': { baseId: 'yomkippur', name: 'יום כיפור', englishName: 'Yom Kippur', searchTerm: 'Yom Kippur' },
  'Sukkot I': { baseId: 'sukkot', name: 'סוכות', englishName: 'Sukkot', searchTerm: 'Jewish Sukkah holiday' },
  'Chanukah: 1 Candle': { baseId: 'chanukah', name: 'חנוכה', englishName: 'Hanukkah', searchTerm: 'hanukkah menorah candles' },
  'Tu BiShvat': { baseId: 'tubishvat', name: 'ט"ו בשבט', englishName: 'Tu BiShvat', searchTerm: 'tree planting' },
  'Purim': { baseId: 'purim', name: 'פורים', englishName: 'Purim', searchTerm: 'hamantaschen' }
};

// Add summer vacation manually since it's not a religious holiday
const SUMMER_VACATION = {
  baseId: 'summer_vacation',
  name: 'חופש גדול',
  englishName: 'Summer Vacation',
  searchTerm: 'summer beach',
  date: moment('2025-06-21').tz('Asia/Jerusalem'), // This is approximate and should be updated yearly
};

export const fetchHolidays = async () => {
  try {
    const now = moment().tz('Asia/Jerusalem');
    const currentYear = now.year();
    
    const params = {
      cfg: 'json',
      major: '1',
      year: `${currentYear}`,
      month: 'x',
      timezone: 'Asia/Jerusalem',
    };

    console.log('Fetching holidays for year:', currentYear);
    const response = await hebcalApi.get('', { params });
    
    let holidays = response.data.items
      .filter(item => HOLIDAY_MAPPINGS[item.title])
      .map(item => {
        const holidayDate = moment.tz(item.date, 'Asia/Jerusalem');
        const mapping = HOLIDAY_MAPPINGS[item.title];
        return {
          ...mapping,
          id: generateHolidayId(mapping.baseId, holidayDate),
          date: holidayDate,
        };
      });

    // Add summer vacation with unique ID
    const summerVacation = {
      ...SUMMER_VACATION,
      id: generateHolidayId(SUMMER_VACATION.baseId, SUMMER_VACATION.date),
    };
    holidays.push(summerVacation);

    // If we're close to the end of the year, fetch next year's holidays too
    if (now.month() >= 9) { // If we're in October or later
      console.log('Fetching next year holidays');
      params.year = `${currentYear + 1}`;
      const nextYearResponse = await hebcalApi.get('', { params });
      const nextYearHolidays = nextYearResponse.data.items
        .filter(item => HOLIDAY_MAPPINGS[item.title])
        .map(item => {
          const holidayDate = moment.tz(item.date, 'Asia/Jerusalem');
          const mapping = HOLIDAY_MAPPINGS[item.title];
          return {
            ...mapping,
            id: generateHolidayId(mapping.baseId, holidayDate),
            date: holidayDate,
          };
        });
      holidays = [...holidays, ...nextYearHolidays];
    }

    // Filter out past holidays and sort by date
    holidays = holidays
      .filter(holiday => holiday.date.isAfter(now))
      .sort((a, b) => a.date.valueOf() - b.date.valueOf());

    console.log('Fetched holidays:', holidays.map(h => ({ 
      name: h.englishName, 
      date: h.date.format('YYYY-MM-DD'),
      id: h.id,
      daysUntil: h.date.diff(now, 'days')
    })));

    return holidays;
  } catch (error) {
    console.error('Error fetching holidays from Hebcal:', error);
    throw error;
  }
};
