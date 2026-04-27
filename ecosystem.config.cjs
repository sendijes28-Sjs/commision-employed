module.exports = {
  apps: [{
    name: 'commision-api',
    script: 'server/index.ts',
    interpreter: 'node',
    interpreterArgs: '--import tsx/esm',
    cwd: '/var/www/commision-employed',
    autorestart: true,
    watch: false,
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    }
  }]
}