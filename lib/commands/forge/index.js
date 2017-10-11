'use strict'

const Forge = class {
  
  constructor () {
  }
  
  get command () {
    return 'forge'
  }
  
  get alias () {
    return 'fg'
  }
  
  get description () {
    return 'Forge a project'
  }
  
  action () {

    const agartha = process.agartha

    const project = agartha.exists(agartha.path.join(agartha.appDir(), 'project.json'))

    if (project) {
      agartha.forge()
    }
    else {
      agartha.exit(new Error('Can not forge, make sure you have project.json in your project.'))
    }

  }
  
}

module.exports = exports = Forge
