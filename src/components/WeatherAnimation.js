import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const WeatherAnimation = ({ gender = 'male' }) => {
  return (
    <View style={styles.container}>
      <Image
        source={gender === 'female' ? require('../../assets/animation/female.gif') : require('../../assets/animation/male.gif')}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 250,
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    margin: 15,
    position: 'relative',
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default WeatherAnimation;