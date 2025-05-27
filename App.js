import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    FlatList,
    Keyboard,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import LinearGradient from 'react-native-web-linear-gradient';
import WeatherBackground from './src/components/WeatherBackground';
import WeatherEffects from './src/components/WeatherEffects';
import './src/IconFonts'; // Import icon fonts for web
import { createStyles, darkTheme, lightTheme } from './src/styles/theme';
import { GEOCODING_API_URL, WEATHER_API_URL, convertTemp, getWeatherDescription } from './src/utils/weather';

const { width } = Dimensions.get('window');

const getWeatherIcon = (description) => {
  const lowerDesc = description.toLowerCase();
  if (lowerDesc.includes('clear')) return 'sunny';
  if (lowerDesc.includes('cloud') || lowerDesc.includes('overcast')) return 'partly-sunny';
  if (lowerDesc.includes('rain') || lowerDesc.includes('drizzle')) return 'rainy';
  if (lowerDesc.includes('snow')) return 'snow';
  if (lowerDesc.includes('thunder')) return 'thunderstorm';
  if (lowerDesc.includes('fog') || lowerDesc.includes('mist')) return 'cloud';
  if (lowerDesc.includes('wind')) return 'wind';
  return 'partly-sunny'; // Default icon instead of help-circle
};

const App = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isCelsius, setIsCelsius] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.95));
  
  const theme = isDarkMode ? darkTheme : lightTheme;
  const styles = createStyles(theme);

  useEffect(() => {
    loadSearchHistory();
    getCurrentLocation();
    loadThemePreference();
  }, []);

  useEffect(() => {
    if (weather) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [weather]);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('themePreference');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    try {
      await AsyncStorage.setItem('themePreference', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const loadSearchHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('searchHistory');
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  };

  const saveToHistory = async (searchedCity) => {
    try {
      const updatedHistory = [
        searchedCity,
        ...searchHistory.filter(item => item !== searchedCity)
      ].slice(0, 5);
      setSearchHistory(updatedHistory);
      await AsyncStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  };

  const getCurrentLocation = () => {
    Geolocation.requestAuthorization('whenInUse')
      .then(() => {
        Geolocation.getCurrentPosition(
          position => {
            fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
          },
          error => {
            console.error(error);
            Alert.alert('Error', 'Unable to get current location');
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      })
      .catch(error => {
        console.error('Location permission error:', error);
      });
  };

  const fetchWeatherByCity = async (searchCity) => {
    setLoading(true);
    try {
      console.log('Searching for city:', searchCity);
      // First, get coordinates for the city
      const geoResponse = await axios.get(`${GEOCODING_API_URL}?name=${searchCity}&count=1`);
      
      if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
        throw new Error('City not found');
      }

      const { latitude, longitude, name, country } = geoResponse.data.results[0];
      console.log('Found city:', name, country);
      
      // Then fetch weather using coordinates
      const weatherResponse = await axios.get(
        `${WEATHER_API_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
      );

      const currentWeather = {
        name: `${name}, ${country}`,
        main: {
          temp: weatherResponse.data.current.temperature_2m,
          humidity: weatherResponse.data.current.relative_humidity_2m
        },
        wind: {
          speed: weatherResponse.data.current.wind_speed_10m
        },
        weather: [{
          description: getWeatherDescription(weatherResponse.data.current.weather_code)
        }]
      };

      console.log('Weather data:', currentWeather);

      const dailyForecast = {
        list: weatherResponse.data.daily.time.map((time, index) => ({
          dt: new Date(time).getTime() / 1000,
          main: {
            temp_max: weatherResponse.data.daily.temperature_2m_max[index],
            temp_min: weatherResponse.data.daily.temperature_2m_min[index]
          },
          weather: [{
            description: getWeatherDescription(weatherResponse.data.daily.weather_code[index])
          }]
        }))
      };

      setWeather(currentWeather);
      setForecast(dailyForecast);
      saveToHistory(`${name}, ${country}`);
    } catch (error) {
      console.error('Weather fetch error:', error);
      Alert.alert('Error', error.message === 'City not found' ? 'City not found' : 'Unable to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    try {
      // First try to get the location name through reverse geocoding
      const reverseGeocodingUrl = `${GEOCODING_API_URL}?latitude=${lat}&longitude=${lon}&count=1`;
      let locationName;
      
      try {
        const geoResponse = await axios.get(reverseGeocodingUrl);
        if (geoResponse.data.results && geoResponse.data.results.length > 0) {
          const { name, country } = geoResponse.data.results[0];
          locationName = `${name}, ${country}`;
        } else {
          locationName = `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
        }
      } catch (error) {
        console.error('Reverse geocoding error:', error);
        locationName = `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
      }

      // Fetch weather data
      const weatherResponse = await axios.get(
        `${WEATHER_API_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
      );

      const currentWeather = {
        name: locationName,
        main: {
          temp: weatherResponse.data.current.temperature_2m,
          humidity: weatherResponse.data.current.relative_humidity_2m
        },
        wind: {
          speed: weatherResponse.data.current.wind_speed_10m
        },
        weather: [{
          description: getWeatherDescription(weatherResponse.data.current.weather_code)
        }]
      };

      console.log('Weather data from coords:', currentWeather);

      const dailyForecast = {
        list: weatherResponse.data.daily.time.map((time, index) => ({
          dt: new Date(time).getTime() / 1000,
          main: {
            temp_max: weatherResponse.data.daily.temperature_2m_max[index],
            temp_min: weatherResponse.data.daily.temperature_2m_min[index]
          },
          weather: [{
            description: getWeatherDescription(weatherResponse.data.daily.weather_code[index])
          }]
        }))
      };

      setWeather(currentWeather);
      setForecast(dailyForecast);
      if (locationName && !locationName.includes('°')) {
        saveToHistory(locationName);
      }
    } catch (error) {
      console.error('Weather fetch error:', error);
      Alert.alert('Error', 'Unable to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem('searchHistory');
      setSearchHistory([]);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  // Add debounce function
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Add fetchCitySuggestions function
  const fetchCitySuggestions = async (searchText) => {
    if (searchText.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await axios.get(`${GEOCODING_API_URL}?name=${searchText}&count=5`);
      if (response.data.results) {
        setSuggestions(response.data.results.map(city => ({
          name: city.name,
          country: city.country,
          latitude: city.latitude,
          longitude: city.longitude
        })));
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
  };

  // Create debounced version of fetchCitySuggestions
  const debouncedFetchSuggestions = React.useCallback(
    debounce(fetchCitySuggestions, 300),
    []
  );

  // Update city input handler
  const handleCityInputChange = (text) => {
    setCity(text);
    debouncedFetchSuggestions(text);
  };

  // Add suggestion selection handler
  const handleSuggestionSelect = (suggestion) => {
    setCity(suggestion.name);
    setSuggestions([]);
    fetchWeatherByCity(suggestion.name);
  };

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingContent}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading weather data...</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={styles.container}>
        {weather && (
          <>
            <WeatherBackground weatherCondition={weather.weather[0].description} />
            <WeatherEffects weatherCondition={weather.weather[0].description} />
          </>
        )}
        <View style={styles.content}>
          <View style={styles.searchContainer}>
            <Ionicons 
              name="search" 
              size={20} 
              color={theme.colors.textSecondary} 
              style={{ marginRight: 8 }}
            />
            <TextInput
              style={styles.input}
              placeholder="Search for a city"
              placeholderTextColor={theme.colors.textSecondary}
              value={city}
              onChangeText={handleCityInputChange}
              onSubmitEditing={() => {
                if (city.trim()) {
                  fetchWeatherByCity(city);
                  Keyboard.dismiss();
                }
              }}
            />
            <TouchableOpacity
              style={[styles.themeToggle, { transform: [{ scale: isDarkMode ? 1.1 : 1 }] }]}
              onPress={toggleTheme}
            >
              <Ionicons 
                name={isDarkMode ? 'moon' : 'sunny'} 
                size={20} 
                color="white"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setIsCelsius(!isCelsius)}
            >
              <Text style={styles.buttonText}>{isCelsius ? '°C' : '°F'}</Text>
            </TouchableOpacity>
          </View>

          {suggestions.length > 0 && (
            <Animated.View 
              style={[
                styles.suggestionsContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                }
              ]}
            >
              <FlatList
                data={suggestions}
                keyExtractor={(item, index) => `${item.name}-${index}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.suggestionItem}
                    onPress={() => handleSuggestionSelect(item)}
                  >
                    <Ionicons name="location" size={20} color={theme.colors.primary} />
                    <Text style={styles.suggestionText}>
                      {item.name}, {item.country}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </Animated.View>
          )}

          {searchHistory.length > 0 && (
            <View style={styles.historyContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {searchHistory.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.historyItem}
                    onPress={() => fetchWeatherByCity(item)}
                  >
                    <Ionicons name="time" size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.historyText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity 
                onPress={clearHistory}
                style={styles.clearHistoryButton}
              >
                <Text style={styles.clearHistory}>Clear History</Text>
              </TouchableOpacity>
            </View>
          )}

          {loading ? (
            renderLoadingState()
          ) : weather ? (
            <Animated.ScrollView 
              style={[
                styles.weatherContainer,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateY: slideAnim },
                    { scale: scaleAnim }
                  ],
                }
              ]}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.currentWeather}>
                <Text style={styles.cityName}>{weather.name}</Text>
                <View style={styles.weatherIconContainer}>
                  <LinearGradient
                    colors={[theme.colors.gradient[0] + '20', theme.colors.gradient[1] + '40']}
                    style={styles.iconGradient}
                  >
                    <Ionicons
                      name={getWeatherIcon(weather.weather[0].description)}
                      size={80}
                      color={theme.colors.primary}
                    />
                  </LinearGradient>
                </View>
                <Text style={styles.temperature}>
                  {convertTemp(weather.main.temp, isCelsius)}
                </Text>
                <Text style={styles.description}>
                  {weather.weather[0].description}
                </Text>
                <View style={styles.detailsContainer}>
                  <View style={styles.detailItem}>
                    <LinearGradient
                      colors={[theme.colors.gradient[0] + '20', theme.colors.gradient[1] + '40']}
                      style={styles.detailGradient}
                    >
                      <Ionicons
                        name="water"
                        size={24}
                        color={theme.colors.primary}
                        style={styles.detailIcon}
                      />
                      <Text style={styles.detailLabel}>Humidity</Text>
                      <Text style={styles.detailValue}>{weather.main.humidity}%</Text>
                    </LinearGradient>
                  </View>
                  <View style={styles.detailItem}>
                    <LinearGradient
                      colors={[theme.colors.gradient[0] + '20', theme.colors.gradient[1] + '40']}
                      style={styles.detailGradient}
                    >
                      <Ionicons
                        name="speedometer"
                        size={24}
                        color={theme.colors.primary}
                        style={styles.detailIcon}
                      />
                      <Text style={styles.detailLabel}>Wind Speed</Text>
                      <Text style={styles.detailValue}>{weather.wind.speed} m/s</Text>
                    </LinearGradient>
                  </View>
                </View>
              </View>

              {forecast && (
                <View style={styles.forecast}>
                  <Text style={styles.forecastTitle}>5-Day Forecast</Text>
                  {forecast.list
                    .slice(0, 5)
                    .map((item, index) => (
                      <Animated.View 
                        key={index} 
                        style={[
                          styles.forecastItem,
                          {
                            opacity: fadeAnim,
                            transform: [{ 
                              translateX: slideAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 20 * (index + 1)]
                              })
                            }]
                          }
                        ]}
                      >
                        <Text style={styles.forecastDay}>
                          {new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                        </Text>
                        <View style={styles.forecastIconContainer}>
                          <LinearGradient
                            colors={[theme.colors.gradient[0] + '20', theme.colors.gradient[1] + '40']}
                            style={styles.forecastIconGradient}
                          >
                            <Ionicons
                              name={getWeatherIcon(item.weather[0].description)}
                              size={24}
                              color={theme.colors.primary}
                            />
                          </LinearGradient>
                          <Text style={styles.forecastTemp}>
                            {convertTemp(item.main.temp_max, isCelsius)} / {convertTemp(item.main.temp_min, isCelsius)}
                          </Text>
                        </View>
                        <Text style={styles.forecastDescription}>
                          {item.weather[0].description}
                        </Text>
                      </Animated.View>
                    ))}
                </View>
              )}
            </Animated.ScrollView>
          ) : (
            <View style={styles.placeholder}>
              <LinearGradient
                colors={[theme.colors.gradient[0] + '20', theme.colors.gradient[1] + '40']}
                style={styles.placeholderIconContainer}
              >
                <Ionicons
                  name="partly-sunny"
                  size={80}
                  color={theme.colors.systemGray2}
                />
              </LinearGradient>
              <Text style={styles.placeholderText}>
                Enter a city name to see weather information
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

export default App; 