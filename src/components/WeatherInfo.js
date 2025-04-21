import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import WeatherSummary from './WeatherSummary';
import WeatherAnimation from './WeatherAnimation';
import WeatherDetails from './WeatherDetails';
import { useTemperature } from '../context/TemperatureContext';

const WeatherInfo = ({ weatherData }) => {
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
});

export default WeatherInfo; 