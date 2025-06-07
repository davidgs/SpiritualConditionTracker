module.exports = {
  presets: [
    ['@babel/preset-env', {
      modules: false,
      useBuiltIns: 'entry',
      corejs: 3,
      targets: {
        browsers: ['> 1%', 'last 2 versions', 'not dead']
      }
    }],
    '@babel/preset-react',
    '@babel/preset-typescript'
  ],
  plugins: [
    // MUI tree-shaking optimization
    [
      'babel-plugin-import',
      {
        libraryName: '@mui/material',
        libraryDirectory: '',
        camel2DashComponentName: false
      },
      'core'
    ],
    [
      'babel-plugin-import',
      {
        libraryName: '@mui/icons-material',
        libraryDirectory: '',
        camel2DashComponentName: false
      },
      'icons'
    ],
    '@babel/plugin-transform-runtime'
  ]
};