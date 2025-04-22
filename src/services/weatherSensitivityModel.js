import AsyncStorage from '@react-native-async-storage/async-storage';

const MODEL_KEY = '@weatherwear_sensitivity_model';
const FEEDBACK_HISTORY_KEY = '@weatherwear_feedback_history';
const MAX_FEEDBACK_HISTORY = 10;
const WEIGHT_LIMIT = 1.0; // Maximum absolute value for weights

class WeatherSensitivityModel {
  constructor() {
    this.alpha = 0; // temperature weight
    this.beta = 0;  // humidity weight
    this.gamma = 0; // wind speed weight
    this.delta = 0; // UV index weight
    this.epsilon = 0; // bias/intercept
    this.lr = 0.05; // learning rate
    this.feedbackHistory = [];
    this.lastWeightedAdjustment = 0;
  }

  async load() {
    try {
      // Load model weights
      const savedModel = await AsyncStorage.getItem(MODEL_KEY);
      if (savedModel) {
        const parsedModel = JSON.parse(savedModel);
        if (parsedModel && parsedModel.weights) {
          this.alpha = this.clampWeight(parsedModel.weights.alpha || 0);
          this.beta = this.clampWeight(parsedModel.weights.beta || 0);
          this.gamma = this.clampWeight(parsedModel.weights.gamma || 0);
          this.delta = this.clampWeight(parsedModel.weights.delta || 0);
          this.epsilon = this.clampWeight(parsedModel.weights.epsilon || 0);
        }
      }

      // Load shared feedback history
      const savedFeedback = await AsyncStorage.getItem(FEEDBACK_HISTORY_KEY);
      this.feedbackHistory = savedFeedback ? JSON.parse(savedFeedback) : [];

      // Debug log for feedback history
      console.log('[Model Load Debug]', {
        feedbackCount: this.feedbackHistory.length,
        feedbacks: this.feedbackHistory.map(f => ({
          timestamp: f.timestamp,
          feedback: f.feedback,
          temp: f.temp
        }))
      });
    } catch (error) {
      console.error('Error loading sensitivity model:', error);
      this.resetWeights();
    }
  }

  clampWeight(weight) {
    return Math.max(Math.min(weight, WEIGHT_LIMIT), -WEIGHT_LIMIT);
  }

  async resetWeights() {
    this.alpha = 0;
    this.beta = 0;
    this.gamma = 0;
    this.delta = 0;
    this.epsilon = 0;
    this.feedbackHistory = [];
    this.lastWeightedAdjustment = 0;
    
    // Clear both model weights and feedback history from storage
    try {
      await AsyncStorage.multiRemove([MODEL_KEY, FEEDBACK_HISTORY_KEY]);
    } catch (error) {
      console.error('Error clearing model data:', error);
    }
  }

  async save() {
    try {
      // Only save model weights, not feedback history
      const modelData = {
        weights: {
          alpha: this.alpha,
          beta: this.beta,
          gamma: this.gamma,
          delta: this.delta,
          epsilon: this.epsilon
        }
      };
      await AsyncStorage.setItem(MODEL_KEY, JSON.stringify(modelData));
    } catch (error) {
      console.error('Error saving sensitivity model:', error);
    }
  }

  predict(temp, humidity, wind, uv) {
    // Validate inputs
    if (!this.areValidInputs(temp, humidity, wind, uv)) {
      console.warn('[Predict] Invalid inputs:', { temp, humidity, wind, uv });
      return 0;
    }

    // Log inputs and weights for debugging
    console.log('[Predict Debug]', {
      temp,
      humidity,
      wind,
      uv,
      alpha: this.alpha,
      beta: this.beta,
      gamma: this.gamma,
      delta: this.delta,
      epsilon: this.epsilon
    });

    const prediction = (
      this.alpha * temp +
      this.beta * humidity +
      this.gamma * wind +
      this.delta * uv +
      this.epsilon
    );

    return prediction; // Return raw prediction without clamping
  }

  areValidInputs(temp, humidity, wind, uv) {
    return (
      Number.isFinite(temp) &&
      Number.isFinite(humidity) &&
      Number.isFinite(wind) &&
      Number.isFinite(uv) &&
      temp >= -50 && temp <= 50 && // Reasonable temperature range
      humidity >= 0 && humidity <= 100 && // Valid humidity range
      wind >= 0 && wind <= 200 && // Reasonable wind speed
      uv >= 0 && uv <= 15 // Reasonable UV index
    );
  }

  feedbackToScore(feedback) {
    switch (feedback) {
      case 'cold':
        return -1;
      case 'warm':
        return 1;
      case 'perfect':
        return 0;
      default:
        return 0;
    }
  }

  async update(temp, humidity, wind, uv, feedback) {
    // Validate inputs
    if (!this.areValidInputs(temp, humidity, wind, uv)) {
      console.warn('[SGD] Skipping update due to invalid inputs:', { temp, humidity, wind, uv });
      return;
    }

    // Add new feedback to history
    const newFeedback = {
      timestamp: new Date().toISOString(),
      temp,
      humidity,
      wind,
      uv,
      feedback
    };

    // Debug log before update
    console.log('[Update Debug]', {
      currentCount: this.feedbackHistory.length,
      newFeedback: newFeedback,
      existingFeedbacks: this.feedbackHistory.map(f => ({
        timestamp: f.timestamp,
        feedback: f.feedback
      }))
    });

    // Update local feedback history
    this.feedbackHistory = [newFeedback];

    // Save feedback to shared storage
    await AsyncStorage.setItem(FEEDBACK_HISTORY_KEY, JSON.stringify(this.feedbackHistory));

    // Debug log after update
    console.log('[Update Debug]', {
      newCount: this.feedbackHistory.length,
      feedbacks: this.feedbackHistory.map(f => ({
        timestamp: f.timestamp,
        feedback: f.feedback
      }))
    });

    // Convert feedback to numerical score
    const y = this.feedbackToScore(feedback);
    
    // Compute prediction
    const y_hat = this.predict(temp, humidity, wind, uv);
    
    // Compute error
    const error = y - y_hat;

    // Update weights using SGD
    this.alpha = this.clampWeight(this.alpha + this.lr * error * temp);
    this.beta = this.clampWeight(this.beta + this.lr * error * humidity);
    this.gamma = this.clampWeight(this.gamma + this.lr * error * wind);
    this.delta = this.clampWeight(this.delta + this.lr * error * uv);
    this.epsilon = this.clampWeight(this.epsilon + this.lr * error);

    // Save updated model weights
    await this.save();
  }

  getPersonalizedFeelsLike(baseFeelsLike, temp, humidity, wind, uv) {
    const feedbackCount = this.feedbackHistory.length;
    
    // Debug log for feedback count
    console.log('[Feedback Count Debug]', {
      count: feedbackCount,
      feedbacks: this.feedbackHistory.map(f => ({
        timestamp: f.timestamp,
        feedback: f.feedback
      }))
    });
   
    if (feedbackCount === 0 || !Number.isFinite(baseFeelsLike)) {
      return baseFeelsLike;
    }
    
    // Predict raw bias
    const rawBias = this.predict(temp, humidity, wind, uv);
   
    // Clamp raw bias before applying weight (true control)
    const clampedBias = Math.max(Math.min(rawBias, 10), -10);
   
    // Apply sigmoid-style weight (less trust with fewer feedbacks)
    const biasWeight = 1 / (1 + Math.exp(-0.7 * (feedbackCount - 5)));
   
    // Weighted adjustment
    this.lastWeightedAdjustment = clampedBias * biasWeight;
    console.log('[PersonalizedFeelsLike] Weighted adjustment:', {
      baseFeelsLike,
      rawBias,
      clampedBias,
      biasWeight,
      weightedAdjustment: this.lastWeightedAdjustment,
      feedbackCount
    });
   
    const personalized = baseFeelsLike + this.lastWeightedAdjustment;
   
    if (!Number.isFinite(personalized)) {
      console.warn('[PersonalizedFeelsLike] Invalid result:', {
        baseFeelsLike,
        rawBias,
        clampedBias,
        biasWeight,
        weightedAdjustment: this.lastWeightedAdjustment,
        personalized
      });
      return baseFeelsLike;
    }
    
    return personalized;
  }

  getLastWeightedAdjustment() {
    return this.lastWeightedAdjustment;
  }
}

// Create and export a singleton instance
const weatherSensitivityModel = new WeatherSensitivityModel();
export default weatherSensitivityModel; 