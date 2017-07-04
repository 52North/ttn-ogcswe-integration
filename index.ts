import { backends, TTNMessageBridge } from './message-bridge'

// TTN related settings
const ttnOpts = <ITTNAuthOptions> {
  accessToken: process.env.TTN_APP_ACCESS_TOKEN,
  applicationID: process.env.TTN_APP_ID,
  region: process.env.TTN_REGION,
}

// get backend related settings & initialize instance
let backend
switch (process.env.TTN_BACKEND) {
  case 'SOS-Transactional':
    const sosUrl = process.env.SOS_URL
    backend = new backends.SOSTransactionalMessageBroker(sosUrl)
    break

  case 'SensorThings-MQTT':
    const mqttUrl = process.env.STA_MQTT_URL
    backend = new backends.STAMQTTMessageBroker(mqttUrl)
    break

  default:
    console.error(`unkown backend ${process.env.TTN_BACKEND}`)
    process.exit(1)
}

const bridge = new TTNMessageBridge(ttnOpts, backend)
