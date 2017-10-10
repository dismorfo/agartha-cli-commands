function forge () {

  'use strict'

  function App () {}

  App.prototype.description = 'Forge a project'

  App.prototype.action = () => {
    const agartha = process.agartha
    const project = agartha.exists(agartha.path.join(agartha.appDir(), 'project.json'))
    if (project) {
      agartha.forge()
    }
    else {
      agartha.exit(new Error('Can not forge, make sure you have project.json in your project.'))
    }
  }

  return new App()

}

exports.forge = forge()

