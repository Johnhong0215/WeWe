import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTemperature } from '../context/TemperatureContext';

const WeatherInfo = ({ weatherData }) => {
  const { temperatureUnit, convertTemp } = useTemperature();

  if (!weatherData?.current?.temperature) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Weather data not available</Text>
      </View>
    );
  }

  const { current } = weatherData;

  const getWindSpeed = () => {
    const speedMph = current.windSpeed || 0;
    if (temperatureUnit === 'C') {
      // Convert mph to kph and round to 1 decimal place
      return `${(speedMph * 1.60934).toFixed(1)} km/h`;
    }
    return `${speedMph.toFixed(1)} mph`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainInfo}>
        <Text style={styles.temperature}>
          {convertTemp(current.temperature)}°{temperatureUnit}
        </Text>
        <Text style={styles.description}>
          {current.description || 'No description available'}
        </Text>
        <Text style={styles.feelsLike}>
          Feels like: {convertTemp(current.feelsLike)}°{temperatureUnit}
        </Text>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Humidity</Text>
            <Text style={styles.detailValue}>{current.humidity || 0}%</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Wind Speed</Text>
            <Text style={styles.detailValue}>{getWindSpeed()}</Text>
          </View>
        </View>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>UV Index</Text>
            <Text style={styles.detailValue}>Low</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Rain Chance</Text>
            <Text style={styles.detailValue}>{current.chance_of_rain || 0}%</Text>
          </View>
        </View>
      </View>
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
  mainInfo: {
    alignItems: 'center',
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
  detailsContainer: {
    marginTop: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailItem: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    width: '48%',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
});

export default WeatherInfo; 