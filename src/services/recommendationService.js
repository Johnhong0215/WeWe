import { getPreferences } from './feedbackService';

const getBaseLayer = async (temperature) => {
  const preferences = await getPreferences();
  if (preferences) {
    temperature += preferences.temperatureOffset;
  }

  if (temperature < 40) {
    return 'a thermal base layer';
  } else if (temperature < 60) {
    return 'a long-sleeve shirt';
  } else if (temperature < 75) {
    return 'a t-shirt';
  } else {
    return 'a light, breathable t-shirt';
  }
};

const getOuterLayer = async (temperature, precipitation) => {
  const preferences = await getPreferences();
  if (preferences) {
    temperature += preferences.temperatureOffset;
  }

  if (temperature < 32) {
    return 'a heavy winter coat';
  } else if (temperature < 45) {
    return 'a warm winter jacket';
  } else if (temperature < 60) {
    return 'a light jacket';
  } else if (temperature < 70 || precipitation) {
    return 'a light windbreaker';
  }
  return null;
};

const getBottoms = async (temperature) => {
  const preferences = await getPreferences();
  if (preferences) {
    temperature += preferences.temperatureOffset;
  }

  if (temperature < 40) {
    return 'warm pants or thermal leggings';
  } else if (temperature < 60) {
    return 'long pants';
  } else if (temperature < 75) {
    return 'light pants or long shorts';
  } else {
    return 'shorts';
  }
};

const getAccessories = async (temperature, windSpeed, precipitation) => {
  const preferences = await getPreferences();
  if (preferences) {
    temperature += preferences.temperatureOffset;
  }

  const accessories = [];

  if (temperature < 45) {
    accessories.push('a warm hat', 'gloves', 'a scarf');
  } else if (temperature < 55 && windSpeed > 10) {
    accessories.push('a light hat');
  }

  if (precipitation) {
    accessories.push('an umbrella');
  }

  if (temperature > 75) {
    accessories.push('a sun hat or cap', 'sunglasses');
  }

  return accessories;
};

export const getRecommendation = async (weatherData) => {
  try {
    if (!weatherData?.current?.temperature || !weatherData?.current?.windSpeed) {
      throw new Error('Invalid weather data for recommendation');
    }

    const { temperature, windSpeed } = weatherData.current;
    const precipitation = weatherData.current.description?.includes('rain') || 
                         weatherData.current.description?.includes('snow') || false;

    const [baseLayer, outerLayer, bottoms, accessories] = await Promise.all([
      getBaseLayer(temperature),
      getOuterLayer(temperature, precipitation),
      getBottoms(temperature),
      getAccessories(temperature, windSpeed, precipitation)
    ]);

    let recommendation = `Wear ${baseLayer} and ${bottoms}`;

    if (outerLayer) {
      recommendation += `, with ${outerLayer}`;
    }

    if (accessories.length > 0) {
      const accessoryString = accessories.join(', ').replace(/,([^,]*)$/, ' and$1');
      recommendation += `. Don't forget ${accessoryString}`;
    }

    // Check for significant weather changes in the next few hours
    if (weatherData.hourly && weatherData.hourly.length > 0) {
      const nextFewHours = weatherData.hourly.slice(0, Math.min(4, weatherData.hourly.length));
      if (nextFewHours.length > 0) {
        const tempChange = Math.abs(nextFewHours[nextFewHours.length - 1].temperature - temperature);
        if (tempChange > 15) {
          const direction = nextFewHours[nextFewHours.length - 1].temperature > temperature ? 'warmer' : 'cooler';
          recommendation += `\n\nNote: It will get ${direction} later. Consider bringing layers.`;
        }
      }
    }

    return recommendation;
  } catch (error) {
    console.error('Error generating recommendation:', error);
    return 'Unable to generate clothing recommendation at this time.';
  }
}; 