module.exports = {
  apps: [
    {
      name: 'spiritual-condition-tracker',
      script: 'deployment-server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        EXPO_PORT: 5001,
        CI: '1'
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000,
        EXPO_PORT: 5001,
        CI: '1'
      }
    }
  ]
};