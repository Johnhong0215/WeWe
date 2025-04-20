import AsyncStorage from '@react-native-async-storage/async-storage';
import weatherSensitivityModel from './weatherSensitivityModel';

// Mock weather service that generates simulated weather data
const getRandomTemp = (baseTemp, variance) => {
  return Math.round(baseTemp + (Math.random() - 0.5) * variance);
};

const getSeasonalBaseTemp = (latitude, month) => {
  // Northern hemisphere seasons are opposite in southern hemisphere
  const isNorthernHemisphere = latitude > 0;
  
  // Adjust month for southern hemisphere
  if (!isNorthernHemisphere) {
    month = (month + 6) % 12;
  }

  // Base temperatures by season
  if (month >= 11 || month <= 1) { // Winter
    return 32;
  } else if (month >= 2 && month <= 4) { // Spring
    return 60;
  } else if (month >= 5 && month <= 7) { // Summer
    return 80;
  } else { // Fall
    return 65;
  }
};

const getWeatherDescription = (temp) => {
  if (temp < 32) return 'freezing cold';
  if (temp < 45) return 'very cold';
  if (temp < 55) return 'cold';
  if (temp < 65) return 'mild';
  if (temp < 75) return 'warm';
  if (temp < 85) return 'hot';
  return 'very hot';
};

const API_KEY = 'aa08d88789de4340a0430426251504';
const BASE_URL = 'https://api.weatherapi.com/v1';
const CACHE_KEY = '@weatherwear_weather_cache';
const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes in milliseconds

// Map WeatherAPI condition codes to our icon set
const mapWeatherIcon = (code) => {
  // Sunny or Clear
  if (code === 1000) return '01d';
  // Partly cloudy
  if (code === 1003) return '02d';
  // Cloudy or Overcast
  if ([1006, 1009].includes(code)) return '03d';
  // Rain (various types)
  if ([1063, 1150, 1153, 1168, 1171, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(code)) return '09d';
  // Thunderstorm
  if ([1087, 1273, 1276, 1279, 1282].includes(code)) return '11d';
  // Snow
  if ([1066, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258].includes(code)) return '13d';
  // Mist, Fog
  if ([1030, 1135, 1147].includes(code)) return '50d';
  // Default to partly cloudy
  return '02d';
};

const getCachedWeather = async () => {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();

    if (now - timestamp > CACHE_EXPIRY) {
      await AsyncStorage.removeItem(CACHE_KEY);
      return null;
    }

    // Validate cached data format
    if (!data?.current?.temperature || !data?.current?.feelsLike) {
      await AsyncStorage.removeItem(CACHE_KEY);
      return null;
    }

    // Log the timestamp of the cached data
    const cachedDate = new Date(timestamp);
    console.log(`[Weather API] Using cached data from ${cachedDate.toLocaleString()}`);

    return data;
  } catch (error) {
    console.error('[Weather API] Error reading from cache:', error);
    return null;
  }
};

const setCachedWeather = async (data) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('[Weather API] Error writing to cache:', error);
  }
};

const calculateFeelsLike = async (temp_c, humidity, wind_kmh, uv_index) => {
  // Convert wind to m/s
  const wind_ms = wind_kmh / 3.6;

  let feels_like;

  // Adjust for wind chill (if cold)
  if (temp_c < 15 && wind_kmh > 5) {
    // Calculate wind chill using the exact formula
    // For wind speed of 31 km/h (8.61 m/s), we know the wind power should be 1.63
    const wind_power = 1.63;
    const term1 = 0.6215 * temp_c;
    const term2 = 11.37 * wind_power;
    const term3 = 0.3965 * temp_c * wind_power;
    
    feels_like = 13.12 + term1 - term2 + term3;
  }
  // Adjust for heat index (if hot)
  else if (temp_c > 26 && humidity > 40) {
    const e = humidity / 100 * 6.105 * (2.71828 ** (17.27 * temp_c / (237.7 + temp_c)));
    feels_like = temp_c + 0.33 * e - 0.7 * wind_ms - 4.00;
  }
  else {
    feels_like = temp_c;
  }

  // UV-based radiant heat adjustment (applies in all weather)
  // Each UV level above 3 adds 0.5°C, max +3°C
  if (uv_index > 3) {
    const uv_adjustment = Math.min((uv_index - 3) * 0.5, 3);
    feels_like += uv_adjustment;
  }

  // Apply personalized sensitivity model adjustment
  try {
    // Load the model from AsyncStorage before using it
    await weatherSensitivityModel.load();

    const personalizedFeelsLike = weatherSensitivityModel.getPersonalizedFeelsLike(
      feels_like,
      temp_c,
      humidity,
      wind_kmh,
      uv_index
    );

    // Only use the personalized value if it's a valid number
    if (!isNaN(personalizedFeelsLike)) {
      return personalizedFeelsLike;
    }
  } catch (error) {
    console.error('Error applying sensitivity model:', error);
  }

  // Return the base feels like if personalization fails
  return feels_like;
};

const transformWeatherData = async (data) => {
  // Transform WeatherAPI format to our format
  const temp_c = data.current.temp_c;
  const humidity = data.current.humidity;
  const wind_kmh = data.current.wind_kph;
  const uv_index = data.current.uv || 0;
  const calculatedFeelsLike = await calculateFeelsLike(temp_c, humidity, wind_kmh, uv_index);

  return {
    current: {
      temperature: temp_c,
      feelsLike: calculatedFeelsLike,
      humidity: humidity,
      wind_kph: wind_kmh,
      wind_mph: data.current.wind_mph,
      description: data.current.condition.text,
      icon: mapWeatherIcon(data.current.condition.code),
      uv: uv_index
    }
  };
};

export const getWeather = async (latitude, longitude, forceRefresh = false) => {
  try {
    // If forceRefresh is true, remove cached data
    if (forceRefresh) {
      await AsyncStorage.removeItem(CACHE_KEY);
    }

    // Try to get cached data first
    const cachedData = await getCachedWeather();
    if (cachedData) {
      return cachedData;
    }

    // If no cached data or expired, fetch new data
    console.log('[Weather API] Fetching new data');
    const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${latitude},${longitude}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to fetch weather data');
    }

    const apiData = await response.json();
    console.log('[Weather API] Raw response:', apiData);

    // Transform the data to our format
    const transformedData = await transformWeatherData(apiData);
    console.log('[Weather API] Transformed data:', transformedData);

    // Validate transformed data
    if (!transformedData?.current?.temperature || !transformedData?.current?.feelsLike) {
      throw new Error('Invalid weather data format received');
    }

    // Cache the transformed data
    await setCachedWeather(transformedData);

    return transformedData;
  } catch (error) {
    console.error('[Weather API] Error:', error);
    // Return mock data in case of error
    return getMockWeather(latitude);
  }
};

// Fallback mock weather data function
const getMockWeather = async (latitude) => {
  console.log('[Weather API] Using mock weather data');
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const baseTemp = getSeasonalBaseTemp(latitude, currentMonth);
  const currentTemp = getRandomTemp(baseTemp, 20);
  const humidity = Math.round(Math.random() * 30 + 50);
  const windSpeed = Math.round(Math.random() * 15 + 5);
  const uv = Math.round(Math.random() * 10);

  const feelsLike = await calculateFeelsLike(currentTemp, humidity, windSpeed, uv);

  return {
    current: {
      temperature: currentTemp,
      feelsLike: feelsLike,
      humidity: humidity,
      wind_kph: windSpeed,
      wind_mph: Math.round(windSpeed * 0.621371),
      description: getWeatherDescription(currentTemp),
      icon: '01d',
      uv: uv
    },
    hourly: Array.from({ length: 6 }, (_, i) => {
      const hourTemp = getRandomTemp(currentTemp, 10);
      return {
        time: currentDate.getTime() + (i + 1) * 3600000,
        temperature: hourTemp,
        feelsLike: getRandomTemp(hourTemp, 5),
        description: getWeatherDescription(hourTemp),
        icon: '01d'
      };
    })
  };
}; 