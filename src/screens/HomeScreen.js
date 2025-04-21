import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCurrentLocation } from '../services/locationService';
import { getWeather } from '../services/weatherService';
import { getRecommendation } from '../services/recommendationService';
import { storeFeedback, storeFeedbackWithWeather } from '../services/feedbackService';
import { useTemperature } from '../context/TemperatureContext';
import { useLanguage } from '../context/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WeatherInfo from '../components/WeatherInfo';
import FeedbackButtons from '../components/FeedbackButtons';
import i18n from '../utils/i18n';

const HomeScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const { 
    currentRecommendation, 
    setCurrentRecommendation, 
    updateFeedbackHistory,
    saveLastFeedback 
  } = useTemperature();
  const { language } = useLanguage();

  // Add effect to reload data when language changes
  useEffect(() => {
    loadWeatherData(true);
  }, [language]);

  const clearCache = async () => {
    try {
      // Clear weather data cache
      await AsyncStorage.removeItem('@weatherData');
      // Clear location cache
      await AsyncStorage.removeItem('@location');
      // Clear recommendation cache
      await AsyncStorage.removeItem('@recommendation');
    } catch (err) {
      console.error('Error clearing cache:', err);
    }
  };

  const loadWeatherData = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) {
        setLoading(true);
      }
      setError(null);
      setWeatherData(null);

      // Clear cache if refreshing
      if (isRefreshing) {
        await clearCache();
      }

      // Get current location
      const location = await getCurrentLocation();
      if (!location?.latitude || !location?.longitude) {
        throw new Error('Invalid location data');
      }
      
      // Get weather data with forceRefresh parameter
      const weather = await getWeather(location.latitude, location.longitude, isRefreshing);
      if (!weather?.current?.temperature) {
        throw new Error('Invalid weather data received');
      }

      // Set weather data
      setWeatherData(weather);

      // Get current gender from AsyncStorage
      const currentGender = await AsyncStorage.getItem('@gender') || 'male';

      // Get clothing recommendation with current gender
      const recommendation = await getRecommendation({
        ...weather,
        gender: currentGender
      });
      
      // Store both recommendation and weather data
      setCurrentRecommendation({
        ...recommendation,
        weatherData: weather
      });

    } catch (err) {
      console.error('Error loading weather data:', err);
      if (err.message.includes('location')) {
        setError(i18n.t('location_error'));
      } else {
        setError(i18n.t('weather_error'));
      }
      setWeatherData(null);
      setCurrentRecommendation(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load weather data on component mount
  useEffect(() => {
    loadWeatherData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadWeatherData(true);
  }, []);

  const handleRetry = () => {
    loadWeatherData();
  };

  const handleFeedback = async (feedback) => {
    try {
      if (!weatherData || !weatherData.current) return;

      // Create feedback entry
      const feedbackEntry = {
        timestamp: new Date().toISOString(),
        feedback,
        weather: {
          temperature: weatherData.current.temperature,
          feelsLike: weatherData.current.feelsLike,
          humidity: weatherData.current.humidity,
          wind_kph: weatherData.current.wind_kph,
          uv: weatherData.current.uv,
          description: weatherData.current.description
        }
      };

      // Update feedback history through context
      await updateFeedbackHistory(feedbackEntry);

      // Save last feedback time
      await saveLastFeedback(feedback);

      // Store the feedback for comfort bias calculation
      const success = await storeFeedback(weatherData, feedback);
      
      if (success) {
        Alert.alert(
          'Thank you!',
          'Your feedback helps us improve our recommendations.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Reload recommendations with updated preferences
                loadWeatherData();
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Unable to save your feedback. Please try again.');
      }
    } catch (err) {
      console.error('Error handling feedback:', err);
      Alert.alert('Error', 'Unable to save your feedback. Please try again.');
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>{i18n.t('loading')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>{i18n.t('retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!weatherData || !weatherData.current) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{i18n.t('error')}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>{i18n.t('retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../../assets/images/WeatherWear.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <ScrollView 
        style={styles.scrollView} 
        bounces={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
            title={i18n.t('pull_to_refresh')}
            titleColor="#666"
          />
        }
      >
        <WeatherInfo 
          weatherData={weatherData} 
          recommendation={currentRecommendation}
        />

        <View style={styles.comfortCategoryContainer}>
          <Text style={styles.comfortCategoryText}>
            {currentRecommendation?.adjustedFeelsLike !== undefined && 
              (currentRecommendation.adjustedFeelsLike - currentRecommendation.originalFeelsLike > 3
                ? i18n.t('comfort_cold')
                : currentRecommendation.adjustedFeelsLike - currentRecommendation.originalFeelsLike < -3
                ? i18n.t('comfort_warm')
                : i18n.t('comfort_normal'))}
          </Text>
        </View>

        <View style={styles.feedbackContainer}>
          <FeedbackButtons onFeedback={handleFeedback} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 0,
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    zIndex: 1,
  },
  logo: {
    width: 250,
    height: 100,
    marginTop: -15,
    marginBottom: -30,
    marginLeft: -5,
  },
  scrollView: {
    flex: 1,
  },
  feedbackContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  comfortCategoryContainer: {
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  comfortCategoryText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default HomeScreen; 