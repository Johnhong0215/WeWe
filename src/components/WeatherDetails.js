import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTemperature } from '../context/TemperatureContext';

const WeatherDetails = ({ weatherData }) => {
  const { temperatureUnit } = useTemperature();

  if (!weatherData?.current) {
    return null;
  }

  const { current } = weatherData;

  const getWindSpeed = () => {
    if (temperatureUnit === 'C') {
      return `${current.wind_kph} km/h`;
    }
    return `${current.wind_mph} mph`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.detailRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Humidity</Text>
          <Text style={styles.detailValue}>{current.humidity}%</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Wind</Text>
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
  );
};

const styles = StyleSheet.create({
  container: {
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

export default WeatherDetails; 