'use strict';

const EventEmitter = require('events');

class AutoUpdate extends EventEmitter {

  constructor () {
    super();
    this.exec = require('child_process').exec;
    this.agartha = require('agartha').agartha;
    this.updating = false;
    this.notifier = this.release({
      callback: (error, response, body) => this.onCheck(error, response, body)
    });
  }

  pkg () {
    return require(this.agartha.path.join(this.agartha.cwd(), 'package.json'));
  }

  app () {
    const path = this.agartha.path.dirname(process.argv[1]);
    const pkg = require(this.agartha.path.join(path, 'package.json'));
    return {
      pkg : pkg,
      path : path 
    };
  }

  current () {
    return require(this.agartha.path.join(this.agartha.cwd(), 'package.json'));
  }

  release (options) {
    const fs = require('fs');
    const app = this.app();
    const that = this;
    const conf = {
      url: 'https://api.github.com/repos/nyulibraries/agartha/releases/latest',
      headers: { 
        'User-Agent': 'agartha' 
      }
    };
    const filepath = this.agartha.path.join(app.path, 'releases.json');
    if (that.agartha.exists(filepath)) {
      fs.stat(this.agartha.path.join(app.path, 'releases.json'), function(err, stat) {
        if (err) {
          return console.error(err);
        }
        const now = new Date().getTime();
        const endTime = new Date(stat.ctime).getTime() + 3600000;
        if (now > endTime) {
          that.agartha.request(conf, (error, response, body) => {
            if (error) {
              return this.emit('error', error);
            }
            const data = JSON.parse(body);
            that.agartha.write(that.agartha.path.join(app.path, 'releases.json'), JSON.stringify(data, null, 2));
            options.callback(false, data);
          });
        }
        else {
          options.callback(false, that.agartha.read.json(that.agartha.path.join(app.path, 'releases.json')));
        }
      });
    }
    else {
      that.agartha.request(conf, (error, response, body) => {
        if (error) {
          return this.emit('error', error);
        }
        const data = JSON.parse(body);
        that.agartha.write(that.agartha.path.join(app.path, 'releases.json'), JSON.stringify(data, null, 2));        
        options.callback(false, data);
      });
    }
  }

  onCheck (error, response) {
    if (error) return this.emit('error', error);
    const app = this.app();
    const release = parseInt(response.name.replace(/[\D]/g, ''), 10);
    const current = parseInt(this.current().version.replace(/[\D]/g, ''), 10);
    if (release > current) {
      this.update(response.tarball_url);
    }
    else {
      this.emit('finish');
    }
  }

  update (release) {
    let app = this.app();
    const options = { env: process.env, cwd : app.path };
    this.updating = true;
    this.emit('update');
    app.pkg.dependencies.agartha = release;
    this.agartha.write(this.agartha.path.join(app.path, 'package.json'), JSON.stringify(app.pkg, null, 2));
    this.exec(`npm install`, options, this.onUpdate.bind(this));
  }

  onUpdate (error, stdout, stderr) {
    this.updating = false;
    this.emit('finish');
  }

}

exports = module.exports = AutoUpdate;
