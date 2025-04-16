import { getPreferences } from './feedbackService';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Outfit options for each level and gender
const OUTFIT_OPTIONS = {
  "1": {
    male: [
      "Heavy down parka, thermal innerwear, gloves, snow boots",
      "Wool coat, scarf, insulated pants, beanie",
      "Puffer jacket, fleece hoodie, insulated jeans, winter boots"
    ],
    female: [
      "Long down coat, fleece leggings, thermal boots, gloves",
      "Wool overcoat, turtleneck, knit hat and scarf",
      "Quilted jacket, thermal dress, leggings, knee-high boots"
    ]
  },
  "2": {
    male: [
      "Parka, hoodie, wool socks, beanie",
      "Puffer vest over sweatshirt, corduroy pants, gloves",
      "Peacoat, knit scarf, boots, thick jeans"
    ],
    female: [
      "Padded coat, fleece-lined leggings, thermal boots",
      "Sherpa jacket, thermal undershirt, scarf, warm pants",
      "Wool turtleneck, warm trousers, mittens, leather boots"
    ]
  },
  "3": {
    male: [
      "Jacket, sweater, jeans, boots",
      "Leather jacket, hoodie, warm chinos",
      "Light down jacket, beanie, thermal socks"
    ],
    female: [
      "Trench coat, sweater, jeans, ankle boots",
      "Bomber jacket, thermal dress, leggings",
      "Cropped jacket, wool scarf, boots"
    ]
  },
  "4": {
    male: [
      "Hoodie with denim jacket, joggers",
      "Fleece pullover, khakis",
      "Sweatshirt, vest, jeans"
    ],
    female: [
      "Cardigan, leggings, scarf",
      "Long-sleeve top, jeans, ankle boots",
      "Sweater with skirt and tights"
    ]
  },
  "5": {
    male: [
      "Long sleeve T-shirt, jeans",
      "Windbreaker over tee, joggers",
      "Lightweight jacket, polo shirt, chinos"
    ],
    female: [
      "Denim jacket, dress",
      "T-shirt and midi skirt",
      "Long-sleeve top and jeans"
    ]
  },
  "6": {
    male: [
      "T-shirt and jeans",
      "Polo shirt and chinos",
      "Henley with joggers"
    ],
    female: [
      "Blouse and jeans",
      "Maxi dress with sandals",
      "T-shirt and shorts"
    ]
  },
  "7": {
    male: [
      "Short-sleeve shirt and shorts",
      "Tank top and jogger shorts",
      "Linen shirt and chinos"
    ],
    female: [
      "Tank top and shorts",
      "Light dress and sandals",
      "Crop top and wide-leg pants"
    ]
  },
  "8": {
    male: [
      "Sleeveless tee, cotton shorts",
      "Dry-fit polo, hat, sunglasses",
      "Light button-up with sleeves rolled, chino shorts"
    ],
    female: [
      "Sleeveless dress with sandals",
      "Crop top and shorts",
      "Romper and sunhat"
    ]
  },
  "9": {
    male: [
      "Muscle tee, athletic shorts, baseball cap",
      "Cotton shirt, UV sunglasses, mesh shoes",
      "Linen button-down, flip flops, wrist towel"
    ],
    female: [
      "Tank dress and sunglasses",
      "Bra top and skirt",
      "Loose tee with linen shorts"
    ]
  },
  "10": {
    male: [
      "Sleeveless tank, shorts, cold towel",
      "Open button shirt, sandals, hat",
      "Thin mesh dry-fit tee, cap, sunglasses"
    ],
    female: [
      "Sports bra and shorts",
      "Thin slip dress and sun visor",
      "Loose-fit shirt, linen shorts, cold pack"
    ]
  }
};

// Temperature categories based on adjusted feels like
const TEMPERATURE_CATEGORIES = {
  SUPER_COLD: { min: -Infinity, max: -10, label: 'Super Cold' },
  VERY_COLD: { min: -9, max: -1, label: 'Very Cold' },
  COLD: { min: 0, max: 4, label: 'Cold' },
  CHILLY: { min: 5, max: 9, label: 'Chilly' },
  COOL: { min: 10, max: 14, label: 'Cool' },
  MILD: { min: 15, max: 18, label: 'Mild' },
  WARM: { min: 19, max: 23, label: 'Warm' },
  HOT: { min: 24, max: 28, label: 'Hot' },
  VERY_HOT: { min: 29, max: 33, label: 'Very Hot' },
  SUPER_HOT: { min: 34, max: Infinity, label: 'Super Hot' }
};

// Convert category to numeric level (1-10)
const categoryToLevel = (category) => {
  const categories = Object.keys(TEMPERATURE_CATEGORIES);
  return categories.indexOf(category) + 1;
};

// Get category from temperature
const getCategoryFromTemp = (temp) => {
  for (const [category, range] of Object.entries(TEMPERATURE_CATEGORIES)) {
    if (temp >= range.min && temp <= range.max) {
      return category;
    }
  }
  return 'SUPER_COLD'; // fallback
};

// Classify temperature with all adjustments
export function classifyTemperature(feelsLikeC, wind = 0, humidity = 0, uv = 0, userComfortBias = 0) {
  // Step 1: Apply personal comfort bias
  let adjustedFeelsLike = feelsLikeC - userComfortBias;

  // Step 2: Get base category
  let category = getCategoryFromTemp(adjustedFeelsLike);
  let level = categoryToLevel(category);

  // Step 3: Wind chill adjustment
  if (wind > 15 && level <= 6) {
    level -= 1;
  }

  // Step 4: Humidity adjustment
  if (feelsLikeC > 25 && humidity > 80) {
    level += 1;
  }

  // Ensure level stays within bounds
  level = Math.max(1, Math.min(10, level));

  return {
    level,
    category: Object.keys(TEMPERATURE_CATEGORIES)[level - 1],
    adjustedFeelsLike,
    uvAdvisory: uv >= 6,
    originalFeelsLike: feelsLikeC
  };
}

// Get UV advisory text
const getUVAdvisory = (uv) => {
  if (uv >= 6) {
    return [
      "Wear a hat",
      "Use sunscreen",
      "Wear sunglasses"
    ];
  }
  return [];
};

// Check for upcoming temperature shift
const checkTemperatureShift = (hourlyData) => {
  if (!hourlyData || hourlyData.length < 6) return null;
  
  const currentTemp = hourlyData[0].feelsLike;
  const maxDiff = Math.max(
    ...hourlyData.slice(3, 6).map(hour => 
      Math.abs(hour.feelsLike - currentTemp)
    )
  );

  if (maxDiff >= 7) {
    const futureTemp = hourlyData[5].feelsLike;
    return {
      hasShift: true,
      currentTemp,
      futureTemp,
      hoursAhead: 6
    };
  }
  return null;
};

// Get a random outfit recommendation for a given level and gender
export function getOutfitRecommendation(level, gender) {
  const options = OUTFIT_OPTIONS[level]?.[gender];
  if (!options) return "No recommendation available.";
  const idx = Math.floor(Math.random() * options.length);
  return options[idx];
}

// Main recommendation function
export const getRecommendation = async (weatherData) => {
  try {
    if (!weatherData?.current?.feelsLike) {
      throw new Error('Invalid weather data for recommendation');
    }

    // Get user preferences and comfort bias
    const preferences = await getPreferences();
    const userComfortBias = preferences?.temperatureOffset || 0;

    // Get gender preference
    const gender = await AsyncStorage.getItem('@weatherwear_gender') || 'male';

    // Convert feels like to Celsius if needed
    const feelsLikeF = weatherData.current.feelsLike;
    const feelsLikeC = Math.round((feelsLikeF - 32) * 5 / 9);
    const wind = weatherData.current.windSpeed || 0;
    const humidity = weatherData.current.humidity || 0;
    const uv = weatherData.current.uv || 0;

    // Get classification with all adjustments
    const classification = classifyTemperature(
      feelsLikeC,
      wind,
      humidity,
      uv,
      userComfortBias
    );

    // Get base recommendation
    const recommendation = getOutfitRecommendation(classification.level, gender);

    // Check for temperature shift
    const tempShift = checkTemperatureShift(weatherData.hourly);

    // Prepare response
    const response = {
      recommendation,
      category: classification.category,
      adjustedFeelsLike: classification.adjustedFeelsLike,
      originalFeelsLike: classification.originalFeelsLike,
      uvAdvisory: classification.uvAdvisory ? getUVAdvisory(uv) : [],
      temperatureShift: tempShift
    };

    // If there's a significant temperature shift, add future recommendation
    if (tempShift?.hasShift) {
      const futureClassification = classifyTemperature(
        Math.round((tempShift.futureTemp - 32) * 5 / 9),
        wind,
        humidity,
        uv,
        userComfortBias
      );
      response.futureRecommendation = getOutfitRecommendation(
        futureClassification.level,
        gender
      );
    }

    return response;
  } catch (error) {
    console.error('Error getting recommendation:', error);
    throw error;
  }
}; 