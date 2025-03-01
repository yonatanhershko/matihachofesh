import moment from 'moment-timezone';

const hebrewMonths = {
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

const hebrewGregorianMonths = {
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

export const formatHebrewDate = (date) => {
  const now = moment().tz('Asia/Jerusalem');
  const day = date.format('D');
  const month = date.format('MM');
  const year = date.format('YYYY');
  const hebrewMonth = hebrewGregorianMonths[month];
  
  // Show year only if it's different from current year
  const currentYear = now.format('YYYY');
  const yearDisplay = year !== currentYear ? ` (${year})` : '';
  
  return `${day} ב${hebrewMonth}${yearDisplay}`;
};

export const formatRelativeTime = (daysLeft) => {
  if (daysLeft === 0) {
    return 'היום!';
  } else if (daysLeft === 1) {
    return 'מחר!';
  } else {
    return `עוד ${daysLeft} ימים`;
  }
};
