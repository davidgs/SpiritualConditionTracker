const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: './',
    assetModuleFilename: 'assets/[hash][ext][query]'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript']
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: {
      '@shared': path.resolve(__dirname, 'shared/'),
      components: path.resolve(__dirname, 'src/components/'),
      screens: path.resolve(__dirname, 'src/screens/'),
      utils: path.resolve(__dirname, 'src/utils/'),
      contexts: path.resolve(__dirname, 'src/contexts/'),
      styles: path.resolve(__dirname, 'styles/'),
      assets: path.resolve(__dirname, 'assets/'),
    }
  },
  devServer: {
    static: {
      directory: path.join(__dirname, '.'),
    },
    compress: true,
    port: 5000,
    host: '0.0.0.0',
    allowedHosts: 'all',
    historyApiFallback: true,
    hot: true,
    watchFiles: {
      paths: ['src/**/*'],
      options: {
        usePolling: false,
        aggregateTimeout: 300,
        ignored: ['**/node_modules/**', '**/dist/**']
      }
    }
  },
  mode: 'development',
  devtool: 'source-map'
};