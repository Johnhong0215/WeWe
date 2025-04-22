import AsyncStorage from '@react-native-async-storage/async-storage';
import weatherSensitivityModel from './weatherSensitivityModel';
import i18n from '../utils/i18n';

const FEEDBACK_KEY = '@weatherwear_feedback';
const PREFERENCES_KEY = '@weatherwear_preferences';
const LAST_FEEDBACK_KEY = '@weatherwear_last_feedback';
const COMFORT_BIAS_KEY = '@weatherwear_comfort_bias';
const FEEDBACK_HISTORY_KEY = '@weatherwear_feedback_history';

// Structure to store feedback with weather conditions
const createFeedbackEntry = (weatherData, feedback) => ({
  timestamp: new Date().toISOString(),
  temperature: weatherData.current.temperature,
  feelsLike: weatherData.current.feelsLike,
  humidity: weatherData.current.humidity,
  windSpeed: weatherData.current.windSpeed,
  description: weatherData.current.description,
  feedback,
  weight: 1 // Initial weight for new feedback
});

// Calculate weighted comfort bias from feedback history
const calculateComfortBias = (feedbackHistory) => {
  if (!feedbackHistory || feedbackHistory.length === 0) return 0;

  let totalWeight = 0;
  let weightedSum = 0;

  // Sort feedback by timestamp (newest first)
  const sortedFeedback = [...feedbackHistory].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  // Calculate weights and sum
  sortedFeedback.forEach((entry, index) => {
    // Exponential decay: newer feedback has higher weight
    const timeWeight = Math.pow(0.9, index);
    const feedbackWeight = entry.weight * timeWeight;
    
    if (entry.feedback === 'cold') {
      weightedSum += feedbackWeight;
    } else if (entry.feedback === 'warm') {
      weightedSum -= feedbackWeight;
    }
    
    totalWeight += feedbackWeight;
  });

  // Normalize and round to nearest 0.5
  const bias = weightedSum / totalWeight;
  return Math.round(bias * 2) / 2;
};

export const storeFeedback = async (weatherData, feedback) => {
  try {
    // Store the feedback entry
    const entry = createFeedbackEntry(weatherData, feedback);
    const feedbackString = await AsyncStorage.getItem(FEEDBACK_KEY);
    const feedbackData = feedbackString ? JSON.parse(feedbackString) : [];
    feedbackData.push(entry);
    await AsyncStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedbackData));

    // Store last feedback time and type
    const lastFeedback = {
      timestamp: new Date().getTime(),
      type: feedback,
    };
    await AsyncStorage.setItem(LAST_FEEDBACK_KEY, JSON.stringify(lastFeedback));

    // Update sensitivity model
    await weatherSensitivityModel.update(
      weatherData.current.temperature,
      weatherData.current.humidity,
      weatherData.current.wind_kph,
      weatherData.current.uv,
      feedback
    );

    // Update comfort bias
    const newBias = calculateComfortBias(feedbackData);
    await AsyncStorage.setItem(COMFORT_BIAS_KEY, JSON.stringify(newBias));

    // Update preferences
    await updatePreferences(weatherData, feedback, newBias);

    return true;
  } catch (error) {
    console.error('Error storing feedback:', error);
    return false;
  }
};

export const getLastFeedback = async () => {
  try {
    const lastFeedbackString = await AsyncStorage.getItem(LAST_FEEDBACK_KEY);
    if (!lastFeedbackString) return null;
    
    const lastFeedback = JSON.parse(lastFeedbackString);
    const now = new Date().getTime();
    const timeSinceLastFeedback = now - lastFeedback.timestamp;
    const twoHoursInMs = 2 * 60 * 60 * 1000;

    // Return null if more than 2 hours have passed
    if (timeSinceLastFeedback > twoHoursInMs) {
      return null;
    }

    return lastFeedback;
  } catch (error) {
    console.error('Error getting last feedback:', error);
    return null;
  }
};

export const getFeedbackMessage = (feedbackType) => {
  switch (feedbackType) {
    case 'cold':
      return i18n.t('feedback_cold_message');
    case 'warm':
      return i18n.t('feedback_warm_message');
    case 'perfect':
      return i18n.t('feedback_perfect_message');
    default:
      return null;
  }
};

export const getFeedbackHistory = async () => {
  try {
    const feedback = await AsyncStorage.getItem(FEEDBACK_HISTORY_KEY);
    return feedback ? JSON.parse(feedback) : [];
  } catch (error) {
    console.error('Error getting feedback history:', error);
    return [];
  }
};

const updatePreferences = async (weatherData, feedback, comfortBias) => {
  try {
    const preferencesString = await AsyncStorage.getItem(PREFERENCES_KEY);
    const preferences = preferencesString ? JSON.parse(preferencesString) : {
      temperatureOffset: 0,
      coldThreshold: 60,
      hotThreshold: 75,
      feedbackCount: 0,
    };

    // Update preferences based on feedback
    const temp = weatherData.current.temperature;
    
    if (feedback === 'cold' && temp > preferences.coldThreshold) {
      preferences.coldThreshold += 1;
    } else if (feedback === 'warm' && temp < preferences.hotThreshold) {
      preferences.hotThreshold -= 1;
    }

    // Update temperature offset based on comfort bias
    preferences.temperatureOffset = comfortBias;
    preferences.feedbackCount += 1;

    // Store updated preferences
    await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    
    return preferences;
  } catch (error) {
    console.error('Error updating preferences:', error);
    return null;
  }
};

export const getPreferences = async () => {
  try {
    const preferencesString = await AsyncStorage.getItem(PREFERENCES_KEY);
    return preferencesString ? JSON.parse(preferencesString) : null;
  } catch (error) {
    console.error('Error getting preferences:', error);
    return null;
  }
};

export const storeFeedbackWithWeather = async (feedback, weatherData) => {
  try {
    const feedbackEntry = {
      timestamp: new Date().toISOString(),
      feedback,
      weather: {
        temperature: weatherData.current.temperature,
        feelsLike: weatherData.current.feelsLike,
        humidity: weatherData.current.humidity,
        wind_kph: weatherData.current.wind_kph,
        uv: weatherData.current.uv,
        description: weatherData.current.description
      }
    };

    // Store only the new feedback entry
    await AsyncStorage.setItem(FEEDBACK_HISTORY_KEY, JSON.stringify([feedbackEntry]));
    return true;
  } catch (error) {
    console.error('Error storing feedback with weather:', error);
    return false;
  }
};

export const clearFeedbackHistory = async () => {
  try {
    // Clear all feedback-related storage
    await AsyncStorage.multiRemove([
      FEEDBACK_KEY,
      FEEDBACK_HISTORY_KEY,
      LAST_FEEDBACK_KEY,
      COMFORT_BIAS_KEY,
      PREFERENCES_KEY,
      '@weatherwear_last_feedback_time'  // Add this key to be cleared
    ]);

    // Reset the weather sensitivity model
    await weatherSensitivityModel.resetWeights();

    return true;
  } catch (error) {
    console.error('Error clearing feedback history:', error);
    return false;
  }
}; 