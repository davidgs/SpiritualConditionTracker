import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from '../app.json';

// Register the app for both React Native and web
AppRegistry.registerComponent(appName, () => App);

// For web, we need to register with the rootTag selector
if (typeof document !== 'undefined') {
  const rootTag = document.getElementById('root') || document.getElementById('app');
  if (rootTag) {
    AppRegistry.runApplication(appName, {
      rootTag,
    });
  }
}