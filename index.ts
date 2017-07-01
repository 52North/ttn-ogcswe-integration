import { TTNMessageBridge, backends } from './message-bridge'

// TTN related settings
const ttnOpts = <TTNAuthOptions>{
  applicationID: process.env.TTN_APP_ID,
  accessToken: process.env.TTN_APP_ACCESS_TOKEN,
  region: process.env.TTN_REGION
}

// get backend related settings & initialize instance
let backend;
switch(process.env.TTN_BACKEND) {
  case 'SensorThings-MQTT':
    const mqttUrl = process.env.STA_MQTT_URL
    backend = new backends.STAMQTTMessageBroker(mqttUrl)
    break;

  default:
    console.error(`unkown backend ${process.env.TTN_BACKEND}`)
    process.exit(1)
}

const bridge = new TTNMessageBridge(ttnOpts, backend)
