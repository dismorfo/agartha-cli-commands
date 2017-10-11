'use strict'

const Commands = class {

  constructor (program) {
    this.version = '1.0.1'
    this.name = 'agartha-cli-commands'
    const agartha = process.agartha
    const defaultCommands = agartha.path.join(__dirname, 'lib/commands')
    const localCommands = agartha.path.join(agartha.appDir(), 'app', 'commands')
    this.defaultOptions.forEach((option) => {
      program.option(option.flag, option.description)
    })
    agartha._.each([defaultCommands, localCommands], (path) => {
      if (agartha.exists(path)) {
        agartha._.each(agartha.readdirSync(path), (directory) => {
          const exists = agartha.path.join(path, directory, 'index.js')
          if (agartha.exists(exists)) {
            const SubCommand = require(exists)
            const subcommand = new SubCommand()
            subcommand.options.forEach((option) => {
              program.option(option.flag, option.description)
            })
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

  get defaultOptions () {
    return [
      {
        'flag': '-i, --interactive',
        'description': 'Run interactive mode'
      }
    ]
  }

}

exports = module.exports = Commands
