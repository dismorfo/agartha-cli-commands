function upgrade () {

  'use strict'

  function App () {}

  App.prototype.description = 'Upgrade application'

  App.prototype.action = () => {
    const AutoUpdate = require('./autoupdater')
    const update = new AutoUpdate()
    update.on('finish', () => console.log('Finished updating'))
  }

  return new App()

}

exports.upgrade = upgrade()

