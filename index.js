'use strict'

const Commands = class {

  constructor (program) {
    this.version = '1.0.1'
    this.name = 'agartha-cli-commands'
    this.commands = []
    this.options = []
    const agartha = process.agartha
    const defaultCommands = agartha.path.join(__dirname, 'lib/commands')
    const localCommands = agartha.path.join(agartha.appDir(), 'app', 'commands')
    // need a better solution for options
    this.listOptions().forEach((option) => {
      program.option(option.flag, option.description)
    })
    agartha._.each([defaultCommands, localCommands], (path) => {
      if (agartha.exists(path)) {
        agartha._.each(agartha.readdirSync(path), (directory) => {
          const exists = agartha.path.join(path, directory, 'index.js')
          if (agartha.exists(exists)) {
            const SubCommand = require(exists)
            const subcommand = new SubCommand()
            program.command(subcommand.command)
                   .description(subcommand.description)
                   .alias(subcommand.alias)
                   .action(subcommand.action)
            
          }
        })
      }
    })
    program.parse(process.argv)
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

}

exports = module.exports = Commands
