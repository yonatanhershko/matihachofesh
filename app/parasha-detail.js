import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { formatRelativeTime } from './utils/hebrewDate';
import { useLocalSearchParams, useRouter, usePathname } from 'expo-router';
import { navigateToRoute } from './utils/navigationUtils';
import moment from 'moment-timezone';

const fallbackImage = 'https://images.unsplash.com/photo-1584646098378-0874589d76b1?auto=format&fit=crop&w=800';

export default function ParashaDetailScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useLocalSearchParams();
  
  // Parse JSON params
  const parasha = params.parasha ? JSON.parse(params.parasha) : null;
  const holiday = params.holiday ? JSON.parse(params.holiday) : null;
  const hebrewGregorianMonths = params.hebrewGregorianMonths ? JSON.parse(params.hebrewGregorianMonths) : [];
  const theme = params.theme ? JSON.parse(params.theme) : null;

  // Safe formatting function for Hebrew date to handle potential undefined format method
  const safeFormatHebrewDate = (dateObj, months) => {
    try {
      if (!dateObj) {
        return 'תאריך לא זמין';
      }
      
      // Convert string date to moment object if it's not already
      const date = typeof dateObj === 'string' ? moment(dateObj) : moment(dateObj);
      
      if (!date.isValid()) {
        return 'תאריך לא תקין';
      }
      
      const day = date.format('D');
      const month = date.format('MM');
      
      // Use months if available
      const monthsData = months || {};
      const hebrewMonth = monthsData[month] || 'חודש לא ידוע';
      
      return `${day} ב${hebrewMonth}`;
    } catch (error) {
      console.error('Error formatting Hebrew date:', error);
      return 'שגיאה בתאריך';
    }
  };

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
      <SafeAreaView style={[styles.container, { backgroundColor: theme?.background || '#fff' }]}>
        <Text style={{ color: theme?.text || '#000' }}>Loading...</Text>
      </SafeAreaView>
    );
  }

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

        {/* Holiday Card */}
        <View style={styles.holidayContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>החופש הקרוב</Text>
          <HolidayCard holiday={holiday} />
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.navigation, { backgroundColor: theme.navigationBackground }]}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigateToRoute(pathname, router, 'parasha-detail')}
        >
          <Ionicons name="calendar" size={24} color={theme.navigationIcon} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigateToRoute(pathname, router, '/')}
        >
          <Ionicons name="home" size={24} color={theme.navigationIcon} />
        </TouchableOpacity>
      
        <TouchableOpacity style={styles.navButton}>
          <Ionicons 
            name={theme.dark ? "sunny" : "moon"} 
            size={24} 
            color={theme.navigationIcon} 
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'right',
  },
  card: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'right',
  },
  date: {
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
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
  },
});
