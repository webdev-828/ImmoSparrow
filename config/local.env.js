'use strict'

const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"local"',
  apiURL: '"http://localhost:5001"',
  bugsnagKey: '"fbc19b85874a15642f83c0f5484086a2"'
})
