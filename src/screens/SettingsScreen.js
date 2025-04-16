import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getComfortBias } from '../services/feedbackService';
import { useTemperature } from '../context/TemperatureContext';

const SettingsScreen = () => {
  const [language, setLanguage] = useState('en');
  const [gender, setGender] = useState('male');
  const [comfortBias, setComfortBias] = useState(0);
  const { temperatureUnit, toggleTemperatureUnit } = useTemperature();

  useEffect(() => {
    loadSettings();
    loadComfortBias();
  }, []);

  const loadSettings = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('@language');
      const savedGender = await AsyncStorage.getItem('@gender');
      if (savedLanguage) setLanguage(savedLanguage);
      if (savedGender) setGender(savedGender);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadComfortBias = async () => {
    try {
      const bias = await getComfortBias();
      setComfortBias(bias);
    } catch (error) {
      console.error('Error loading comfort bias:', error);
    }
  };

  const saveLanguage = async (lang) => {
    try {
      await AsyncStorage.setItem('@language', lang);
      setLanguage(lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const saveGender = async (gen) => {
    try {
      await AsyncStorage.setItem('@gender', gen);
      setGender(gen);
    } catch (error) {
      console.error('Error saving gender:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>Settings</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language</Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, language === 'en' && styles.activeButton]}
              onPress={() => saveLanguage('en')}
            >
              <Text style={[styles.buttonText, language === 'en' && styles.activeButtonText]}>
                English
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, language === 'ko' && styles.activeButton]}
              onPress={() => saveLanguage('ko')}
            >
              <Text style={[styles.buttonText, language === 'ko' && styles.activeButtonText]}>
                한국어
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gender</Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, gender === 'male' && styles.activeButton]}
              onPress={() => saveGender('male')}
            >
              <Text style={[styles.buttonText, gender === 'male' && styles.activeButtonText]}>
                Male
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, gender === 'female' && styles.activeButton]}
              onPress={() => saveGender('female')}
            >
              <Text style={[styles.buttonText, gender === 'female' && styles.activeButtonText]}>
                Female
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Temperature Unit</Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, temperatureUnit === 'C' && styles.activeButton]}
              onPress={() => toggleTemperatureUnit('C')}
            >
              <Text style={[styles.buttonText, temperatureUnit === 'C' && styles.activeButtonText]}>
                Celsius
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, temperatureUnit === 'F' && styles.activeButton]}
              onPress={() => toggleTemperatureUnit('F')}
            >
              <Text style={[styles.buttonText, temperatureUnit === 'F' && styles.activeButtonText]}>
                Fahrenheit
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comfort Level</Text>
          <View style={styles.comfortBiasContainer}>
            <Text style={styles.comfortBiasText}>
              Current Bias: {comfortBias > 0 ? '+' : ''}{comfortBias}°C
            </Text>
            <Text style={styles.comfortBiasDescription}>
              {comfortBias > 0 ? 'You prefer warmer temperatures' :
               comfortBias < 0 ? 'You prefer cooler temperatures' :
               'You are comfortable with the current temperature'}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  buttonText: {
    fontSize: 16,
    color: '#333',
  },
  activeButtonText: {
    color: '#fff',
  },
  comfortBiasContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  comfortBiasText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  comfortBiasDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default SettingsScreen; 