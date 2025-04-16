import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCurrentLocation } from '../services/locationService';
import { getWeather } from '../services/weatherService';
import { getRecommendation } from '../services/recommendationService';
import { storeFeedback } from '../services/feedbackService';
import { useTemperature } from '../context/TemperatureContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WeatherInfo from '../components/WeatherInfo';
import FeedbackButtons from '../components/FeedbackButtons';

const HomeScreen = () => {
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const { currentRecommendation, setCurrentRecommendation } = useTemperature();

  const loadWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);
      setWeatherData(null);

      // Get current location
      const location = await getCurrentLocation();
      if (!location?.latitude || !location?.longitude) {
        throw new Error('Invalid location data');
      }
      
      // Get weather data
      const weather = await getWeather(location.latitude, location.longitude);
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
        setError('Unable to access location. Please enable location services and try again.');
      } else {
        setError('Unable to load weather data. Please check your internet connection and try again.');
      }
      setWeatherData(null);
      setCurrentRecommendation(null);
    } finally {
      setLoading(false);
    }
  };

  // Load weather data on component mount
  useEffect(() => {
    loadWeatherData();
  }, []);

  const handleRetry = () => {
    loadWeatherData();
  };

  const handleFeedback = async (feedback) => {
    try {
      if (!weatherData || !weatherData.current) return;

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

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Getting your weather data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Only render the main content if we have valid weather data
  if (!weatherData || !weatherData.current) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Weather data not available</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>WeatherWear</Text>
      </View>

      <WeatherInfo weatherData={weatherData} />

      <View style={styles.recommendationContainer}>
        {currentRecommendation && (
          <>
            <Text style={styles.recommendationText}>
              {currentRecommendation.recommendation}
            </Text>
            
            {currentRecommendation.uvAdvisory.length > 0 && (
              <View style={styles.uvAdvisoryContainer}>
                <Text style={styles.uvAdvisoryTitle}>Sun Protection:</Text>
                {currentRecommendation.uvAdvisory.map((advice, index) => (
                  <Text key={index} style={styles.uvAdvisoryText}>
                    • {advice}
                  </Text>
                ))}
              </View>
            )}

            {currentRecommendation.temperatureShift?.hasShift && (
              <View style={styles.temperatureShiftContainer}>
                <Text style={styles.temperatureShiftTitle}>
                  Temperature Change Alert:
                </Text>
                <Text style={styles.temperatureShiftText}>
                  Temperature will change by {Math.abs(Math.round((currentRecommendation.temperatureShift.futureTemp - currentRecommendation.temperatureShift.currentTemp) * 5/9))}°C in {currentRecommendation.temperatureShift.hoursAhead} hours.
                </Text>
                <Text style={styles.futureRecommendationText}>
                  Later: {currentRecommendation.futureRecommendation}
                </Text>
              </View>
            )}
          </>
        )}
      </View>

      <View style={styles.comfortCategoryContainer}>
        <Text style={styles.comfortCategoryText}>
          {currentRecommendation?.adjustedFeelsLike !== undefined && 
            (currentRecommendation.adjustedFeelsLike - currentRecommendation.originalFeelsLike > 3
              ? "You tend to get cold easily"
              : currentRecommendation.adjustedFeelsLike - currentRecommendation.originalFeelsLike < -3
              ? "You tend to feel warm more quickly"
              : "Your comfort level is typical")}
        </Text>
      </View>

      <View style={styles.feedbackContainer}>
        <FeedbackButtons onFeedback={handleFeedback} />
      </View>
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
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  recommendationContainer: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    margin: 15,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  recommendationText: {
    fontSize: 20,
    textAlign: 'center',
    color: '#333',
    lineHeight: 28,
  },
  feedbackContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  uvAdvisoryContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  uvAdvisoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFA500',
    marginBottom: 5,
  },
  uvAdvisoryText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  temperatureShiftContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  temperatureShiftTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  temperatureShiftText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  futureRecommendationText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
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