# Weather App

A beautiful and responsive weather application built with React Native and Expo, featuring dynamic weather backgrounds and animations. The app works on both mobile devices and web browsers.



## Features

- 🌡️ Real-time weather information
- 🎨 Dynamic backgrounds based on weather conditions
- 🌧️ Beautiful weather animations (rain, snow)
- 🌓 Dark/Light mode support
- 📱 Responsive design (mobile & web)
- 🔍 City search with suggestions
- 📍 Current location detection
- 📅 5-day weather forecast
- 🕒 Search history

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 14 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

## Installation

1. Clone the repository:
```bash
git clone [your-repository-url]
cd weatherapp
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm start
# or
yarn start
```

4. Run on your preferred platform:
- For web: Press `w` in the terminal or click "Run in web browser"
- For iOS: Press `i` (requires macOS and Xcode)
- For Android: Press `a` (requires Android Studio)
- Or scan the QR code with the Expo Go app on your mobile device

## Environment Variables

Create a `.env` file in the root directory with the following variables:
```env
WEATHER_API_KEY=your_api_key_here
```

## Project Structure

```
weatherapp/
├── src/
│   ├── components/
│   │   ├── WeatherBackground.js
│   │   └── WeatherEffects.js
│   ├── styles/
│   │   └── theme.js
│   └── utils/
│       └── weather.js
├── App.js
├── package.json
└── README.md
```

## Technologies Used

- React Native
- Expo
- React Native Web
- React Native Linear Gradient
- Expo Location
- Axios
- AsyncStorage

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Troubleshooting

### Common Issues

1. **Port 3000 already in use**
```bash
npx kill-port 3000
```

2. **Expo CLI not found**
```bash
npm install -g expo-cli
```

3. **Metro bundler issues**
```bash
expo start --clear
```

### Platform-Specific Notes

#### Web
- Ensure you have a modern browser
- Enable location services for current location feature

#### Mobile
- Install Expo Go app
- Allow location permissions when prompted

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Weather data provided by [Open-Meteo API](https://open-meteo.com/)
- Icons from [Ionicons](https://ionicons.com/)
- Inspired by Apple Weather App

## Contact

Your Name - [your-email@example.com]
Project Link: [https://github.com/yourusername/weatherapp]
