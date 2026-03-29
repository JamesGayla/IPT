// mobile/main.jsx
import { AppRegistry, Platform } from 'react-native';
import MobileApp from './MobileApp';

// Register the app
AppRegistry.registerComponent('ParkFlow', () => MobileApp);

// For web
if (Platform.OS === 'web') {
  const rootTag = document.getElementById('root') || document.getElementById('root');
  AppRegistry.runApplication('ParkFlow', { rootTag });
}

export default MobileApp;
