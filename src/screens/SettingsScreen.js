import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTemperature } from '../context/TemperatureContext';
import { useLanguage } from '../context/LanguageContext';
import { getRecommendation } from '../services/recommendationService';
import { getFeedbackHistory, clearFeedbackHistory } from '../services/feedbackService';
import weatherSensitivityModel from '../services/weatherSensitivityModel';
import i18n from '../utils/i18n';

const SettingsScreen = () => {
  const [gender, setGender] = useState('male');
  const { language, changeLanguage } = useLanguage();
  const { 
    temperatureUnit, 
    toggleTemperatureUnit, 
    comfortBias, 
    currentRecommendation, 
    setCurrentRecommendation, 
    feedbackHistory, 
    setFeedbackHistory,
    loadFeedbackHistory, 
    convertTemp 
  } = useTemperature();

  useEffect(() => {
    loadSettings();
    loadFeedbackHistory();
  }, []);

  const handleClearHistory = async () => {
    try {
      // Clear all feedback-related storage
      await AsyncStorage.multiRemove([
        '@weatherwear_feedback_history',
        '@weatherwear_feedback',
        '@weatherwear_last_feedback',
        '@weatherwear_last_feedback_time',
        '@weatherwear_comfort_bias'
      ]);
      
      // Reset the weather sensitivity model
      await weatherSensitivityModel.resetWeights();
      
      // Reset the state in TemperatureContext
      setFeedbackHistory([]);
      
      // Force a UI update by reloading the feedback history
      await loadFeedbackHistory();
      
      // Show success message
      Alert.alert(
        i18n.t('clear_success'),
        i18n.t('clear_success_message'),
        [{ 
          text: i18n.t('ok'),
          onPress: () => {
            // Force a re-render of the feedback history section
            setFeedbackHistory([]);
          }
        }]
      );
    } catch (error) {
      console.error('Error clearing feedback history:', error);
      Alert.alert(
        i18n.t('clear_error'),
        i18n.t('clear_error_message'),
        [{ text: i18n.t('ok') }]
      );
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const loadSettings = async () => {
    try {
      const savedGender = await AsyncStorage.getItem('@gender');
      if (savedGender) setGender(savedGender);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveGender = async (newGender) => {
    try {
      await AsyncStorage.setItem('@gender', newGender);
      setGender(newGender);
      
      // If we have a current recommendation with weather data, update it
      if (currentRecommendation?.weatherData) {
        console.log('Updating recommendation with new gender:', newGender);
        // Get a new recommendation with the updated gender
        const newRecommendation = await getRecommendation({
          ...currentRecommendation.weatherData,
          gender: newGender
        });
        
        // Update the current recommendation while preserving weather data
        setCurrentRecommendation({
          ...newRecommendation,
          weatherData: currentRecommendation.weatherData,
          gender: newGender // Explicitly set the gender
        });
      }
    } catch (error) {
      console.error('Error saving gender:', error);
    }
  };

  const isWindy = (wind_kph) => {
    return temperatureUnit === 'C' ? wind_kph > 20 : wind_kph > 12.4;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>{i18n.t('settings')}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t('language')}</Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, language === 'en' && styles.activeButton]}
              onPress={() => changeLanguage('en')}
            >
              <Text style={[styles.buttonText, language === 'en' && styles.activeButtonText]}>
                {i18n.t('english')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, language === 'ko' && styles.activeButton]}
              onPress={() => changeLanguage('ko')}
            >
              <Text style={[styles.buttonText, language === 'ko' && styles.activeButtonText]}>
                {i18n.t('korean')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t('gender')}</Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, gender === 'male' && styles.activeButton]}
              onPress={() => saveGender('male')}
            >
              <Text style={[styles.buttonText, gender === 'male' && styles.activeButtonText]}>
                {i18n.t('male')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, gender === 'female' && styles.activeButton]}
              onPress={() => saveGender('female')}
            >
              <Text style={[styles.buttonText, gender === 'female' && styles.activeButtonText]}>
                {i18n.t('female')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t('temperature_unit')}</Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, temperatureUnit === 'C' && styles.activeButton]}
              onPress={() => toggleTemperatureUnit('C')}
            >
              <Text style={[styles.buttonText, temperatureUnit === 'C' && styles.activeButtonText]}>
                {i18n.t('celsius')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, temperatureUnit === 'F' && styles.activeButton]}
              onPress={() => toggleTemperatureUnit('F')}
            >
              <Text style={[styles.buttonText, temperatureUnit === 'F' && styles.activeButtonText]}>
                {i18n.t('fahrenheit')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t('comfort_level')}</Text>
          <View style={styles.comfortBiasContainer}>
            <Text style={styles.comfortBiasText}>
              {i18n.t('current_comfort_bias', { value: comfortBias > 0 ? '+' + comfortBias : comfortBias })}
            </Text>
            <Text style={styles.comfortBiasDescription}>
              {comfortBias > 0 ? i18n.t('prefer_warmer') :
               comfortBias < 0 ? i18n.t('prefer_cooler') :
               i18n.t('no_preference')}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{i18n.t('feedback_history')}</Text>
            {feedbackHistory.length > 0 && (
              <TouchableOpacity onPress={handleClearHistory}>
                <Text style={styles.clearButton}>{i18n.t('clear_history')}</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {feedbackHistory.length === 0 ? (
            <Text style={styles.emptyText}>{i18n.t('no_feedback_yet')}</Text>
          ) : (
            feedbackHistory.map((entry, index) => (
              <View key={index} style={styles.feedbackEntry}>
                <Text style={styles.feedbackDate}>
                  {new Date(entry.timestamp).toLocaleString(
                    language === 'ko' ? 'ko-KR' : 'en-US',
                    { 
                      year: 'numeric',
                      month: 'numeric',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric',
                      second: 'numeric',
                      hour12: true
                    }
                  )}
                </Text>
                <Text style={styles.feedbackType}>
                  {i18n.t('feedback_label', { 
                    type: i18n.t(entry.feedback === 'warm' ? 'too_hot' : 
                                entry.feedback === 'cold' ? 'too_cold' : 
                                'just_right')
                  })}
                </Text>
                <View style={styles.weatherInfo}>
                  <Text style={styles.weatherText}>
                    {i18n.t('temperature_at_time', {
                      temp: convertTemp(entry.weather.temperature).toFixed(1),
                      unit: temperatureUnit
                    })}
                  </Text>
                  <Text style={styles.weatherText}>
                    {i18n.t('feels_like')}: {convertTemp(entry.weather.feelsLike).toFixed(1)}°{temperatureUnit}
                  </Text>
                  <Text style={styles.weatherText}>
                    {i18n.t('humidity')}: {entry.weather.humidity}%
                  </Text>
                  <Text style={styles.weatherText}>
                    {i18n.t('wind')}: {entry.weather.wind_kph} km/h
                  </Text>
                  <Text style={styles.weatherText}>
                    {i18n.t('uv_index')}: {entry.weather.uv}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  clearButton: {
    color: '#007AFF',
    fontSize: 16,
  },
  emptyText: {
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 20,
  },
  feedbackEntry: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  feedbackDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  feedbackType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  weatherInfo: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  weatherText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
});

export default SettingsScreen; 