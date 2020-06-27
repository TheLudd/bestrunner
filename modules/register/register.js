const babelRegister = require('@babel/register')
const presetEnv = require('@babel/preset-env').default
const sourceMapSupport = require('source-map-support')

const opts = {
  babelrc: false,
  presets: [ presetEnv ],
  sourceMaps: true,
}

sourceMapSupport.install()
babelRegister(opts)
