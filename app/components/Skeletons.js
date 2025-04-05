import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);
// const { width } = useWindowDimensions();

// Shimmer for the big parasha card on the home screen
export const ParashaCardSkeleton = () => (
  <View style={styles.parashaCardContainer}>
    <ShimmerPlaceholder
      shimmerStyle={styles.parashaCardShimmer}
      shimmerColors={['#e0e0e0', '#f5f5f5', '#e0e0e0']}
    />
    <View style={styles.parashaTextContainer}>
      <ShimmerPlaceholder
        shimmerStyle={styles.parashaHeaderShimmer}
        shimmerColors={['#e0e0e0', '#f5f5f5', '#e0e0e0']}
      />
      <ShimmerPlaceholder
        shimmerStyle={styles.parashaNameShimmer}
        shimmerColors={['#e0e0e0', '#f5f5f5', '#e0e0e0']}
      />
    </View>
  </View>
);

// Shimmer for holiday cards on the home screen
export const HolidayCardSkeleton = () => (
  <View style={styles.holidayCardContainer}>
    <View style={styles.holidayCardContent}>
      <View style={styles.holidayTextContainer}>
        <ShimmerPlaceholder
          shimmerStyle={[styles.holidayTitleShimmer, { alignSelf: 'flex-end' }]}
          shimmerColors={['#e0e0e0', '#f5f5f5', '#e0e0e0']}
        />
        <ShimmerPlaceholder
          shimmerStyle={[styles.holidayDateShimmer, { alignSelf: 'flex-end' }]}
          shimmerColors={['#e0e0e0', '#f5f5f5', '#e0e0e0']}
        />
      </View>
      <ShimmerPlaceholder
        shimmerStyle={styles.holidayImageShimmer}
        shimmerColors={['#e0e0e0', '#f5f5f5', '#e0e0e0']}
      />
    </View>
  </View>
);

// Shimmer for parasha details screen
export const ParashaDetailSkeleton = () => (
  <View style={styles.parashaDetailContainer}>
    <ShimmerPlaceholder
      shimmerStyle={styles.parashaDetailTitleShimmer}
      shimmerColors={['#e0e0e0', '#f5f5f5', '#e0e0e0']}
    />
    <View style={styles.paragraphContainer}>
      {Array(5).fill().map((_, index) => (
        <ShimmerPlaceholder
          key={`paragraph-${index}`}
          shimmerStyle={[
            styles.paragraphShimmer,
            { width: `${Math.random() * 30 + 70}%`, alignSelf: 'flex-end' }
          ]}
          shimmerColors={['#e0e0e0', '#f5f5f5', '#e0e0e0']}
        />
      ))}
    </View>
  </View>
);

// Shimmer for holiday card on the parasha details screen
export const DetailHolidayCardSkeleton = () => (
  <View style={styles.detailHolidayContainer}>
    <ShimmerPlaceholder
      shimmerStyle={styles.detailSectionTitleShimmer}
      shimmerColors={['#e0e0e0', '#f5f5f5', '#e0e0e0']}
    />
    <View style={styles.detailCardContainer}>
      <ShimmerPlaceholder
        shimmerStyle={styles.detailHolidayImageShimmer}
        shimmerColors={['#e0e0e0', '#f5f5f5', '#e0e0e0']}
      />
      <ShimmerPlaceholder
        shimmerStyle={styles.detailHolidayTitleShimmer}
        shimmerColors={['#e0e0e0', '#f5f5f5', '#e0e0e0']}
      />
      <ShimmerPlaceholder
        shimmerStyle={styles.detailHolidayDateShimmer}
        shimmerColors={['#e0e0e0', '#f5f5f5', '#e0e0e0']}
      />
    </View>
  </View>
);

// Full screen loader with multiple shimmer components for home screen
export const HomeScreenSkeleton = () => (
  <View style={styles.container}>
    <View style={styles.headerContainer}>
      <ShimmerPlaceholder
        shimmerStyle={styles.headerTitleShimmer}
        shimmerColors={['#e0e0e0', '#f5f5f5', '#e0e0e0']}
      />
    </View>
    <ParashaCardSkeleton />
    <View style={styles.holidaysContainer}>
      {Array(4).fill().map((_, index) => (
        <HolidayCardSkeleton key={`holiday-${index}`} />
      ))}
    </View>
  </View>
);

// Full screen loader for parasha detail screen
export const ParashaDetailScreenSkeleton = () => (
  <View style={styles.container}>
    <ParashaDetailSkeleton />
    <DetailHolidayCardSkeleton />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    paddingVertical: 15,
  },
  headerTitleShimmer: {
    width: 120,
    height: 24,
    borderRadius: 4,
    alignSelf: 'flex-end',
  },
  parashaCardContainer: {
    height: 250,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  parashaCardShimmer: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  parashaTextContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 10,
  },
  parashaHeaderShimmer: {
    width: 120,
    height: 28,
    borderRadius: 4,
    marginBottom: 5,
    alignSelf: 'center',
  },
  parashaNameShimmer: {
    width: 180,
    height: 22,
    borderRadius: 4,
    marginBottom: 10,
    alignSelf: 'center',
  },
  holidayCardContainer: {
    marginVertical: 8,
    borderRadius: 8,
  },
  holidayCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    gap: 10,
  },
  holidayTextContainer: {
    flex: 1,
  },
  holidayTitleShimmer: {
    width: 150,
    height: 18,
    borderRadius: 4,
    marginBottom: 5,
  },
  holidayDateShimmer: {
    width: 180,
    height: 14,
    borderRadius: 4,
  },
  holidayImageShimmer: {
    width: 100,
    height: 56,
    borderRadius: 10,
  },
  holidaysContainer: {
    marginBottom: 20,
  },
  parashaDetailContainer: {
    marginVertical: 24,
  },
  parashaDetailTitleShimmer: {
    width: 200,
    height: 32,
    borderRadius: 4,
    marginBottom: 16,
    alignSelf: 'center',
  },
  paragraphContainer: {
    gap: 10,
  },
  paragraphShimmer: {
    height: 18,
    borderRadius: 4,
  },
  detailHolidayContainer: {
    marginBottom: 24,
  },
  detailSectionTitleShimmer: {
    width: 120,
    height: 20,
    borderRadius: 4,
    marginBottom: 12,
    alignSelf: 'center',
  },
  detailCardContainer: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    gap: 10,
  },
  detailHolidayImageShimmer: {
    width: 180,
    height: 180,
    borderRadius: 8,
  },
  detailHolidayTitleShimmer: {
    width: 150,
    height: 28,
    borderRadius: 4,
  },
  detailHolidayDateShimmer: {
    width: 120,
    height: 16,
    borderRadius: 4,
  },
});
