import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPreferences } from './feedbackService';

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
      "Light jacket, sweater, jeans",
      "Fleece jacket, long-sleeve shirt, chinos",
      "Light coat, hoodie, trousers"
    ],
    female: [
      "Light jacket, sweater, jeans",
      "Cardigan, long-sleeve top, pants",
      "Light coat, blouse, trousers"
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
  const options = OUTFIT_OPTIONS[levelStr]?.[validGender] || [];
  if (!options.length) return 'No outfit recommendation available';
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