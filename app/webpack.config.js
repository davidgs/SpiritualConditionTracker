const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/app/dist/',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      components: path.resolve(__dirname, 'src/components/'),
      screens: path.resolve(__dirname, 'src/screens/'),
      utils: path.resolve(__dirname, 'src/utils/'),
      contexts: path.resolve(__dirname, 'contexts/'),
      styles: path.resolve(__dirname, 'styles/'),
      assets: path.resolve(__dirname, 'assets/'),
    }
  },
  mode: 'development',
  devtool: 'source-map'
};