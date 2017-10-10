'use strict'

const Commands = class {
  
  constructor () {
    this.version = '1.0.1'
    this.name = 'agartha-cli-commands'
  }

  listOptions () {
    return [
      {
        'flag': '-r, --relic [relic]',
        'description': 'Which relic to use'
      },
      {
        'flag': '-i, --interactive',
        'description': 'Run interactive mode'
      },

      {
        'flag': '-a, --artifact [relic]',
        'description': 'Which artifact to use as based'
      },
      {
        'flag': '-f, --force',
        'description': 'force on non-empty directory'
      }
    ]
  }

  listCommands () {
    let commands = []
    const agartha = process.agartha
    const defaultCommands = agartha.path.join(__dirname, 'lib/commands')
    const localCommands = agartha.path.join(agartha.appDir(), 'app', 'commands')
    agartha._.each([defaultCommands, localCommands], (path) => {
      if (agartha.exists(path)) {
        agartha._.each(agartha.readdirSync(path), (directory) => {
          const exists = agartha.path.join(path, directory, 'index.js')
          if (agartha.exists(exists)) {
            const command = require(exists)
            agartha._.each(agartha._.keys(command), (key) => {
              commands.push({
                'command': key,
                'description': command[key].description,
                'action':  command[key].action
              })
            })
          }
        })
      }
    })
    return commands
  }
}

exports = module.exports = Commands
