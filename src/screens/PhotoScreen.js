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

export default function PhotoScreen() {
  const [photos, setPhotos] = useState([]);

  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status === 'granted') {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 1,
        allowsEditing: true,
      });
  
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotos([{ uri: result.assets[0].uri, date: new Date() }, ...photos]);
      }
    } else {
      alert('Gallery permission is required to select photos');
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
              <Text style={styles.historyDate}>
                {photo.date.toLocaleDateString()}
              </Text>
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
  historyDate: {
    fontSize: 16,
    color: '#666',
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
