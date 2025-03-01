import React, { useState, useEffect } from 'react';
import { View, Image, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getHolidays } from './data/holidays';
import { clearImageCache } from './utils/unsplash';
import { lightTheme, darkTheme } from './theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { formatHebrewDate, formatRelativeTime } from './utils/hebrewDate';

const fallbackImage = 'https://images.unsplash.com/photo-1584646098378-0874589d76b1?auto=format&fit=crop&w=800';

export default function Home() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const systemColorScheme = useColorScheme();

  useEffect(() => {
    loadTheme();
    loadHolidays();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      } else {
        setIsDarkMode(systemColorScheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

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

  const HolidayCard = ({ holiday }) => (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <View style={styles.cardContent}>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.text }]}>{holiday.name}</Text>
          <Text style={[styles.date, { color: theme.secondaryText }]}>
            {formatHebrewDate(holiday.date)} · {formatRelativeTime(holiday.daysLeft)} ימים שנשארו 
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

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.containerContent}> 
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.headerText }]}>מתי החופש</Text>
      </View>
      
      <Text style={[styles.sectionTitle, { color: theme.text }]}>חופשות קרובות</Text>
      
      <ScrollView style={styles.content}>
        {holidays.map((holiday) => (
          <HolidayCard key={holiday.id} holiday={holiday} />
        ))}
      </ScrollView>

      <View style={[styles.navigation, { backgroundColor: theme.navigationBackground }]}>
       
      <TouchableOpacity style={styles.navButton}>
          <Ionicons name="calendar" size={24} color={theme.navigationIcon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="home" size={24} color={theme.navigationIcon} />
        </TouchableOpacity>
      
        <TouchableOpacity style={styles.navButton} onPress={toggleTheme}>
          <Ionicons 
            name={isDarkMode ? "sunny" : "moon"} 
            size={24} 
            color={theme.navigationIcon}
          />
        </TouchableOpacity>
      </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerContent:{
    width: '100%',
    paddingHorizontal: 22,
    height: '100%',
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingBottom: 20,
    textAlign: 'right',
  },
  content: {
    flex: 1,
  },
  card: {
    marginVertical: 8,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
  },
  textContainer: {
    flex: 1,
    marginRight: 15,
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
});