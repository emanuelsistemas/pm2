module.exports = {
  apps : [{
    name   : "pm2-monitor",
    script : "./start.sh",
    cwd    : "/root/PM2",
    watch  : false,
    env: {
      "NODE_ENV": "production",
    },
    max_memory_restart: "200M",
    restart_delay: 3000,
    autorestart: true
  }]
}
