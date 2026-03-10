// PM2 生态系统配置文件
// 用法: pm2 start ecosystem.config.cjs

module.exports = {
  apps: [
    {
      name: 'alog',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      cwd: '/home/alog/alog/website',
      env: {
        NODE_ENV: 'production',
        ADMIN_TOKEN: 'change-this-in-production',
      },
      max_memory_restart: '300M',
      restart_delay: 3000,
      watch: false,
      error_file: '/home/alog/alog/logs/error.log',
      out_file: '/home/alog/alog/logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
}
