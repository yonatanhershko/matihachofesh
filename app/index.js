import React, { useState, useEffect } from 'react';
import { View, Image, ScrollView, StyleSheet, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getHolidays } from './data/holidays';
import { clearImageCache } from './utils/unsplash';
import { Ionicons } from '@expo/vector-icons';
import { formatHebrewDate, formatRelativeTime, useHebrewGregorianMonths } from './utils/hebrewDate';
import { getHeaderImage } from './utils/unsplash';
import { fetchParasha } from './utils/hebcal';
import { useRouter, usePathname } from 'expo-router';
import { navigateToRoute } from './utils/navigationUtils';
import BottomNavBar from './components/BottomNavBar';
import { useThemeContext } from './context/ThemeContext';
import { HomeScreenSkeleton } from './components/Skeletons';

const fallbackImage = 'https://images.unsplash.com/photo-1584646098378-0874589d76b1?auto=format&fit=crop&w=800';

export default function HomeScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const [holidays, setHolidays] = useState([]);
  const [headerImage, setHeaderImage] = useState(null);
  const [parasha, setParasha] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme, isDarkMode } = useThemeContext();
  const { months: hebrewGregorianMonths, loading: monthsLoading } = useHebrewGregorianMonths();

  useEffect(() => {
    loadHolidays();
    loadHeaderImage();
  }, []);

  useEffect(() => {
    const loadParasha = async () => {
      try {
        const parashaData = await fetchParasha();
        setParasha(parashaData);
      } catch (error) {
        console.error('❌ Error loading parasha:', error);
      }
    };
    loadParasha();
  }, []);

  const openParashaDetails = () => {
    if (parasha && holidays.length > 0) {
      // Find the closest holiday
      const closestHoliday = holidays[0]; // The first one is always the closest one
      
      // Prepare holiday data for serialization
      const serializedHoliday = {
        ...closestHoliday,
        date: closestHoliday.date ? closestHoliday.date.toISOString() : null
      };
      
      // Navigate to parasha detail screen with params (no need to pass theme now)
      router.push({
        pathname: 'parasha-detail',
        params: {
          parasha: JSON.stringify(parasha),
          holiday: JSON.stringify(serializedHoliday),
          hebrewGregorianMonths: JSON.stringify(hebrewGregorianMonths)
        }
      });
    }
  };

  const loadHolidays = async () => {
    try {
      const holidayData = await getHolidays();
      setHolidays(holidayData);
    } catch (error) {
      console.error('Failed to load holidays:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHeaderImage = async () => {
    const imageUrl = await getHeaderImage();
    setHeaderImage(imageUrl);
  };

  const HolidayCard = ({ holiday }) => (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <View style={styles.cardContent}>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.text }]}>{holiday.name}</Text>
          <Text style={[styles.date, { color: theme.secondaryText }]}>
            {formatHebrewDate(holiday.date, hebrewGregorianMonths)} · {formatRelativeTime(holiday.daysLeft)}
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

  if (loading || monthsLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <HomeScreenSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView  style={styles.content} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
       
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.headerText }]}>מתי החופש</Text>
      </View>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <ImageBackground
            source={{ uri: headerImage }}
            style={styles.headerBackground}
            imageStyle={styles.headerBackgroundImage}
          >
            <View style={styles.parashaContainer}>
              {parasha && (
                <>
                  <Text style={styles.parashaFullTitle}>פרשת שבוע</Text>
                  <Text style={styles.parashaName}>{parasha.fullTitle}</Text>
                </>
              )}
            </View>
          </ImageBackground>
        </View>

        {/* Holiday Cards */}
        <View style={styles.holidaysContainer}>
          {holidays.map((holiday) => (
            <HolidayCard key={holiday.id} holiday={holiday} />
          ))}
        </View>
      </ScrollView>

      <BottomNavBar 
        openParashaDetails={openParashaDetails}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    width: '100%',
    height: '100%',
    paddingHorizontal: 20,  
    marginBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  headerTitle: {
    width: '100%',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign:'right'
  },
  headerCard: {
    height: 250,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  headerBackground: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  headerBackgroundImage: {
    opacity: 0.7, // Make the image lighter for better text visibility
  },
  headerOverlay: {
  },
  card: {
    marginVertical: 8,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    gap: 10,  
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'right',
  },
  date: {
    fontSize: 14,
    marginTop: 5,
    textAlign: 'right',
  },
  imageContainer: {
    width: 100,
    height: 56,
    borderRadius: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 0.5,
    borderTopColor: '#ccc',
  },
  navButton: {
    padding: 10,
  },
  parashaContainer: {
    width:'100%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 2,
  },
  parashaFullTitle: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000",
    marginBottom: 5,
  },
  parashaName: {
    fontSize: 22,
    textAlign: "center",
    color: "#000",
    marginBottom: 10,
  },
  parashaDetails: {
    fontSize: 16,
    textAlign: "right",
    color: "#333",
    lineHeight: 24,
    marginTop: 5
  },
  holidaysContainer: {
    marginBottom: 20,
  },
});