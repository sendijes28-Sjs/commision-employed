module.exports = {
  apps: [{
    name: 'commision-api',
    script: 'node_modules/.bin/tsx',
    args: 'server/index.ts',
    cwd: '/var/www/commision-employed',
    autorestart: true,
    watch: false,
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    }
  }]
}