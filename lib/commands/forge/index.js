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
  get onInit () {
    return false
  }
  action () {
    const agartha = process.agartha
    try {
      const project = agartha.exists(agartha.path.join(agartha.appDir(), 'project.json'))
      if (project) {
        if (agartha.exists(agartha.appBuildDir())) {
           agartha.canWrite(agartha.appBuildDir()).then((writable) => {
             if (writable) {
               agartha.rimraf(agartha.appBuildDir(), () => {
                 agartha.forge()
               })
             }
           }).catch((e) => {
             agartha.exit(e)
           })
         }
         else {
           agartha.forge()
         }
      } else {
        agartha.exit(new Error('Can not forge, make sure you have project.json in your project.'))
      }
    } catch (e) {
      agartha.exit(e)
    }
  }
}

module.exports = exports = Forge
