'use strict'

const Scaffold = class {
  constructor (options) {
    this.version = '1.0.0'
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
    const structureFilePath = agartha.path.join(agartha.cwd(), 'app/relics', this.relic, 'relic.json')
    const structure = agartha.read.json(structureFilePath)
    // wait counts calls to complete() callback.
    // once we reach 0 we can show the message with instruction as to how-to forge
    // we have 10 known tasks to-do before complete
    let wait = 10
    agartha.emptyDirectory(appPath, (empty) => {
      function complete () {
        if (--wait) return
        let prompt = '$'
        console.log()
        console.log('   to generate your site:')
        console.log('     %s cd %s && %s forge', prompt, appPath, cli)
        console.log()
      }
      let pkg = {
        appName: this.name,
        collectionCode: this.collectionCode || '*',
        // for now
        appUrl: '/' + this.name,
        // for now
        appRoot: '/' + this.name,
        relic: this.relic,
        version: '0.0.0'
      }
      // here for now
      const env = {
        production: {
          discovery: {
            url: 'http://discovery.dlib.nyu.edu:8080/solr3_discovery/viewer/select'
          },
          viewer: {
            url: 'http://sites.dlib.nyu.edu/viewer'
          }
        },
        default: {
          discovery: {
            url: 'http://dev-discovery.dlib.nyu.edu:8080/solr3_discovery/stage/select'
          },
          viewer: {
            url: 'http://alpha-user:dlts2010@stage-dl-pa.home.nyu.edu/viewer'
          }
        }
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
                    agartha.copy(agartha.path.join(agartha.cwd(), 'app/modules/pages', page, context), agartha.path.join(appPath, 'app/pages/', page, context), (err) => {
                      if (err) {
                        agartha.exit(new Error('Unable to copy over relic componets. Fail to copy ' + agartha.path.join(appPath, 'app/pages/', page, context)))
                      }
                      agartha.log(agartha.path.join(appPath, 'app/pages/', page, context), 'copy')
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
          agartha.write(agartha.path.join(appPath, 'project.json'), JSON.stringify(pkg, null, 2), 'utf8', complete)
          agartha.write(agartha.path.join(appPath, 'env.json'), JSON.stringify(env, null, 2), 'utf8', complete)
          agartha.write(agartha.path.join(appPath, 'content.json'), JSON.stringify({}, null, 2), 'utf8', complete)
          complete()
        })
      }
      // not now; we will get to this later on
      // else {
      //  confirm('Destination is not empty, continue? [y/N] ', (ok) => {
      //    if (ok) {
      //      process.stdin.destroy()
      //      agartha.application(appName, destinationPath, relic)
      //    }
      //    else {
      //      agartha.exit(new Error('Aborting'))
      //    }
      //  })
      // }
    })
  }
  /**
   * Prompt for confirmation on STDOUT/STDIN
   */
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

const Commands = class {
  constructor () {
    this.version = '1.0.0'
    this.name = 'agartha-cli-commands'
  }
  upgrade () {
    const AutoUpdate = require('./lib/autoupdater/index')
    const update = new AutoUpdate()
    update.on('finish', () => console.log('Finished updating'))
  }
  create () {
    const agartha = process.agartha
    // what type of relic will be forge
    const relic = this.parent.relic || 'generic' // later on we will use http://bulma.io/
    // path to generate the app scaffold
    const destinationPath = this.parent.destination || process.cwd()
    // true if user request interactive mode to generate scaffold
    const interactive = this.parent.interactive || false
    // name off the app/project
    const name = this.parent.args[0]
    // force creation of app even if destination is not empty
    const force = this.force || false
    // check if we have a name; if no name, we will have a instance of Command instead of a string
    // @TODO: aof1 find another solution? Maybe I'm doing something wrong?
    if (!agartha._.isString(name)) {
      agartha.exit(new Error('No app name'))
    }
    // ini Scaffold
    let scaffold = new Scaffold({
      relic: relic,
      destinationPath: destinationPath,
      interactive: interactive,
      name: name,
      force: force
    })
    // generate the app scaffold
    scaffold.create()
  }
  /**
   * Forge program.
   */
  forge () {
    const agartha = process.agartha
    const project = agartha.exists(agartha.path.join(agartha.appDir(), 'project.json'))
    if (project) {
      agartha.forge()
    }
    else {
      agartha.exit(new Error('Can not forge, make sure you have project.json in your project.'))
    }
  }
  listOptions () {
    return [
      {
        'flag': '-r, --relic [relic]',
        'description': 'Which relic to use'
      },
      {
        'flag': '-i, --interactive',
        'description': 'Run interactive mode'
      },

      {
        'flag': '-a, --artifact [relic]',
        'description': 'Which artifact to use as based'
      },
      {
        'flag': '-f, --force',
        'description': 'force on non-empty directory'
      }
    ]
  }
  listCommands () {
    return [
      {
        'command': 'upgrade',
        'description': 'Upgrade application',
        'action': this.upgrade
      },
      {
        'command': 'create',
        'description': 'Craft a site scaffold',
        'action': this.create
      },
      {
        'command': 'forge',
        'description': 'Forge a project',
        'action': this.forge
      }
    ]
  }
}

exports = module.exports = Commands
