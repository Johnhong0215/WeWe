import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPreferences } from './feedbackService';

// Base layer recommendation (kept for potential additional features)
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

// Outer layer recommendation (kept for potential additional features)
const getOuterLayer = async (temperature, precipitation) => {
  const preferences = await getPreferences();
  if (preferences) {
    temperature += preferences.temperatureOffset;
  }
  if (temperature < 0) {
    return 'a heavy winter coat';
  } else if (temperature < 7) {
    return 'a warm winter jacket';
  } else if (temperature < 15) {
    return 'a light jacket';
  } else if (temperature < 21 || precipitation) {
    return 'a light windbreaker';
  }
  return null;
};

// Bottoms recommendation (kept for potential additional features)
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

// Accessories recommendation (kept for potential additional features)
const getAccessories = async (temperature, windSpeed, precipitation) => {
  const preferences = await getPreferences();
  if (preferences) {
    temperature += preferences.temperatureOffset;
  }
  const accessories = [];
  if (temperature < 7) {
    accessories.push('a warm hat', 'gloves', 'a scarf');
  } else if (temperature < 13 && windSpeed > 10) {
    accessories.push('a light hat');
  }
  if (precipitation) {
    accessories.push('an umbrella');
  }
  if (temperature > 24) {
    accessories.push('a sun hat or cap', 'sunglasses');
  }
  return accessories;
};

// Temperature categories based on the adjusted "feels like" temperature
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

// Outfit options for each level (1-10) and for each gender
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

// Helper function: Convert category name to a numeric level (1-10)
const categoryToLevel = (category) => {
  const categories = Object.keys(TEMPERATURE_CATEGORIES);
  return categories.indexOf(category) + 1;
};

// Helper function: Lookup base category based on adjusted temperature
const getCategoryFromTemp = (temp) => {
  for (const [category, range] of Object.entries(TEMPERATURE_CATEGORIES)) {
    if (temp >= range.min && temp <= range.max) {
      return category;
    }
  }
  return 'SUPER_COLD';
};

// UV Index scale and recommendations
const UV_LEVELS = {
  LOW: { min: 0, max: 2, label: 'Low', recommendations: [] },
  MODERATE: { min: 3, max: 5, label: 'Moderate', recommendations: ['Consider wearing a hat'] },
  HIGH: { min: 6, max: 7, label: 'High', recommendations: ['Wear a hat', 'Use sunscreen', 'Wear sunglasses'] },
  VERY_HIGH: { min: 8, max: 10, label: 'Very High', recommendations: ['Wear a hat', 'Use sunscreen SPF 30+', 'Wear sunglasses', 'Seek shade during midday'] },
  EXTREME: { min: 11, max: Infinity, label: 'Extreme', recommendations: ['Wear a hat', 'Use sunscreen SPF 50+', 'Wear sunglasses', 'Seek shade during midday', 'Limit time in direct sun'] }
};

// Returns UV advisory recommendations based on UV index
const getUVAdvisory = (uv) => {
  for (const [level, range] of Object.entries(UV_LEVELS)) {
    if (uv >= range.min && uv <= range.max) {
      return {
        level: level,
        label: range.label,
        recommendations: range.recommendations
      };
    }
  }
  return {
    level: 'LOW',
    label: 'Low',
    recommendations: []
  };
};

// Classify temperature with adjustments following the specified logic:
// 1. adjustedFeelsLike = feelsLikeC - userComfortBias
// 2. baseCategory = lookup_category(adjustedFeelsLike)
// 3. If wind > 15 km/h AND category level ≤ 6 → level -= 1
// 4. If humidity > 80% AND adjustedFeelsLike > 25°C → level += 1
// 5. Return UV advisory based on UV index
export function classifyTemperature(feelsLikeC, wind = 0, humidity = 0, uv = 0, userComfortBias = 0) {
  let adjustedFeelsLike = feelsLikeC - userComfortBias;
  let baseCategory = getCategoryFromTemp(adjustedFeelsLike);
  let level = categoryToLevel(baseCategory);
  
  // Wind chill adjustment: if wind > 15 km/h and level is 6 or lower, lower one level
  if (wind > 15 && level <= 6) {
    level -= 1;
  }
  
  // Humidity adjustment: if humidity > 80% and adjustedFeelsLike > 25°C, raise one level
  if (humidity > 80 && adjustedFeelsLike > 25) {
    level += 1;
  }
  
  // Ensure the level is between 1 and 10
  level = Math.max(1, Math.min(10, level));
  const finalCategory = Object.keys(TEMPERATURE_CATEGORIES)[level - 1];
  
  return {
    level,
    category: finalCategory,
    adjustedFeelsLike,
    uvAdvisory: getUVAdvisory(uv),
    originalFeelsLike: feelsLikeC
  };
}

// Get an outfit recommendation for the provided level and gender,
// ensuring the recommendation strictly suits the gender from settings.
export function getOutfitRecommendation(level, gender) {
  // Use the OUTFIT_OPTIONS object with level and gender key
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

    // Retrieve user preferences and comfort bias
    const preferences = await getPreferences();
    const userComfortBias = preferences?.temperatureOffset || 0;

    // Retrieve gender from settings stored under the key '@gender'
    const gender = await AsyncStorage.getItem('@gender') || 'male';

    // Retrieve weather parameters (assuming temperature in Celsius)
    const feelsLikeC = weatherData.current.feelsLike;
    const wind = weatherData.current.windSpeed || 0;
    const humidity = weatherData.current.humidity || 0;
    const uv = weatherData.current.uv || 0;

    // Classify temperature according to the specified logic
    const classification = classifyTemperature(feelsLikeC, wind, humidity, uv, userComfortBias);

    // Get an outfit recommendation based on the computed level and selected gender
    const recommendation = getOutfitRecommendation(classification.level, gender);

    // Prepare the final response, including UV advisory if applicable
    return {
      recommendation,
      category: classification.category,
      adjustedFeelsLike: classification.adjustedFeelsLike,
      originalFeelsLike: classification.originalFeelsLike,
      uvAdvisory: classification.uvAdvisory
    };
  } catch (error) {
    console.error('Error getting recommendation:', error);
    throw error;
  }
};
