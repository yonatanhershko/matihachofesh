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
      <View style={styles.imageContainer}>
          <Image
            source={{ uri: holiday.imageUrl || fallbackImage }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.text }]}>{holiday.name}</Text>
          <Text style={[styles.date, { color: theme.secondaryText }]}>
            {holiday.date ? safeFormatHebrewDate(holiday.date, 'D MMMM YYYY') : 'תאריך לא זמין'} 
            {holiday.daysLeft !== undefined ? ` · ${formatRelativeTime(holiday.daysLeft)}` : ''}
          </Text>
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
       
  {/* Parasha Detail Content */}
  <View style={styles.parashaDetailContainer}>
          <Text style={[styles.parashaTitle, { color: theme.text }]}>{parasha.fullTitle}</Text>
          <Text style={[styles.parashaDescription, { color: theme.secondaryText }]}>
            {parasha.description || 'No description available'}
          </Text>
          
          {/* Add more parasha details as needed */}
        </View>

        {/* Holiday Card */}
        <View style={styles.holidayContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>החופש הקרוב</Text>
          <HolidayCard holiday={holiday} />
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  date: {
    fontSize:16,
    textAlign: 'center',
    width: '100%',
  },
  holidayContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
  },
  parashaDetailContainer: {
    marginVertical: 24,
  },
  parashaTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  parashaDescription: {
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'right',
  },
  cardContent: {
    width:'100%',
    flexDirection: 'column',
    padding: 16,
    gap:10,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    alignSelf:'center',
    width: 180,
    height: 180,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
