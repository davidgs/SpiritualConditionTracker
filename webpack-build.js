/**
 * Simple script to build a web bundle using webpack directly
 */
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// Configuration
const OUTPUT_DIR = path.join(__dirname, 'static-bundle');

// Ensure output directory exists
function ensureDirExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

// Clean up output directory
function cleanOutputDir() {
  if (fs.existsSync(OUTPUT_DIR)) {
    console.log(`Cleaning output directory: ${OUTPUT_DIR}`);
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  }
  
  ensureDirExists(OUTPUT_DIR);
}

// Create webpack config file
function createWebpackConfig() {
  const webpackConfigPath = path.join(__dirname, 'webpack.config.js');
  const webpackConfigContent = `
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'static-bundle'),
    filename: 'bundle.[contenthash].js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: ['@babel/plugin-proposal-class-properties']
          }
        }
      },
      {
        test: /\\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'assets/[name].[hash].[ext]'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './app.html',
      filename: 'index.html',
      title: 'Spiritual Condition Tracker'
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      'react-native$': 'react-native-web'
    }
  }
};
  `;
  
  fs.writeFileSync(webpackConfigPath, webpackConfigContent);
  console.log(`Created webpack config at ${webpackConfigPath}`);
}

// Create a simplified entry point for webpack
function createEntryPoint() {
  const entryDir = path.join(__dirname, 'src');
  ensureDirExists(entryDir);
  
  const entryPath = path.join(entryDir, 'index.js');
  const entryContent = `
import React from 'react';
import { AppRegistry } from 'react-native';
import App from '../App';

// Register the app
AppRegistry.registerComponent('App', () => App);

// Web-specific setup code
const rootTag = document.getElementById('root');
AppRegistry.runApplication('App', { rootTag });
  `;
  
  fs.writeFileSync(entryPath, entryContent);
  console.log(`Created entry point at ${entryPath}`);
}

// Create a simplified app component for testing
function createSimpleAppComponent() {
  const appPath = path.join(__dirname, 'src', 'SimpleApp.js');
  const appContent = `
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SimpleApp() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Spiritual Condition Tracker</Text>
        <Text style={styles.subtitle}>Your AA Recovery Dashboard</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome to Your Recovery Journey</Text>
          <Text style={styles.cardText}>
            This app helps you track your spiritual condition and recovery progress.
            Log your daily activities, track meetings, and monitor your spiritual fitness.
          </Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Recovery Stats</Text>
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>2.45</Text>
              <Text style={styles.statLabel}>Sobriety (years)</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>128</Text>
              <Text style={styles.statLabel}>Meetings</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>85%</Text>
              <Text style={styles.statLabel}>Spiritual Fitness</Text>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Spiritual Condition Tracker - AA Recovery App
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#3498db',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  content: {
    padding: 20,
    flex: 1,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5,
  },
  footer: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
});
  `;
  
  fs.writeFileSync(appPath, appContent);
  console.log(`Created simple app component at ${appPath}`);
}

// Create a simple HTML template
function createHtmlTemplate() {
  const htmlPath = path.join(__dirname, 'app.html');
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1" />
  <meta name="theme-color" content="#000000" />
  <title>Spiritual Condition Tracker</title>
  <style>
    html, body, #root {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    #root {
      display: flex;
      flex-direction: column;
    }
    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      width: 100%;
    }
    .loading-spinner {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .loading-text {
      margin-top: 20px;
      font-size: 16px;
      color: #333;
    }
  </style>
</head>
<body>
  <div id="root">
    <div class="loading">
      <div class="loading-spinner"></div>
      <div class="loading-text">Loading Spiritual Condition Tracker...</div>
    </div>
  </div>
</body>
</html>`;
  
  fs.writeFileSync(htmlPath, htmlContent);
  console.log(`Created HTML template at ${htmlPath}`);
}

// Install webpack dependencies if needed
function installWebpackDependencies() {
  console.log('Installing webpack dependencies...');
  try {
    const dependencies = [
      'webpack',
      'webpack-cli',
      'html-webpack-plugin',
      'clean-webpack-plugin',
      'babel-loader',
      '@babel/core',
      '@babel/preset-env',
      '@babel/preset-react',
      '@babel/plugin-proposal-class-properties',
      'css-loader',
      'style-loader',
      'file-loader',
      'webpack-dev-server'
    ];
    
    const command = `npm install --save-dev ${dependencies.join(' ')}`;
    execSync(command, { stdio: 'inherit' });
    
    console.log('Webpack dependencies installed successfully!');
    return true;
  } catch (error) {
    console.error('Failed to install webpack dependencies:');
    console.error(error.message);
    return false;
  }
}

// Run webpack to build the bundle
function runWebpackBuild() {
  console.log('Building with webpack...');
  try {
    execSync('npx webpack --config webpack.config.js', { stdio: 'inherit' });
    console.log('Webpack build completed successfully!');
    return true;
  } catch (error) {
    console.error('Webpack build failed:');
    console.error(error.message);
    return false;
  }
}

// Copy static assets to the output directory
function copyStaticAssets() {
  console.log('Copying static assets...');
  
  try {
    // Create assets directory
    const assetsDir = path.join(OUTPUT_DIR, 'assets');
    ensureDirExists(assetsDir);
    
    // Copy logo
    if (fs.existsSync(path.join(__dirname, 'logo.jpg'))) {
      fs.copyFileSync(
        path.join(__dirname, 'logo.jpg'),
        path.join(assetsDir, 'logo.jpg')
      );
      console.log('Copied logo.jpg');
    }
    
    console.log('Static assets copied successfully!');
    return true;
  } catch (error) {
    console.error('Error copying static assets:');
    console.error(error.message);
    return false;
  }
}

// Main build function
async function buildWithWebpack() {
  console.log('=== Building with Webpack ===');
  
  // Step 1: Prepare the output directory
  cleanOutputDir();
  
  // Step 2: Install webpack dependencies
  if (!installWebpackDependencies()) {
    console.error('❌ Failed to install webpack dependencies');
    return;
  }
  
  // Step 3: Create necessary files
  createHtmlTemplate();
  createEntryPoint();
  createSimpleAppComponent();
  createWebpackConfig();
  
  // Step 4: Run webpack build
  if (!runWebpackBuild()) {
    console.error('❌ Webpack build failed');
    return;
  }
  
  // Step 5: Copy static assets
  copyStaticAssets();
  
  console.log('✅ Webpack build completed!');
  console.log(`Output directory: ${OUTPUT_DIR}`);
}

// Run the build process
buildWithWebpack().catch(error => {
  console.error('Build process error:', error);
  process.exit(1);
});