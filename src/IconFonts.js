// Import icon fonts for web
import '@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome.ttf';
import '@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf';
import '@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf';
import '@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.ttf';
import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  const iconFontStyles = `@font-face {
    src: url(${require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf')}) format('truetype');
    font-family: 'Ionicons';
  }`;

  // Create stylesheet
  const style = document.createElement('style');
  style.type = 'text/css';
  if (style.styleSheet) {
    style.styleSheet.cssText = iconFontStyles;
  } else {
    style.appendChild(document.createTextNode(iconFontStyles));
  }

  // Inject stylesheet
  document.head.appendChild(style);
}
