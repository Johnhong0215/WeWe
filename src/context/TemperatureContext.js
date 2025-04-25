import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import weatherSensitivityModel from '../services/weatherSensitivityModel';

const TemperatureContext = createContext();
const LAST_FEEDBACK_KEY = '@weatherwear_last_feedback';
const LAST_FEEDBACK_TIME_KEY = '@weatherwear_last_feedback_time';

export const TemperatureProvider = ({ children }) => {
  const [temperatureUnit, setTemperatureUnit] = useState('C');
  const [lastFeedback, setLastFeedback] = useState(null);
  const [lastFeedbackTime, setLastFeedbackTime] = useState(null);
  const [currentRecommendation, setCurrentRecommendation] = useState(null);
  const [feedbackHistory, setFeedbackHistory] = useState([]);

  useEffect(() => {
    loadLastFeedback();
    loadFeedbackHistory();
    weatherSensitivityModel.load();
  }, []);

  const loadLastFeedback = async () => {
    try {
      const savedFeedback = await AsyncStorage.getItem(LAST_FEEDBACK_KEY);
      const savedTime = await AsyncStorage.getItem(LAST_FEEDBACK_TIME_KEY);
      if (savedFeedback) {
        setLastFeedback(savedFeedback);
      }
      if (savedTime) {
        setLastFeedbackTime(parseInt(savedTime));
      }
    } catch (error) {
      console.error('Error loading last feedback:', error);
    }
  };

  const loadFeedbackHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('@feedback_history');
      if (history) {
        setFeedbackHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Error loading feedback history:', error);
    }
  };

  const saveLastFeedback = async (feedback) => {
    try {
      const currentTime = Date.now();
      await AsyncStorage.setItem(LAST_FEEDBACK_KEY, feedback);
      await AsyncStorage.setItem(LAST_FEEDBACK_TIME_KEY, currentTime.toString());
      setLastFeedback(feedback);
      setLastFeedbackTime(currentTime);
    } catch (error) {
      console.error('Error saving last feedback:', error);
    }
  };

  const updateFeedbackHistory = async (newFeedback) => {
    try {
      // Get existing feedback history
      const existingHistory = await AsyncStorage.getItem('@feedback_history');
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      
      // Add new feedback to the beginning of the array
      history.unshift(newFeedback);
      
      // Store updated history
      await AsyncStorage.setItem('@feedback_history', JSON.stringify(history));
      setFeedbackHistory(history);
    } catch (error) {
      console.error('Error updating feedback history:', error);
    }
  };

  const toggleTemperatureUnit = (unit) => {
    setTemperatureUnit(unit);
  };

  const convertTemp = (temp) => {
    if (temperatureUnit === 'C') {
      // If we're displaying in Celsius, return the temperature as is
      return parseFloat(temp);
    } else {
      // Convert Celsius to Fahrenheit
      return parseFloat((temp * 9/5) + 32);
    }
  };

  const isFeedbackAvailable = () => {
    if (!lastFeedbackTime) return true;
    const currentTime = Date.now();
    const twoHoursInMs = 2 * 60 * 60 * 1000;
    return currentTime - lastFeedbackTime >= twoHoursInMs;
  };

  return (
    <TemperatureContext.Provider value={{ 
      temperatureUnit, 
      toggleTemperatureUnit, 
      convertTemp,
      comfortBias: temperatureUnit === 'F' 
        ? (weatherSensitivityModel.getLastWeightedAdjustment() * 1.8).toFixed(1)
        : weatherSensitivityModel.getLastWeightedAdjustment().toFixed(1),
      lastFeedback,
      lastFeedbackTime,
      currentRecommendation,
      setCurrentRecommendation,
      isFeedbackAvailable,
      feedbackHistory,
      setFeedbackHistory,
      updateFeedbackHistory,
      loadFeedbackHistory,
      saveLastFeedback
    }}>
      {children}
    </TemperatureContext.Provider>
  );
};

export const useTemperature = () => {
  const context = useContext(TemperatureContext);
  if (!context) {
    throw new Error('useTemperature must be used within a TemperatureProvider');
  }
  return context;
}; 