// Firebase Realtime Database paths
export const PATHS = {
  HEBREW_MONTHS: 'hebrewGregorianMonths',
  USER_PREFERENCES: 'userPreferences'
};

// Local storage keys for fallback
export const STORAGE_KEYS = {
  HEBREW_MONTHS: 'hebrew_gregorian_months',
  USER_THEME: 'user_theme_preference',
  DEVICE_ID: 'device_id'
};

// Hebrew months
export const HEBREW_MONTHS = {
  1: 'תשרי',
  2: 'חשון',
  3: 'כסלו',
  4: 'טבת',
  5: 'שבט',
  6: 'אדר',
  7: 'ניסן',
  8: 'אייר',
  9: 'סיוון',
  10: 'תמוז',
  11: 'אב',
  12: 'אלול'
};

// Hebrew-Gregorian months mapping
// This is the single source of truth for the Hebrew-Gregorian months
export const HEBREW_GREGORIAN_MONTHS = {
  '01': 'ינואר',
  '02': 'פברואר',
  '03': 'מרץ',
  '04': 'אפריל',
  '05': 'מאי',
  '06': 'יוני',
  '07': 'יולי',
  '08': 'אוגוסט',
  '09': 'ספטמבר',
  '10': 'אוקטובר',
  '11': 'נובמבר',
  '12': 'דצמבר'
};
