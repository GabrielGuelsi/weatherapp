import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

const RainDrop = ({ delay = 0 }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.rainDrop,
        {
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-10, height],
              }),
            },
          ],
          opacity: animatedValue.interpolate({
            inputRange: [0, 0.8, 1],
            outputRange: [0, 1, 0],
          }),
        },
      ]}
    />
  );
};

const SnowFlake = ({ delay = 0 }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const swayValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fallAnimation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );

    const swayAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(swayValue, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(swayValue, {
          toValue: -1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    fallAnimation.start();
    swayAnimation.start();
    return () => {
      fallAnimation.stop();
      swayAnimation.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.snowFlake,
        {
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-10, height],
              }),
            },
            {
              translateX: swayValue.interpolate({
                inputRange: [-1, 1],
                outputRange: [-20, 20],
              }),
            },
          ],
          opacity: animatedValue.interpolate({
            inputRange: [0, 0.8, 1],
            outputRange: [0, 1, 0],
          }),
        },
      ]}
    />
  );
};

const WeatherEffects = ({ weatherCondition }) => {
  const renderRain = () => {
    const raindrops = [];
    for (let i = 0; i < 50; i++) {
      const randomX = Math.random() * width;
      const randomDelay = Math.random() * 1500;
      raindrops.push(
        <Animated.View key={i} style={[styles.raindropContainer, { left: randomX }]}>
          <RainDrop delay={randomDelay} />
        </Animated.View>
      );
    }
    return raindrops;
  };

  const renderSnow = () => {
    const snowflakes = [];
    for (let i = 0; i < 30; i++) {
      const randomX = Math.random() * width;
      const randomDelay = Math.random() * 3000;
      snowflakes.push(
        <Animated.View key={i} style={[styles.snowflakeContainer, { left: randomX }]}>
          <SnowFlake delay={randomDelay} />
        </Animated.View>
      );
    }
    return snowflakes;
  };

  const lowerCondition = weatherCondition?.toLowerCase() || '';
  
  return (
    <View style={styles.container} pointerEvents="none">
      {(lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) && renderRain()}
      {lowerCondition.includes('snow') && renderSnow()}
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
    overflow: 'hidden',
  },
  raindropContainer: {
    position: 'absolute',
    top: -10,
  },
  rainDrop: {
    width: 2,
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 1,
  },
  snowflakeContainer: {
    position: 'absolute',
    top: -10,
  },
  snowFlake: {
    width: 6,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 3,
  },
});

export default WeatherEffects; 