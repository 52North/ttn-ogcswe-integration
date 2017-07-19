import {
  backends,
  ITTNOptions,
  TTNMessageBridge,
} from './message-bridge'

// TTN related settings
const ttnOpts = <ITTNOptions> {
  accessToken: process.env.TTN_APP_ACCESS_TOKEN,
  applicationID: process.env.TTN_APP_ID,
  region: process.env.TTN_REGION,
}

// get backend related settings & initialize instance
let backend
switch (process.env.TTN_BACKEND) {
  case 'SOS:transactional':
    const sosUrl = process.env.SOS_URL
    backend = new backends.SOSTransactionalMessageBroker(sosUrl)
    break

  case 'SensorThings:mqtt':
    const mqttUrl = process.env.STA_MQTT_URL
    backend = new backends.STAMQTTMessageBroker(mqttUrl)
    break

  default:
    console.error(`unknown backend ${process.env.TTN_BACKEND}`)
    process.exit(1)
}

const bridge = new TTNMessageBridge(ttnOpts, backend)
