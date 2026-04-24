module.exports = {
  apps: [
    {
      name: 'composer-ai-api',
      script: 'dist/main.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
