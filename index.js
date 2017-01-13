'use strict';

const Commands = class {

  constructor () {
    this.version = '1.0.0';
    this.name = 'agartha-cli-commands';
  }

  /**
   * Prompt for confirmation on STDOUT/STDIN
   */
  confirm (msg, callback) {
    // https://nodejs.org/api/readline.html
    const createInterface = require('readline').createInterface;
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question(msg, function (input) {
      rl.close();
      callback(/^y|yes|ok|true$/i.test(input));
    });
  }

  upgrade () {
    const AutoUpdate = require('./lib/autoupdater/index');
    const update = new AutoUpdate();
    update.on('finish', () => console.log('finished updating'));
   }

  /**
   * Main program.
   */
  create () {
  
    console.log('Create app')
    
    console.log(this.relic)
    
    console.log(this.force)
    
    return;

    // what type of relic will be forge
    var relic = this.relic || 'generic';

    // app destination
    var destinationPath = dir || '.';

    // app name
    var appName = agartha.path.basename(agartha.path.resolve(destinationPath));

    // force creation of app even if destination is not empty
    var force = this.force || false;

    // Generate site
    agartha.emptyDirectory(destinationPath, (empty) => {
      if (empty || force) {
        agartha.create(appName, destinationPath, relic);
      }
      else {
        confirm('Destination is not empty, continue? [y/N] ', (ok) => {
          if (ok) {
            process.stdin.destroy();
            agartha.application(appName, destinationPath, relic);
          }
          else {
            console.error('aborting');
            exit(1);
          }
        });
      }
    });
  }

  /**
   * Forge program.
   */
  forge () {
    if (exit.exited) return;
    var project = agartha.exists(agartha.path.join(agartha.appDir(), 'project.json'));
    if (project) agartha.forge();
    else {
      agartha.log('Can not forge, make sure you have project.json in your project.', 'error');
      exit(1);
    }
  }
  
/**
program
    .command('forge')
    .description('Forge a project')
    .action(forge);
*/

/**    
program
    .command('upgrade')
    .description('Upgrade application')
    .action(upgrade);
*/  
  
  listCommands () {
   return [
     {
       'command' : 'upgrade',
       'description' : 'Upgrade application',
       'action' : this.upgrade,
       'options' : []
     },
     {
       'command' : 'create',
       'description' : 'Craft a site scaffold',
       'action' : this.create,
       'options' : [
         { 
           'flag' : '-r, --relic [relic]', 
           'description' : 'Which relic to use'
         },
         { 
           'flag' : '-a, --artifact [relic]', 
           'description' : 'Which artifact to use as based'
         },
         { 
           'flag' : '-f, --force',
           'description' : 'force on non-empty directory'
         }
       ]
     }
   ];
  }  

}

exports = module.exports = Commands;
