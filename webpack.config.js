const path = require('path');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: './src/index.tsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? '[name].[contenthash].js' : 'bundle.js',
      chunkFilename: isProduction ? '[name].[contenthash].chunk.js' : '[name].chunk.js',
      publicPath: './',
      assetModuleFilename: 'assets/[hash][ext][query]',
      clean: true
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
  optimization: {
      minimize: isProduction,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            chunks: 'all',
          },
          mui: {
            test: /[\\/]node_modules[\\/]@mui[\\/]/,
            name: 'mui',
            priority: 20,
            chunks: 'all',
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            priority: 20,
            chunks: 'all',
          },
        },
      },
      runtimeChunk: 'single',
    },
    performance: {
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
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
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? 'source-map' : 'eval-source-map'
  };
};