import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TemperatureContext = createContext();
const COMFORT_BIAS_KEY = '@weatherwear_comfort_bias';
const LAST_FEEDBACK_KEY = '@weatherwear_last_feedback';
const LAST_FEEDBACK_TIME_KEY = '@weatherwear_last_feedback_time';

export const TemperatureProvider = ({ children }) => {
  const [temperatureUnit, setTemperatureUnit] = useState('C');
  const [comfortBias, setComfortBias] = useState(0);
  const [lastFeedback, setLastFeedback] = useState(null);
  const [lastFeedbackTime, setLastFeedbackTime] = useState(null);
  const [currentRecommendation, setCurrentRecommendation] = useState(null);

  useEffect(() => {
    loadComfortBias();
    loadLastFeedback();
  }, []);

  const loadComfortBias = async () => {
    try {
      const savedBias = await AsyncStorage.getItem(COMFORT_BIAS_KEY);
      if (savedBias !== null) {
        const parsedBias = parseFloat(savedBias);
        setComfortBias(isNaN(parsedBias) ? 0 : parsedBias);
      }
    } catch (error) {
      console.error('Error loading comfort bias:', error);
      setComfortBias(0);
    }
  };

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

  const saveComfortBias = async (newBias) => {
    try {
      const biasToSave = parseFloat(newBias);
      if (!isNaN(biasToSave)) {
        await AsyncStorage.setItem(COMFORT_BIAS_KEY, biasToSave.toString());
        setComfortBias(biasToSave);
      }
    } catch (error) {
      console.error('Error saving comfort bias:', error);
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

  const updateComfortBias = (feedback) => {
    let newBias = comfortBias;
    const currentTime = Date.now();
    const twoHoursInMs = 2 * 60 * 60 * 1000;

    // If there was a previous feedback and it's been less than 2 hours
    if (lastFeedback && lastFeedbackTime && (currentTime - lastFeedbackTime < twoHoursInMs)) {
      // Revert the previous feedback effect
      switch (lastFeedback) {
        case 'cold':
          newBias -= 1;
          break;
        case 'warm':
          newBias += 1;
          break;
        case 'perfect':
          if (comfortBias > 0) {
            newBias += 0.5;
          } else if (comfortBias < 0) {
            newBias -= 0.5;
          }
          break;
      }
    }

    // Apply the new feedback effect
    switch (feedback) {
      case 'cold':
        newBias += 1;
        break;
      case 'warm':
        newBias -= 1;
        break;
      case 'perfect':
        // Gradually move bias back to 0 if it's not already
        if (newBias > 0) {
          newBias -= 0.5;
        } else if (newBias < 0) {
          newBias += 0.5;
        }
        break;
    }

    // Limit bias to reasonable range (-5 to +5)
    newBias = Math.max(-5, Math.min(5, newBias));
    saveComfortBias(newBias);
    saveLastFeedback(feedback);
  };

  const toggleTemperatureUnit = (unit) => {
    setTemperatureUnit(unit);
  };

  const convertTemp = (temp) => {
    if (temperatureUnit === 'C') {
      // If we're displaying in Celsius, return the temperature as is
      return temp;
    } else {
      // Convert Celsius to Fahrenheit
      return Math.round((temp * 9/5) + 32);
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
      comfortBias,
      updateComfortBias,
      lastFeedback,
      lastFeedbackTime,
      currentRecommendation,
      setCurrentRecommendation,
      isFeedbackAvailable
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