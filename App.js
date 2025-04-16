import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TemperatureProvider } from './src/context/TemperatureContext';
import HomeScreen from './src/screens/HomeScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <TemperatureProvider>
        <HomeScreen />
      </TemperatureProvider>
    </SafeAreaProvider>
  );
} 