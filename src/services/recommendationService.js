import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPreferences } from './feedbackService';
import i18n from '../utils/i18n';

const TEMPERATURE_CATEGORIES = [
  { min: -Infinity, max: -10, label: 'Super Cold' },
  { min: -9, max: -1, label: 'Very Cold' },
  { min: 0, max: 4, label: 'Cold' },
  { min: 5, max: 9, label: 'Chilly' },
  { min: 10, max: 14, label: 'Cool' },
  { min: 15, max: 19, label: 'Mild' },
  { min: 20, max: 24, label: 'Warm' },
  { min: 25, max: 29, label: 'Hot' },
  { min: 30, max: 34, label: 'Very Hot' },
  { min: 35, max: Infinity, label: 'Super Hot' }
];

const getCategoryFromTemp = (temp) => {
  return TEMPERATURE_CATEGORIES.find(cat => temp >= cat.min && temp <= cat.max);
};

const classifyTemperature = (feelsLikeC, wind = 0, humidity = 0, comfortBias = 0) => {
  const adjusted = feelsLikeC - comfortBias;

  // Find correct category
  const categoryIndex = TEMPERATURE_CATEGORIES.findIndex(c => adjusted >= c.min && adjusted <= c.max);
  
  // Fallback to index 4 (Chilly) if something went wrong
  let level = categoryIndex >= 0 ? categoryIndex + 1 : 5;

  // Wind chill: drop level
  if (wind > 15 && level <= 6) level -= 1;

  // Humidity heat index bump
  if (humidity > 80 && adjusted > 25) level += 1;

  // Clamp between 1 and 10
  level = Math.max(1, Math.min(10, level));

  return {
    level,
    category: TEMPERATURE_CATEGORIES[level - 1].label,
    adjustedFeelsLike: adjusted,
    originalFeelsLike: feelsLikeC
  };
};

const getOutfitRecommendation = (level, gender) => {
  const levelStr = level.toString();
  const validGender = ['male', 'female'].includes(gender) ? gender : 'male';
  const options = i18n.t(`outfits.level${levelStr}.${validGender}`);
  if (!options || !options.length) return i18n.t('no_recommendation');
  return options[Math.floor(Math.random() * options.length)];
};

export const getRecommendation = async (weatherData) => {
  try {
    if (!weatherData?.current?.feelsLike) {
      throw new Error('Invalid weather data');
    }

    const prefs = await getPreferences();
    const gender = await AsyncStorage.getItem('@gender') || 'male';
    const comfortBias = prefs?.temperatureOffset || 0;

    const { feelsLike, windSpeed, humidity } = weatherData.current;
    const { level, category, adjustedFeelsLike, originalFeelsLike } = classifyTemperature(
      feelsLike,
      windSpeed || 0,
      humidity || 0,
      comfortBias
    );

    const recommendation = getOutfitRecommendation(level, gender);

    return {
      recommendation,
      category,
      adjustedFeelsLike,
      originalFeelsLike,
      gender
    };
  } catch (err) {
    console.error('Recommendation error:', err);
    throw err;
  }
};