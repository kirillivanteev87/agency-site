/** PM2: pm2 start deploy/ecosystem.config.cjs */
module.exports = {
  apps: [
    {
      name: "agency-site",
      cwd: "/var/www/agency-site",
      script: "node_modules/next/dist/bin/next",
      args: "start -H 127.0.0.1 -p 3000",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
      },
      error_file: "/var/log/agency-site/error.log",
      out_file: "/var/log/agency-site/out.log",
      merge_logs: true,
      time: true,
    },
  ],
};
