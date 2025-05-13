/**
 * Minimal server for Spiritual Condition Tracker
 * Focus only on getting the app to run, ignoring version injector
 */

const express = require('express');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

// Configuration
const PORT = 5000;
const app = express();

// Static files
app.use(express.static(path.join(__dirname)));

// Fix dependencies by generating a temporary script
function fixDependencies() {
  console.log('Fixing dependencies...');
  
  const fixScript = `
    const { execSync } = require('child_process');
    
    // Fix all dependencies in one go
    try {
      console.log('Installing correct versions of dependencies...');
      execSync('npx expo install expo-location@~18.1.5 expo-notifications@~0.31.2 expo-sqlite@~15.2.10 react-native-gesture-handler@~2.24.0 react-native-maps@1.20.1', {
        stdio: 'inherit'
      });
      console.log('Dependencies fixed successfully');
    } catch (err) {
      console.error('Error fixing dependencies:', err);
    }
  `;
  
  fs.writeFileSync('fix-dependencies.js', fixScript);
  
  try {
    console.log('Running dependency fixer...');
    const result = spawn('node', ['fix-dependencies.js'], { stdio: 'inherit' });
    return new Promise((resolve) => {
      result.on('close', (code) => {
        console.log(`Dependency fixer exited with code ${code}`);
        resolve(code === 0);
      });
    });
  } catch (err) {
    console.error('Error running dependency fixer:', err);
    return Promise.resolve(false);
  }
}

// Fix metro config issue by creating a patch
function fixMetroConfig() {
  console.log('Fixing Metro config issue...');
  
  const fixScript = `
    const fs = require('fs');
    const path = require('path');
    
    try {
      // First, check if ExpoMetroConfig exists
      const metroConfigPath = path.join(__dirname, 'node_modules', '@expo', 'metro-config', 'src', 'ExpoMetroConfig.js');
      
      if (fs.existsSync(metroConfigPath)) {
        let content = fs.readFileSync(metroConfigPath, 'utf8');
        
        // Check if loadAsync is missing
        if (!content.includes('loadAsync')) {
          // Add a simple implementation
          content = content.replace('export {', 'export async function loadAsync(projectRoot, options) {\\n  return getDefaultConfig(projectRoot, options);\\n}\\n\\nexport {');
          
          // Write back the modified file
          fs.writeFileSync(metroConfigPath, content);
          console.log('Added loadAsync function to ExpoMetroConfig.js');
        } else {
          console.log('loadAsync function already exists in ExpoMetroConfig.js');
        }
      } else {
        console.error('Cannot find ExpoMetroConfig.js');
      }
    } catch (err) {
      console.error('Error fixing Metro config:', err);
    }
  `;
  
  fs.writeFileSync('fix-metro-config.js', fixScript);
  
  try {
    console.log('Running Metro config fixer...');
    const result = spawn('node', ['fix-metro-config.js'], { stdio: 'inherit' });
    return new Promise((resolve) => {
      result.on('close', (code) => {
        console.log(`Metro config fixer exited with code ${code}`);
        resolve(code === 0);
      });
    });
  } catch (err) {
    console.error('Error running Metro config fixer:', err);
    return Promise.resolve(false);
  }
}

// Create a simple App.js directly in the project root
function createSimpleApp() {
  console.log('Creating a simple test app...');
  
  const appContent = `
import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, SafeAreaView, ScrollView } from 'react-native';

export default function App() {
  const [count, setCount] = useState(0);
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Spiritual Condition Tracker</Text>
        <Text style={styles.subtitle}>Your partner on the journey to spiritual fitness</Text>
        
        <View style={styles.card}>
          <Text style={styles.heading}>Welcome to the App</Text>
          <Text style={styles.text}>
            This application helps individuals in AA recovery track their spiritual condition and growth.
            Track meetings, prayer time, literature reading, and interactions with sponsors.
          </Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.counterText}>Button pressed: {count} times</Text>
          <Button 
            title="Press Me" 
            onPress={() => setCount(count + 1)} 
          />
        </View>
        
        <View style={styles.card}>
          <Text style={styles.heading}>Features:</Text>
          <View style={styles.featureList}>
            <Text style={styles.feature}>• Track meetings attended</Text>
            <Text style={styles.feature}>• Log prayer and meditation time</Text>
            <Text style={styles.feature}>• Record reading of AA literature</Text>
            <Text style={styles.feature}>• Monitor interactions with sponsors and sponsees</Text>
            <Text style={styles.feature}>• Calculate your "Spiritual Fitness" score</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2c3e50',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#7f8c8d',
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#34495e',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2c3e50',
  },
  counterText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  featureList: {
    marginTop: 8,
  },
  feature: {
    fontSize: 16,
    marginBottom: 8,
    color: '#2c3e50',
  },
});
  `;
  
  fs.writeFileSync('SimpleApp.js', appContent);
  console.log('Created SimpleApp.js');
}

// Create a minimal index.js for the web version
function createMinimalIndex() {
  console.log('Creating minimal index.js...');
  
  const indexContent = `
import { AppRegistry } from 'react-native';
import App from './SimpleApp';

AppRegistry.registerComponent('main', () => App);

// Register for web
if (typeof document !== 'undefined') {
  const rootTag = document.getElementById('root') || document.getElementById('main');
  AppRegistry.runApplication('main', { rootTag });
}
  `;
  
  fs.writeFileSync('web-index.js', indexContent);
  console.log('Created web-index.js');
}

// Create a minimal HTML page for the app
function createHtmlPage() {
  console.log('Creating minimal HTML page...');
  
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Spiritual Condition Tracker</title>
  <style>
    html, body, #root {
      height: 100%;
      margin: 0;
      padding: 0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script src="web-bundle.js"></script>
</body>
</html>
  `;
  
  fs.writeFileSync('index.html', htmlContent);
  console.log('Created index.html');
}

// Create a minimal webpack config
function createWebpackConfig() {
  console.log('Creating webpack config...');
  
  const webpackConfig = `
const path = require('path');

module.exports = {
  mode: 'development',
  entry: './web-index.js',
  output: {
    path: path.resolve(__dirname),
    filename: 'web-bundle.js',
  },
  module: {
    rules: [
      {
        test: /\\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      'react-native$': 'react-native-web',
    },
  },
};
  `;
  
  fs.writeFileSync('webpack.config.js', webpackConfig);
  console.log('Created webpack.config.js');
}

// Process to bundle the web app
function bundleWebApp() {
  console.log('Bundling web app...');
  
  const bundleScript = `
const webpack = require('webpack');
const config = require('./webpack.config.js');

webpack(config, (err, stats) => {
  if (err || stats.hasErrors()) {
    console.error('Webpack build failed:');
    if (err) {
      console.error(err);
    }
    if (stats && stats.hasErrors()) {
      console.error(stats.toString({
        colors: true,
        chunks: false,
        modules: false,
      }));
    }
    process.exit(1);
  }
  
  console.log(stats.toString({
    colors: true,
    chunks: false,
    modules: false,
  }));
  
  console.log('Web app built successfully!');
});
  `;
  
  fs.writeFileSync('bundle-web.js', bundleScript);
  
  try {
    console.log('Running web bundler...');
    const result = spawn('node', ['bundle-web.js'], { stdio: 'inherit' });
    return new Promise((resolve) => {
      result.on('close', (code) => {
        console.log(`Web bundler exited with code ${code}`);
        resolve(code === 0);
      });
    });
  } catch (err) {
    console.error('Error running web bundler:', err);
    return Promise.resolve(false);
  }
}

// Start the server
async function startServer() {
  // Try to fix dependencies and metro config
  await fixDependencies();
  await fixMetroConfig();
  
  // Create a simplified app
  createSimpleApp();
  createMinimalIndex();
  createHtmlPage();
  createWebpackConfig();
  await bundleWebApp();
  
  // Serve the web app
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });
  
  // Simple test endpoint
  app.get('/api/status', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  // Start server
  const server = http.createServer(app);
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

// Start everything
startServer().catch(err => {
  console.error('Failed to start server:', err);
});