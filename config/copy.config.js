const config = require('@ionic/app-scripts/config/copy.config');

module.exports = Object.assign(config, {
    copyContentPlayer: {
      src: ['{{ROOT}}/content-player/**/*'],
      dest: '{{BUILD}}//content-player/'
    }
  });
