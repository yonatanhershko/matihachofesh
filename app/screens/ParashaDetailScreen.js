import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { formatHebrewDate, formatRelativeTime } from '../utils/hebrewDate';

const fallbackImage = 'https://images.unsplash.com/photo-1584646098378-0874589d76b1?auto=format&fit=crop&w=800';

export default function ParashaDetailScreen({ route, navigation }) {
  const { parasha, holiday, hebrewGregorianMonths, theme } = route.params;

  const HolidayCard = ({ holiday }) => (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <View style={styles.cardContent}>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.text }]}>{holiday.name}</Text>
          <Text style={[styles.date, { color: theme.secondaryText }]}>
            {formatHebrewDate(holiday.date, hebrewGregorianMonths)} · {formatRelativeTime(holiday.daysLeft)} ימים שנשארו 
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>פרשת השבוע</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.parashaInfoContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.parashaTitle, { color: theme.text }]}>{parasha.fullTitle}</Text>
          <Text style={[styles.parashaDate, { color: theme.secondaryText }]}>
            {parasha.date}
          </Text>
          <Text style={[styles.parashaDescription, { color: theme.text }]}>
            {parasha.description || 'אין תיאור זמין'}
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>החג הקרוב</Text>
        </View>

        {holiday && <HolidayCard holiday={holiday} />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  parashaInfoContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  parashaTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  parashaDate: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  parashaDescription: {
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'right',
  },
  sectionHeader: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'right',
  },
  date: {
    fontSize: 14,
    textAlign: 'right',
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
