export default {
  // Weather information
  temperature: "Temperature",
  feels_like: "Feels like",
  humidity: "Humidity",
  wind: "Wind",
  uv_index: "UV Index",
  rain_chance: "Rain Chance",
  
  // Weather descriptions
  partly_cloudy: "Partly Cloudy",
  windy: "Windy",
  
  // Recommendations
  recommendation: "Recommendation",
  temperature_change_alert: "Temperature Change Alert",
  temperature_change: "Temperature will change by",
  in_hours: "in",
  hours: "hours",
  later: "Later",
  
  // Comfort categories
  comfort_cold: "You tend to get cold easily",
  comfort_warm: "You tend to feel warm more quickly",
  comfort_normal: "Your comfort level is typical",
  
  // Feedback
  feedback_title: "How do you feel?",
  too_cold: "Too Cold",
  just_right: "Just Right",
  too_hot: "Too Hot",
  feedback_cold_message: "You said it feels too cold! We'll adjust our recommendations to be warmer.",
  feedback_warm_message: "You said it feels too warm! We'll adjust our recommendations to be cooler.",
  feedback_perfect_message: "You said it feels perfect! We'll keep this in mind for future recommendations.",
  feedback_thank_you: "Thank you!",
  feedback_help_message: "Your feedback helps us improve our recommendations.",
  feedback_error: "Unable to save your feedback. Please try again.",
  
  // Settings
  settings: "Settings",
  language: "Language",
  temperature_unit: "Temperature Unit",
  gender: "Gender",
  male: "Male",
  female: "Female",
  celsius: "Celsius",
  fahrenheit: "Fahrenheit",
  feedback_history: "Feedback History",
  clear_history: "Clear History",
  comfort_level: "Comfort Level",
  current_comfort_bias: "Current Comfort Bias: {{value}}°C",
  prefer_warmer: "You prefer warmer temperatures",
  prefer_cooler: "You prefer cooler temperatures",
  no_preference: "Your temperature preference is neutral",
  no_feedback_yet: "No feedback history yet",
  clear_success: "Success",
  clear_success_message: "Feedback history has been cleared",
  clear_error: "Error",
  clear_error_message: "Failed to clear feedback history",
  
  // General
  loading: "Getting your weather data...",
  error: "Weather data not available",
  retry: "Retry",
  pull_to_refresh: "Pull to refresh",
  ok: "OK",
  no_recommendation: "No outfit recommendation available",
  
  // Error messages
  location_error: "Unable to access location. Please enable location services and try again.",
  weather_error: "Unable to load weather data. Please check your internet connection and try again.",
  
  // Outfit Recommendations
  outfits: {
    level1: {
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
    level2: {
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
    level3: {
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
    level4: {
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
    level5: {
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
    level6: {
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
    level7: {
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
    level8: {
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
    level9: {
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
    level10: {
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
  },
  
  // Language options
  english: "English",
  korean: "한국어",
  
  // Feedback history
  feedback_label: "Feedback: {{type}}",
  feedback_date_format: "M/D/YYYY, h:mm:ss A",
  temperature_at_time: "Temperature: {{temp}}°{{unit}}",
}; 