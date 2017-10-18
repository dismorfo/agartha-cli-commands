'use strict'

const Scaffold = class {
  constructor (options) {
    this.version = '1.0.2'
    this.name = options.name
    this.relic = options.relic || 'generic'
    this.destinationPath = options.destinationPath || '.'
  }
  create () {
    const agartha = process.agartha
    const name = this.name
    const destinationPath = this.destinationPath
    const appPath = agartha.path.join(destinationPath, name)
    const cli = agartha.cli()
    const relicPath = agartha.path.join(agartha.cwd(), 'app/relics', this.relic)
    const structureFilePath = agartha.path.join(relicPath, 'relic.json')
    const structure = agartha.read.json(structureFilePath)
    const env = agartha.read.json(agartha.path.join(agartha.cwd(), 'app/defaults/configs/default.env.json'))
    // wait counts calls to complete() callback.
    // once we reach 0 we can show the message with instruction as to how-to forge
    // we have 11 known tasks to-do before complete
    let wait = 11
    agartha.emptyDirectory(appPath, (empty) => {
      function complete () {
        if (--wait) return
        console.log()
        console.log('   to generate your site:')
        console.log('     %s cd %s && %s forge', '$', appPath, cli)
        console.log()
      }
      let pkg = {
        appName: this.name,
        collectionCode: this.collectionCode || '*',
        appUrl: '/' + this.name,
        appRoot: '/' + this.name,
        relic: this.relic,
        version: '0.0.0',
        agartha: this.version
      }
      if (empty || this.force) {
        console.log()
        agartha.mkdir(appPath, () => {
          agartha.mkdir(agartha.path.join(appPath, 'app'), () => {
            agartha.copy(agartha.path.join(relicPath, 'images'), agartha.path.join(appPath, 'app/images'), (err) => {
              if (err) {
                agartha.exit(new Error('Unable to copy over relic componets. Fail to create images'))
              }
              agartha.log(agartha.path.join(appPath, 'app/images'), 'copy')
              complete()
            })
            agartha.copy(agartha.path.join(relicPath, 'sass'), agartha.path.join(appPath, 'app/sass'), (err) => {
              if (err) {
                agartha.exit(new Error('Unable to copy over relic componets. Fail to create sass'))
              }
              agartha.log(agartha.path.join(appPath, 'app/sass'), 'copy')
              complete()
            })
            agartha.mkdir(agartha.path.join(appPath, 'app/pages'), () => {
              agartha._.each(structure.include.pages, (file, page) => {
                // plus 1 wait so that we can call an extra complete() callback
                wait++
                agartha.mkdir(agartha.path.join(appPath, 'app/pages', page), () => {
                  complete()
                })
                agartha._.filter(file, (property, context) => {
                  if (property.require && property.overwrite) {
                    // plus 1 wait so that we can call an extra complete() callback
                    wait++
                    agartha.copy(agartha.path.join(relicPath, 'pages', page, context), agartha.path.join(appPath, 'app/pages', page, context), (err) => {
                      if (err) {
                        agartha.exit(new Error('Unable to copy over relic componets. Fail to copy ' + agartha.path.join(appPath, 'app/pages', page, context)))
                      }
                      agartha.log(agartha.path.join(appPath, 'app/pages', page, context), 'copy')
                      complete()
                    })
                  }
                })
              })
              complete()
            })
            complete()
          })
          agartha.mkdir(agartha.path.join(appPath, 'app/javascript'), complete)
          agartha.mkdir(agartha.path.join(appPath, 'app/partials'), complete)
          agartha.mkdir(agartha.path.join(appPath, 'app/commands'), complete)
          agartha.write(agartha.path.join(appPath, 'project.json'), JSON.stringify(pkg, null, 2), 'utf8', complete)
          agartha.write(agartha.path.join(appPath, 'env.json'), JSON.stringify(env, null, 2), 'utf8', complete)
          agartha.write(agartha.path.join(appPath, 'content.json'), JSON.stringify({}, null, 2), 'utf8', complete)
          complete()
        })
      }
    })
  }
  confirm (msg, callback) {
    // https://nodejs.org/api/readline.html
    const createInterface = require('readline').createInterface
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    })
    rl.question(msg, function (input) {
      rl.close()
      callback(/^y|yes|ok|true$/i.test(input))
    })
  }
  interactive () {
    console.log('Interactive mode')
    const agartha = process.agartha
    this.confirm('Filter by collection code? [y/N] ', (answer) => {
      agartha.log(answer, 'ok')
    })
  }
}

const Create = class {
  get command () {
    return 'create [appName]'
  }
  get alias () {
    return 'ct'
  }
  get description () {
    return 'Craft a site scaffold'
  }
  get options () {
    return [
      {
        'flag': '-r, --relic [relic]',
        'description': 'Which relic to use'
      },
      {
        'flag': '-f, --force',
        'description': 'force on non-empty directory'
      },
      {
        'flag': '-i, --interactive',
        'description': 'Run interactive mode'
      }      
    ]
  }
  get onInit () {
    return false
  }
  action () {
    const agartha = process.agartha
    try {      
      const configuration = {
        relic: this.parent.relic || 'generic', // what type of relic will be forge
        destinationPath: this.parent.destination || process.cwd(), // path to generate the app scaffold
        interactive: this.parent.interactive || false, // true if user request interactive mode to generate scaffold
        force: this.force || false, // force creation of app even if destination is not empty
        name: this.parent.args[0] // name off the app/project
      }      
      if (agartha._.contains(agartha.relics(), configuration.relic)) {
        if (!agartha._.isString(configuration.name)) {
          agartha.exit(new Error('No app name'))
        }
        // ini Scaffold
        let scaffold = new Scaffold(configuration)
        // generate the app scaffold
        scaffold.create()
      } else {
        agartha.exit(new Error('Relic not found'))
      }
    } catch (e) {
      agartha.exit(e)
    }
  }
}

module.exports = exports = Create
