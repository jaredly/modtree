#!/usr/bin/env node

var subarg = require('subarg')
  , path = require('path')
  , fs = require('fs')
  , raw = process.argv

if (raw[0] === 'node') raw.shift()
raw.shift()

var argv = subarg(raw)

if (argv._.length !== 2 || argv.h || argv.help) {
  console.log('   Module Trees! ')
  console.log('')
  console.log('Usage: modtree input.js output.js [options]')
  console.log('')
  console.log('Options:')
  console.log('')
  console.log("      --once, -n   : don't watch. Just run once.")
  console.log('      -t transform : Add a transformer. Can be used multiple times')
  console.log('      -p function  : JSONp function to call with the json')
  console.log('')
  process.exit(1)
}

var input = argv._[0]
  , output = argv._[1]
  , Watcher = require('./')

  , basefile = path.resolve(input)
  , basedir = path.dirname(basefile)

  , once = argv.once || argv.n

new Watcher(basefile, {
  watch: !once,
  filename: output,
  transform: argv.t || null,
  jsonp: argv.p
}).run()

/*
new Watcher(basefile, {
  filename: output,
  transform: argv.t || null,
  watch: !once,
  less: {
    path: lpath,
  },
  toCSS: {
    sourceMap: true,
    outputSourceFiles: true,
    sourceMapFilename: path.basename(mapfile),
    sourceMapOutputFilename: path.basename(mapfile),
    writeSourceMap: function (output) {
      fs.writeFileSync(mapfile, output, 'utf8')
    },
    // sourceMapRootpath: path.basename(basedir),
    sourceMapBasepath: basedir
  }
}).run()
*/


