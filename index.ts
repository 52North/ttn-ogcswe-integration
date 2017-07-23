import { readFileSync } from 'fs'

import { TTNMessageBridge } from './message-bridge'
import { IBridgeOptions, validate } from './message-bridge/BridgeOptions'


// load settings from file
let cfgString: string
try {
  cfgString = readFileSync('./config.json', 'utf8')
} catch(err) {
  console.error(`could not read bridge configuration: ${err}`)
  process.exit(1)
}

// parse the json & validate its structure
let bridgeOptions: IBridgeOptions[]
try {
  const opts = JSON.parse(cfgString)

  // also allow non array, single bridge configurations
  bridgeOptions = Array.isArray(opts) ? opts : [opts]

  for (const opts of bridgeOptions) validate(opts)
} catch(err) {
  console.error(`bridge configuration is invalid: ${err}`)
  process.exit(1)
}

// launch a bridge for each configuration element
for (const opts of bridgeOptions) {
  new TTNMessageBridge(opts)
}
