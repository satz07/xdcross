/**
 * PM2 Ecosystem Configuration
 *
 * Usage:
 *   pm2 start ecosystem.config.js          # start API + docs
 *   pm2 start ecosystem.config.js --only offramp-api
 *   pm2 start ecosystem.config.js --only offramp-docs
 *   pm2 stop offramp-api | offramp-docs
 *   pm2 restart offramp-api | offramp-docs
 *   pm2 logs offramp-api | offramp-docs
 *   pm2 status
 *
 * Docs: run `npm run docs:build` before starting so _book/ exists.
 */

module.exports = {
  apps: [
    {
      name: 'offramp-api',
      script: './server.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3002
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000
    },
    {
      name: 'offramp-docs',
      script: './serve-docs.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      env: {
        DOCS_PORT: 3003
      },
      error_file: './logs/pm2-docs-error.log',
      out_file: './logs/pm2-docs-out.log',
      time: true,
      autorestart: true,
      max_restarts: 10
    }
  ]
};

