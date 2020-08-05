module.exports = {
  apps: [{
    script: 'app.js',
    name: 'deneme',
    instances: 3,
    exec_mode: "cluster"
  }],
  deploy: {
    production: {
      user: "ahmet",
      host: ["10.1.10.25"],
      ref: "origin/master",
      repo: "https://github.com/AhmetRota/auto_deploy.git",
      path: "/home/ahmet/auto_deploy",
      "post-deploy": "npm install",
      "ssh_options": "StrictHostKeyChecking=no"
    }
  }
};
