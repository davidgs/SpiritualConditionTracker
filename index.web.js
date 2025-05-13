/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App.web';
import {name as appName} from './app.json';

// Register the app for web
AppRegistry.registerComponent(appName, () => App);

// Set up the web entrypoint
if (window.document) {
  const rootTag = document.getElementById('root') || document.getElementById('main');
  const app = document.createElement('div');
  app.id = 'app';
  
  if (rootTag) rootTag.appendChild(app);
  
  AppRegistry.runApplication(appName, {
    rootTag: app,
  });
}