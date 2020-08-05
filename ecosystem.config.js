module.exports = {
  apps: [{
    script: '/home/ahmet/auto_deploy/current/app.js',
    name: 'deneme',
    cwd: '/home/ahmet/auto_deploy/current/',
    watch: true,
    merge_logs: true
  }],
  deploy: {
    production: {
      user: "ahmet",
      host: ["10.1.10.25"],
      ref: "origin/master",
      repo: "https://github.com/AhmetRota/auto_deploy.git",
      path: "/home/ahmet/auto_deploy",
      "post-deploy": "npm install && pm2 startOrRestart  /home/ahmet/ecosystem.config.js",
      "post-setup": "npm install && pm2 start /home/ahmet/ecosystem.config.js",
      "ssh_options": "StrictHostKeyChecking=no"
    }
  }
};
