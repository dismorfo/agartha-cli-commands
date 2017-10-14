'use strict'

const Forge = class {
  get command () {
    return 'forge'
  }
  get alias () {
    return 'fg'
  }
  get description () {
    return 'Forge a project'
  }
  get options () {
    return []
  }
  action () {
    const agartha = process.agartha
    try {
      const project = agartha.exists(agartha.path.join(agartha.appDir(), 'project.json'))
      if (project) {
        agartha.forge()
      } else {
        agartha.exit(new Error('Can not forge, make sure you have project.json in your project.'))
      }
    } catch (e) {
      agartha.exit(e)
    }
  }
}

module.exports = exports = Forge
