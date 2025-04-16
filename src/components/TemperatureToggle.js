import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useTemperature } from '../context/TemperatureContext';

const TemperatureToggle = () => {
  const { isCelsius, toggleUnit } = useTemperature();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={toggleUnit}
      activeOpacity={0.8}
    >
      <View style={styles.toggle}>
        <View style={[
          styles.slider,
          isCelsius ? styles.sliderLeft : styles.sliderRight
        ]} />
        <Text style={[
          styles.text,
          isCelsius ? styles.activeText : styles.inactiveText
        ]}>°C</Text>
        <Text style={[
          styles.text,
          !isCelsius ? styles.activeText : styles.inactiveText
        ]}>°F</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  toggle: {
    width: 100,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8E8E8',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
    position: 'relative',
  },
  slider: {
    position: 'absolute',
    width: 45,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sliderLeft: {
    left: 3,
  },
  sliderRight: {
    right: 3,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    zIndex: 1,
    width: 45,
    textAlign: 'center',
  },
  activeText: {
    color: '#FFFFFF',
  },
  inactiveText: {
    color: '#666666',
  },
});

export default TemperatureToggle; 