import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTemperature } from '../context/TemperatureContext';

const WeatherSummary = ({ weatherData }) => {
  const { temperatureUnit, convertTemp } = useTemperature();

  if (!weatherData?.current?.temperature) {
    return null;
  }

  const { current } = weatherData;

  const formatTemperature = (temp) => {
    if (temperatureUnit === 'C') {
      return temp.toFixed(1);
    }
    return Math.round(temp);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.temperature}>
        {formatTemperature(convertTemp(current.temperature))}°{temperatureUnit}
      </Text>
      <Text style={styles.description}>
        {current.description || 'No description available'}
      </Text>
      <Text style={styles.feelsLike}>
        Feels like: {formatTemperature(convertTemp(current.feelsLike))}°{temperatureUnit}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  temperature: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  description: {
    fontSize: 20,
    color: '#666',
    marginTop: 5,
    textTransform: 'capitalize',
  },
  feelsLike: {
    fontSize: 18,
    color: '#888',
    marginTop: 5,
    marginBottom: 5,
  },
});

export default WeatherSummary; 