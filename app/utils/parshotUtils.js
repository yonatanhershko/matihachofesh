import parshotData from '../data/parshot.json';
import axios from 'axios';
import moment from 'moment-timezone';

/**
 * Determines if a Hebrew year is a leap year
 * In the Hebrew calendar, leap years follow the 19-year Metonic cycle
 * Years 3, 6, 8, 11, 14, 17, and 19 in this cycle are leap years
 * @param {number} hebrewYear - The Hebrew year to check
 * @returns {boolean} - True if it's a leap year, false otherwise
 */
export const isHebrewLeapYear = (hebrewYear) => {
  // Calculate position in the 19-year Metonic cycle
  const position = (hebrewYear % 19) + 1;
  
  // Check if position corresponds to a leap year in the cycle
  return [3, 6, 8, 11, 14, 17, 19].includes(position);
};

/**
 * Get the current Hebrew year from Hebcal API
 * @returns {Promise<number>} - The current Hebrew year as a number
 */
export const getCurrentHebrewYear = async () => {
  try {
    const now = moment().tz('Asia/Jerusalem');
    const date = now.format('YYYY-MM-DD');
    
    const response = await axios.get('https://www.hebcal.com/converter', {
      params: {
        cfg: 'json',
        date: date,
        g2h: 1
      }
    });
    
    return parseInt(response.data.hy);
  } catch (error) {
    console.error('Error getting Hebrew year:', error);
    // Fallback to estimating the Hebrew year (very rough estimate)
    const now = new Date();
    return now.getFullYear() + 3760;
  }
};

/**
 * Gets a specific parasha by ID
 * @param {number} id - The ID of the parasha to retrieve
 * @returns {Object|null} The parasha object or null if not found
 */
export const getParashaById = (id) => {
  const parasha = parshotData.parshot.find(p => p.id === id);
  return parasha || null;
};

/**
 * Get a combined parasha by combined ID (e.g. "22-23")
 * @param {string} combinedId - The combined ID in format "id1-id2"
 * @returns {Object|null} The combined parasha object or null if not found
 */
export const getCombinedParashaById = (combinedId) => {
  const combinedParasha = parshotData.combinedParshot.find(p => p.id === combinedId);
  return combinedParasha || null;
};

/**
 * Gets the appropriate parasha based on a Hebrew date and whether it's a leap year
 * @param {string} hebrewDate - The Hebrew date in format "YYYY-MM-DD" or moment object
 * @param {number|null} parashaNumber - The number of the parasha in the yearly cycle
 * @returns {Promise<Object>} The parasha object, either a regular or combined parasha
 */
export const getParashaForDate = async (hebrewDate, parashaNumber = null) => {
  // Convert hebrewDate to moment object if it's a string
  const hebrewDateObj = typeof hebrewDate === 'string' 
    ? moment(hebrewDate) 
    : hebrewDate;
  
  // Get the Hebrew year for the date
  const response = await axios.get('https://www.hebcal.com/converter', {
    params: {
      cfg: 'json',
      date: hebrewDateObj.format('YYYY-MM-DD'),
      g2h: 1
    }
  });
  
  const hebrewYear = parseInt(response.data.hy);
  const leapYear = isHebrewLeapYear(hebrewYear);
  
  // If no parashaNumber provided, try to get it from Hebcal API
  if (!parashaNumber) {
    try {
      const hebcalResponse = await axios.get('https://www.hebcal.com/shabbat', {
        params: {
          cfg: 'json',
          geonameid: 293397, // Jerusalem
          date: hebrewDateObj.format('YYYY-MM-DD'),
          lg: 'h'
        }
      });
      
      const parashaItem = hebcalResponse.data.items.find(item => item.category === 'parashat');
      if (parashaItem) {
        // Map the parasha name to our ID system
        // This would need a more comprehensive mapping for production
        // For now, we'll just use a placeholder approach
        const parashaName = parashaItem.title;
        
        // Find the parasha by name in our data
        const foundParasha = parshotData.parshot.find(
          p => p.name.toLowerCase() === parashaName.toLowerCase() ||
               p.hebrewName === parashaItem.hebrew.replace("פרשת", "").trim()
        );
        
        if (foundParasha) {
          parashaNumber = foundParasha.id;
        }
      }
    } catch (error) {
      console.error('Error getting parasha from Hebcal:', error);
    }
  }
  
  // If we still don't have a parashaNumber, return null
  if (!parashaNumber) {
    return null;
  }
  
  // In a regular (non-leap) year, some parshiot are combined
  if (!leapYear) {
    // Check if this parashaNumber corresponds to a week when parshiot are combined
    const combinedWeeks = {
      22: "22-23", // Vayakhel-Pekudei
      27: "27-28", // Tazria-Metzora
      29: "29-30", // Achrei Mot-Kedoshim
      32: "32-33", // Behar-Bechukotai
      42: "42-43", // Matot-Masei
      51: "51-52"  // Nitzavim-Vayeilech
    };
    
    if (combinedWeeks[parashaNumber]) {
      return getCombinedParashaById(combinedWeeks[parashaNumber]);
    }
  }
  
  // Regular case - just return the parasha by number
  return getParashaById(parashaNumber);
};

/**
 * Gets all parshot
 * @returns {Array} Array of all parshot
 */
export const getAllParshot = () => {
  return parshotData.parshot;
};

/**
 * Gets all combined parshot
 * @returns {Array} Array of all combined parshot
 */
export const getAllCombinedParshot = () => {
  return parshotData.combinedParshot;
};

export default {
  getParashaById,
  getCombinedParashaById,
  getParashaForDate,
  getAllParshot,
  getAllCombinedParshot,
  isHebrewLeapYear,
  getCurrentHebrewYear
};
