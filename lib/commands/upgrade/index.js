'use strict'

const Upgrade = class {

  constructor () {
  }

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

  action () {
    const AutoUpdate = require('./autoupdater')
    new AutoUpdate().on('finish', () => console.log('Finished updating'))
  }

}

module.exports = exports = Upgrade
