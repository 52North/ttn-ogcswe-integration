import { readFileSync } from 'fs'
import * as TTN from 'ttn'

import { TTNMessageBroker, STAMQTTMessageBroker, BrokerResponse } from './brokers'

export const backends = {
  STAMQTTMessageBroker
}

export class TTNMessageBridge {

  private readonly ttnClient: TTN
  private readonly broker: TTNMessageBroker
  private readonly logger: Console

  constructor(ttnOptions: TTNAuthOptions, broker: TTNMessageBroker, logger?: Console) {
    const { region, applicationID, accessToken } = ttnOptions

    this.logger = logger || console

    // init ttn mqtt connection
    this.ttnClient = new TTN.data.MQTT(region, applicationID, accessToken, {
      protocol: 'mqtts',
      ca: readFileSync('./mqtt-ca.pem')
    })

    // init backend broker
    this.broker = broker
    this.broker.connect()
      .then(() => {
        // setup mqtt event handlers
        this.ttnClient.on('connect', () => this.logger.log(`connected to TTN app ${applicationID}`))
        this.ttnClient.on('error', this.logger.error)
        this.ttnClient.on('message', this.handleMessage)
      })
      .catch(err => {
        this.logger.error(`unable to connect to backend broker: ${err}`)
      })
  }

  private handleMessage(deviceID: string, message: TTNMessage) {
    this.logger.log(`handling message for ${deviceID}`)

    return this.broker.createMessage(message)
      .then(this.broker.submitMessage)
      .then((res) => {
        this.logger.log('message submitted')
      })
      .catch((err) => {
        this.logger.error(`error submitting message to backend: ${err}`)
      })
  }
}
