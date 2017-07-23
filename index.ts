import {
  IBridgeOptions,
  TTNMessageBridge,
} from './message-bridge'

// TODO: load these settings from file & validate!
// IDEA: load an array of such configs, and launch one bridge each
const bridgeOptions: IBridgeOptions = {
  ttn: {
    accessToken: process.env.TTN_APP_ACCESS_TOKEN,
    applicationID: process.env.TTN_APP_ID,
    region: process.env.TTN_REGION,
  },
  broker: {
    type: 'SOS:transactional',
    options: {
      host: process.env.SOS_URL,
      token: process.env.SOS_TOKEN,
    },
  },
  sensors: [
    {
      observedProperty: 'Bird Count',
      observedPropertyDefinition: 'BirdCount',
      unitOfMeasurement: 'Count',
      bytes: 1,
    },
    {
      observedProperty: 'Air Temperature',
      observedPropertyDefinition: 'http://sweet.jpl.nasa.gov/2.2/quanTemperature.owl#Temperature',
      unitOfMeasurement: 'Cel',
      bytes: 2,
      transformer: 'bytes[0] + bytes[1] * 256'
    }
  ],
}

const bridge = new TTNMessageBridge(bridgeOptions)
