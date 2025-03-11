import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { formatRelativeTime } from './utils/hebrewDate';
import { useLocalSearchParams, useRouter, usePathname } from 'expo-router';
import { navigateToRoute } from './utils/navigationUtils';
import moment from 'moment-timezone';
import BottomNavBar from './components/BottomNavBar';
import { useThemeContext } from './context/ThemeContext';

const fallbackImage = 'https://images.unsplash.com/photo-1584646098378-0874589d76b1?auto=format&fit=crop&w=800';

// Safe function to format Hebrew dates that handles undefined format method
const safeFormatHebrewDate = (date, format) => {
  try {
    // If the date is an ISO string (from navigation params), parse it first
    if (typeof date === 'string') {
      return moment(date).format(format);
    }
    
    // Otherwise, use the date object's format method
    if (date && typeof date.format === 'function') {
      return date.format(format);
    }
    
    // If format method doesn't exist or date is invalid, return a default value
    return 'תאריך לא זמין';
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'תאריך לא זמין';
  }
};

export default function ParashaDetailScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useLocalSearchParams();
  const { theme } = useThemeContext();
  
  // Parse JSON params
  const parasha = params.parasha ? JSON.parse(params.parasha) : null;
  const holiday = params.holiday ? JSON.parse(params.holiday) : null;
  const hebrewGregorianMonths = params.hebrewGregorianMonths ? JSON.parse(params.hebrewGregorianMonths) : [];
  
  const HolidayCard = ({ holiday }) => (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <View style={styles.cardContent}>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.text }]}>{holiday.name}</Text>
          <Text style={[styles.date, { color: theme.secondaryText }]}>
            {holiday.date ? safeFormatHebrewDate(holiday.date, hebrewGregorianMonths) : 'תאריך לא זמין'} 
            {holiday.daysLeft !== undefined ? ` · ${formatRelativeTime(holiday.daysLeft)} ימים שנשארו` : ''}
          </Text>
        </View>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: holiday.imageUrl || fallbackImage }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      </View>
    </View>
  );

  if (!parasha || !holiday) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  // Function to open parasha details (stays on the same page)
  const openParashaDetails = () => {
    // Already on parasha details page, no need to navigate
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
          <Text style={[styles.backText, { color: theme.text }]}>Back</Text>
        </TouchableOpacity>


  {/* Parasha Detail Content */}
  <View style={styles.parashaDetailContainer}>
          <Text style={[styles.parashaTitle, { color: theme.text }]}>{parasha.fullTitle}</Text>
          <Text style={[styles.parashaDescription, { color: theme.secondaryText }]}>
            {parasha.description || 'No description available'}
          </Text>
          
          {/* Add more parasha details as needed */}
        </View>

        {/* Parasha Title */}
        <Text style={[styles.title, { color: theme.headerText }]}>
          {parasha.title}
        </Text>



        {/* Holiday Card */}
        <View style={styles.holidayContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>החופש הקרוב</Text>
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.cardContent}>
              <View style={styles.textContainer}>
                <Text style={[styles.holidayTitle, { color: theme.text }]}>{holiday.name || holiday.title}</Text>
                <Text style={[styles.holidayDate, { color: theme.secondaryText }]}>
                  {holiday.date ? safeFormatHebrewDate(holiday.date, 'D MMMM YYYY') : 'תאריך לא זמין'}
                </Text>
                <Text style={[styles.daysLeftText, { color: theme.secondaryText }]}>
                  {formatRelativeTime(
                    typeof holiday.date === 'string' ? moment(holiday.date) : holiday.date
                  )}
                </Text>
              </View>
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: holiday.imageUrl || fallbackImage }}
                  style={styles.image}
                  resizeMode="cover"
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavBar 
        openParashaDetails={openParashaDetails}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 80, // Make room for navigation bar
  },
  content: {
    flex: 1,
    padding: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'right',
  },
  holidayContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'right',
  },
  card: {
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  parashaDetailContainer: {
    marginBottom: 24,
  },
  parashaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'right',
  },
  parashaDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'right',
  },
  holidayContainer: {
    marginBottom: 24,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  holidayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'right',
  },
  holidayDate: {
    fontSize: 14,
    textAlign: 'right',
    marginBottom: 4,
  },
  daysLeftText: {
    fontSize: 14,
    textAlign: 'right',
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
