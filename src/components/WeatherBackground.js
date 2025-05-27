import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-web-linear-gradient';

const { width, height } = Dimensions.get('window');

const WeatherBackground = ({ weatherCondition }) => {
  const getBackgroundColors = (condition) => {
    const lowerCondition = condition?.toLowerCase() || '';
    
    if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) {
      return ['#2C3E50', '#3498DB', '#2980B9']; // Rainy blues
    }
    if (lowerCondition.includes('thunder')) {
      return ['#2C3E50', '#34495E', '#2C3E50']; // Storm dark
    }
    if (lowerCondition.includes('snow')) {
      return ['#BDC3C7', '#ECF0F1', '#D5DBDB']; // Snow white
    }
    if (lowerCondition.includes('clear')) {
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 20) {
        return ['#2980B9', '#6DD5FA', '#FFFFFF']; // Clear day
      }
      return ['#2C3E50', '#34495E', '#2C3E50']; // Clear night
    }
    if (lowerCondition.includes('cloud')) {
      return ['#757F9A', '#D7DDE8', '#FFFFFF']; // Cloudy
    }
    if (lowerCondition.includes('fog') || lowerCondition.includes('mist')) {
      return ['#757F9A', '#D7DDE8', '#FFFFFF']; // Foggy
    }
    
    // Default sunny day
    return ['#2980B9', '#6DD5FA', '#FFFFFF'];
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={getBackgroundColors(weatherCondition)}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
});

export default WeatherBackground; 