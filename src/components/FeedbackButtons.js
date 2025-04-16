import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { getLastFeedback, getFeedbackMessage } from '../services/feedbackService';

const FeedbackButtons = ({ onFeedback }) => {
  const [lastFeedback, setLastFeedback] = useState(null);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    checkLastFeedback();
  }, []);

  const checkLastFeedback = async () => {
    const feedback = await getLastFeedback();
    setLastFeedback(feedback);
    setIsChanging(false);
  };

  const handleFeedback = async (type) => {
    await onFeedback(type);
    checkLastFeedback();
  };

  const renderFeedbackButtons = () => (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={[styles.button, styles.coldButton]}
        onPress={() => handleFeedback('cold')}
      >
        <Text style={styles.buttonText}>Too Cold</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.perfectButton]}
        onPress={() => handleFeedback('perfect')}
      >
        <Text style={styles.buttonText}>Perfect</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.warmButton]}
        onPress={() => handleFeedback('warm')}
      >
        <Text style={styles.buttonText}>Too Warm</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFeedbackMessage = () => (
    <View style={styles.messageContainer}>
      <Text style={styles.feedbackMessage}>
        {getFeedbackMessage(lastFeedback.type)}
      </Text>
      <TouchableOpacity 
        style={styles.changeButton}
        onPress={() => setIsChanging(true)}
      >
        <Text style={styles.changeButtonText}>Change Response</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {(isChanging || !lastFeedback) ? renderFeedbackButtons() : renderFeedbackMessage()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 10,
    marginTop: 15,
    marginBottom: 40,
    padding: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
  },
  coldButton: {
    backgroundColor: '#4A90E2',
  },
  perfectButton: {
    backgroundColor: '#2ECC71',
  },
  warmButton: {
    backgroundColor: '#E74C3C',
  },
  buttonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  messageContainer: {
    alignItems: 'center',
  },
  feedbackMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  changeButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  changeButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});

export default FeedbackButtons; 