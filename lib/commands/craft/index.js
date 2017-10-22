'use strict'

const Craft = class {
  get command () {
    return 'craft [type] [name]'
  }
  get alias () {
    return 'cr'
  }
  get description () {
    return 'Craft a component'
  }
  get options () {
    return [
    ]
  }
  get onInit () {
    return false
  }
  get enabled () {
    return false
  }
  action () {
    
    const agartha = process.agartha

    function craftCommand (commandName) {
      function capitalizeFirstLetter (string) {
        return string.charAt(0).toUpperCase() + string.slice(1)
      }
      const templatePath = agartha.path.join(__dirname, 'templates', 'index.js.template')
      const template = agartha.read.text(templatePath)
      const compiled = agartha._.template(template)
      const commandPath = agartha.path.join(agartha.appDir(), 'app/commands', commandName)
      const source = compiled({ 
        command: commandName, 
        classname: capitalizeFirstLetter(commandName) 
      })
      agartha.mkdir(commandPath, () => {
        agartha.write(agartha.path.join(commandPath, 'index.js'), source, 'utf8', () => {})
      })
    }

    try {
      const type = this.parent.args[0]
      switch (type) {
        case 'command':
          const commandName = this.parent.args[1]
          craftCommand(commandName)
          break
      }
    } catch (e) {
      agartha.exit(e)
    }
  }
}

module.exports = exports = Craft
