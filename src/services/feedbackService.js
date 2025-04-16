import AsyncStorage from '@react-native-async-storage/async-storage';

const FEEDBACK_KEY = '@weatherwear_feedback';
const PREFERENCES_KEY = '@weatherwear_preferences';
const LAST_FEEDBACK_KEY = '@weatherwear_last_feedback';

// Structure to store feedback with weather conditions
const createFeedbackEntry = (weatherData, feedback) => ({
  timestamp: new Date().toISOString(),
  temperature: weatherData.current.temperature,
  feelsLike: weatherData.current.feelsLike,
  humidity: weatherData.current.humidity,
  windSpeed: weatherData.current.windSpeed,
  description: weatherData.current.description,
  feedback,
});

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

    // Update preferences
    await updatePreferences(weatherData, feedback);

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
      return "You said it feels too cold! We'll adjust our recommendations to be warmer.";
    case 'warm':
      return "You said it feels too warm! We'll adjust our recommendations to be cooler.";
    case 'perfect':
      return "You said it feels perfect! We'll keep this in mind for future recommendations.";
    default:
      return null;
  }
};

export const getFeedbackHistory = async () => {
  try {
    const feedbackString = await AsyncStorage.getItem(FEEDBACK_KEY);
    return feedbackString ? JSON.parse(feedbackString) : [];
  } catch (error) {
    console.error('Error getting feedback history:', error);
    return [];
  }
};

const updatePreferences = async (weatherData, feedback) => {
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
      preferences.temperatureOffset += 0.5;
    } else if (feedback === 'warm' && temp < preferences.hotThreshold) {
      preferences.hotThreshold -= 1;
      preferences.temperatureOffset -= 0.5;
    }

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