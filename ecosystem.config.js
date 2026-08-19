module.exports = {
  apps: [
    {
      name: 'puntonorte',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/puntonorte',
      instances: 1,
      autorestart: true,
      watch: false,
      max_restarts: 10,
      restart_delay: 5000,
      min_uptime: '10s',
      max_memory_restart: '600M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        DATABASE_URL: process.env.DATABASE_URL,
      },
      // Logs
      out_file: '/root/.pm2/logs/puntonorte-out.log',
      error_file: '/root/.pm2/logs/puntonorte-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
}
