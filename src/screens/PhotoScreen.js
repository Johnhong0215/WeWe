// src/screens/PhotoScreen.js

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const API_URL = 'http://10.194.53.170:5001/analyze';

const analyzeImage = async (uri) => {
  try {
    const formData = new FormData();
    formData.append('image', {
      uri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    });

    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
};

export default function PhotoScreen() {
  const [photos, setPhotos] = useState([]);

  const openGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        const analysis = await analyzeImage(result.assets[0].uri);
        setPhotos([{ uri: result.assets[0].uri, date: analysis.date, clothes: analysis.clothes }, ...photos]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };
  
  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: [ImagePicker.MediaType.image],
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        const analysis = await analyzeImage(result.assets[0].uri);
        setPhotos([{ uri: result.assets[0].uri, date: analysis.date, clothes: analysis.clothes }, ...photos]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Logo */}
      <View style={styles.header}>
        <Image 
          source={require('../../assets/images/WeatherWear.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* History Section */}
      <ScrollView style={styles.historyContainer}>
        <Text style={styles.historyTitle}>Outfit History</Text>
        {photos.length === 0 ? (
          <View style={styles.emptyHistory}>
            <Text style={styles.emptyText}>No outfits recorded yet</Text>
            <Text style={styles.emptySubText}>Add a photo of your outfit to start tracking!</Text>
          </View>
        ) : (
          photos.map((photo, index) => (
            <View key={index} style={styles.historyItem}>
              <Image source={{ uri: photo.uri }} style={styles.historyImage} />
              <View style={styles.historyDetails}>
                <Text style={styles.historyDate}>{photo.date}</Text>
                <View style={styles.clothesContainer}>
                  {photo.clothes && photo.clothes.map((item, itemIndex) => (
                    <View key={itemIndex} style={styles.clothesItem}>
                      <Text style={styles.clothesText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Photo Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={openGallery}
        >
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text style={[styles.buttonText, styles.primaryButtonText]}>Add Photo</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 0,
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    zIndex: 1,
  },
  logo: {
    width: 250,
    height: 100,
    marginTop: -15,
    marginBottom: -30,
    marginLeft: -5,
  },
  historyContainer: {
    flex: 1,
    padding: 20,
  },
  historyTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  emptyHistory: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 10,
  },
  historyImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  historyDetails: {
    flex: 1,
  },
  historyDate: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  clothesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  clothesItem: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  clothesText: {
    fontSize: 12,
    color: '#333',
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 35,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#fff',
  },
});
