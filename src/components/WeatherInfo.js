import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import WeatherSummary from './WeatherSummary';
import WeatherAnimation from './WeatherAnimation';
import WeatherDetails from './WeatherDetails';
import { useTemperature } from '../context/TemperatureContext';

const WeatherInfo = ({ weatherData, recommendation }) => {
  const { currentRecommendation } = useTemperature();

  if (!weatherData?.current?.temperature) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Weather data not available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WeatherSummary weatherData={weatherData} />
      <WeatherAnimation gender={currentRecommendation?.gender || 'male'} weatherData={weatherData} />
      
      {recommendation && (
        <View style={styles.recommendationContainer}>
          <Text style={styles.recommendationText}>
            {recommendation.recommendation}
          </Text>
          
          {recommendation.temperatureShift?.hasShift && (
            <View style={styles.temperatureShiftContainer}>
              <Text style={styles.temperatureShiftTitle}>
                Temperature Change Alert:
              </Text>
              <Text style={styles.temperatureShiftText}>
                Temperature will change by {Math.abs(Math.round((recommendation.temperatureShift.futureTemp - recommendation.temperatureShift.currentTemp) * 5/9))}°C in {recommendation.temperatureShift.hoursAhead} hours.
              </Text>
              <Text style={styles.futureRecommendationText}>
                Later: {recommendation.futureRecommendation}
              </Text>
            </View>
          )}
        </View>
      )}

      <WeatherDetails weatherData={weatherData} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    padding: 20,
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
});

export default WeatherInfo; 