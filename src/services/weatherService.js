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

export const getWeather = async (latitude, longitude) => {
  try {
    const query = `${latitude},${longitude}`;
    const response = await fetch(
      `${BASE_URL}/forecast.json?key=${API_KEY}&q=${query}&days=1&aqi=yes`
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Weather API Error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to fetch weather data');
    }

    const data = await response.json();
    console.log('Raw Weather API Response:', JSON.stringify(data, null, 2));

    // Validate current weather data
    if (!data.current) {
      console.error('Missing current weather data');
      throw new Error('Invalid API response structure');
    }

    // Create current weather object
    const currentWeather = {
      temperature: Math.round(data.current.temp_f),
      feelsLike: Math.round(data.current.feelslike_f),
      humidity: data.current.humidity,
      windSpeed: Math.round(data.current.wind_mph),
      description: data.current.condition.text.toLowerCase(),
      icon: mapWeatherIcon(data.current.condition.code)
    };

    // Validate and process forecast data
    let hourlyForecast = [];
    if (data.forecast?.forecastday?.[0]?.hour) {
      const currentTime = new Date();
      hourlyForecast = data.forecast.forecastday[0].hour
        .filter(hour => new Date(hour.time) > currentTime)
        .slice(0, 6)
        .map(hour => ({
          time: new Date(hour.time).getTime(),
          temperature: Math.round(hour.temp_f),
          feelsLike: Math.round(hour.feelslike_f),
          description: hour.condition.text.toLowerCase(),
          icon: mapWeatherIcon(hour.condition.code)
        }));

      // If we don't have enough hours in the current day, try to get some from the next day
      if (hourlyForecast.length < 6 && data.forecast?.forecastday?.[1]?.hour) {
        const nextDayHours = data.forecast.forecastday[1].hour
          .slice(0, 6 - hourlyForecast.length)
          .map(hour => ({
            time: new Date(hour.time).getTime(),
            temperature: Math.round(hour.temp_f),
            feelsLike: Math.round(hour.feelslike_f),
            description: hour.condition.text.toLowerCase(),
            icon: mapWeatherIcon(hour.condition.code)
          }));
        hourlyForecast = [...hourlyForecast, ...nextDayHours];
      }
    }

    // Return both current and hourly data
    const weatherData = {
      current: currentWeather,
      hourly: hourlyForecast
    };

    console.log('Processed Weather Data:', JSON.stringify(weatherData, null, 2));
    return weatherData;

  } catch (error) {
    console.error('Error in getWeather:', error.message);
    console.log('Falling back to mock data');
    return getMockWeather(latitude);
  }
};

// Fallback mock weather data function
const getMockWeather = (latitude) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const baseTemp = getSeasonalBaseTemp(latitude, currentMonth);
  const currentTemp = getRandomTemp(baseTemp, 20);

  return {
    current: {
      temperature: currentTemp,
      feelsLike: getRandomTemp(currentTemp, 5),
      humidity: Math.round(Math.random() * 30 + 50),
      windSpeed: Math.round(Math.random() * 15 + 5),
      description: getWeatherDescription(currentTemp),
      icon: '01d'
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