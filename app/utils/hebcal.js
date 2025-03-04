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


    return holidays;
  } catch (error) {
    console.error('Error fetching holidays from Hebcal:', error);
    throw error;
  }
};

export const fetchParasha = async () => {
  try {
    // Get current date in YYYY-MM-DD format
    const now = moment().tz("Asia/Jerusalem");
    const date = now.format("YYYY-MM-DD");

    // First get the parasha name from Hebcal API
    const hebcalResponse = await axios.get('https://www.hebcal.com/shabbat', {
      params: {
        cfg: 'json',
        geonameid: 293397,
        date: date,
        lg: 'h'
      }
    });

    const parashaItem = hebcalResponse.data.items.find(item => item.category === 'parashat');
    if (!parashaItem) {
      console.log("No parasha found in Hebcal");
      return null;
    }

    // Get the parasha name from Hebcal
    const parashaName = parashaItem.hebrew.replace("פרשת", "").trim();
    const fullTitle = parashaItem.hebrew;

    // Now get the text from Sefaria's calendar API
    const calendarResponse = await axios.get(
      `https://www.sefaria.org/api/calendars?timezone=Asia/Jerusalem&date=${date}`
    );
    
    // Find the parashat hashavua event to get the reference
    const parashaEvent = calendarResponse.data.calendar_items.find(
      (item) => item.title && item.title.he && item.ref && (
        item.category === "parashat" || 
        item.title.he.includes("פרשת")
      )
    );

    if (!parashaEvent) {
      console.log("No parasha found in Sefaria calendar");
      return {
        name: parashaName,
        fullTitle: fullTitle,
        date: now.format("YYYY-MM-DD"),
        description: parashaItem.memo || ""  // Fallback to Hebcal memo
      };
    }

    // Get the parasha text from Sefaria
    const parashaRef = parashaEvent.ref;
    
    const textResponse = await axios.get(
      `https://www.sefaria.org/api/texts/${parashaRef}?language=he`
    );

    // Get first three verses
    const verses = Array.isArray(textResponse.data.he) 
      ? textResponse.data.he.slice(0, 3).join(" ") 
      : textResponse.data.he;

    const result = {
      name: parashaName,
      fullTitle: fullTitle,  // Using Hebcal's title
      date: now.format("YYYY-MM-DD"),
      description: verses || parashaItem.memo || ""  // Fallback to Hebcal memo if no verses
    };

    return result;

  } catch (error) {
    console.error("❌ Error fetching parasha:", error);
    console.error("🔍 Error details:", error.response?.data || error.message);
    return null;
  }
};
