import { readFileSync } from 'fs'
import { safeLoad } from 'js-yaml'

import { TTNMessageBridge } from './message-bridge'
import { IBridgeOptions, validate } from './message-bridge/BridgeOptions'


// load, parse & validate the bridge defintions
let bridgeOptions: IBridgeOptions[]
try {
  // load yaml from file & parse it
  const opts = safeLoad(readFileSync('./config.yml', 'utf8'))

  // also allow non array, single bridge configurations
  bridgeOptions = Array.isArray(opts) ? opts : [opts]

  // validate each contained bridge definition
  for (const options of bridgeOptions) {
    validate(options)
  }
} catch (err) {
  console.error(`bridge configuration is invalid or missing: ${err}`)
  process.exit(1)
}

// launch a bridge for each configuration element
for (const opts of bridgeOptions) {
  new TTNMessageBridge(opts)
}
