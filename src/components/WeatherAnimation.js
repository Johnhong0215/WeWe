import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const WeatherAnimation = ({ gender = 'male', weatherData }) => {
  const isWindy = weatherData?.current?.wind_kph > 20;
  
  return (
    <View style={styles.container}>
      <Image
        key={`${gender}-${isWindy}`}
        source={
          isWindy
            ? gender === 'female'
              ? require('../../assets/animation/female_wind.gif')
              : require('../../assets/animation/male_wind.gif')
            : gender === 'female'
              ? require('../../assets/animation/female.gif')
              : require('../../assets/animation/male.gif')
        }
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