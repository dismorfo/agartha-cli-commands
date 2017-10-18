'use strict'
const Upgrade = class {
  get command () {
    return 'upgrade'
  }
  get alias () {
    return 'up'
  }
  get description () {
    return 'Upgrade application'
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
      const AutoUpdate = require('./autoupdater')
      new AutoUpdate().on('finish', () => console.log('Finished updating'))
    } catch (e) {
      agartha.exit(e)
    }
  }
}

module.exports = exports = Upgrade
