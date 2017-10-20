import { readFileSync } from 'fs'
import { safeLoad } from 'js-yaml'

import { IBridgeOptions, validate } from './BridgeOptions'
import { TTNMessageBridge } from './TTNMessageBridge'

// load, parse & validate the bridge definitions
let bridgeOptions: IBridgeOptions[]
try {
  const opts = safeLoad(readFileSync('./config.yml', 'utf8'))

  // also allow non array, single bridge configurations
  bridgeOptions = Array.isArray(opts) ? opts : [opts]

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
