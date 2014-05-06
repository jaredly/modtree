
var fs = require('fs')
  , path = require('path')
  , through = require('through')
  , mdeps = require('module-deps')
  , chokidar = require('chokidar')
  , readline = require('readline')

module.exports = Watcher

function Watcher(basefile, options) {
  this.basefile = path.resolve(basefile)
  this.options = options

  if (options.watch) {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.rl.on('line', this.handleInput.bind(this))
  }
}

Watcher.prototype = {
  run: function () {
    this.time = Date.now()
    process.stdout.write('Compiling...')
    getFileTree(this.basefile, this.options.transform, this.regenerate.bind(this))
  },
  // you can trigger manually
  handleInput: function (line) {
    if (['run', 'r', 'build', 'b'].indexOf(line.toLowerCase()) === -1) return
    this.run()
  },
  regenerate: function (err, nodes, links) {
    if (err) return console.warn('Error!' + err)
    var filenames = Object.keys(nodes)

    if (this.options.watch) {
      if (!this.watcher) {
        this.watcher = chokidar.watch(filenames, {persistent: true})
        this.watcher.on('change', this.run.bind(this))
      }
      this.watcher.add(filenames)
    }

    var raw = JSON.stringify({nodes: nodes, links: links}, null, 2)
    if (this.options.jsonp) {
      raw = ';' + this.options.jsonp + '(' + raw + ');'
    }

    if (this.options.filename) {
      this.options.stream = fs.createWriteStream(this.options.filename);
    }
    this.options.stream.end(raw);
    this.options.stream.on('finish', function () {
      var delta = parseInt((Date.now() - this.time)/10)/100
        , kb = parseInt(raw.length / 10.24)/100
      console.log('done. Took ' + delta + 's, wrote ' + kb + 'kb. Watching ' + filenames.length + ' files')
    }.bind(this))
  }
}

function getFileTree(basefile, transform, done) {
  var nodes = {}
    , links = []
    , d = mdeps(basefile, {
        transform: transform
      })
    d.on('error', function (err) {
      done(err || true)
    })
    d.pipe(through(function (data) {
    var file = data.id
      , deps = data.deps
      , ext = path.extname(file)
    if (['.js', '.jsx'].indexOf(ext) === -1) return
    if (undefined === nodes[file]) {
      nodes[file] = 0
    }
    for (var name in deps) {
      if (!nodes[deps[name]]) {
        nodes[deps[name]] = 1
      } else {
        nodes[deps[name]]++
      }
      links.push([file, deps[name]])
    }
  }, function end() {
    done(null, nodes, links)
  }))
}

