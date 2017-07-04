import { readFileSync } from 'fs'
import { join } from 'path'
import * as ttn from 'ttn'

import {
  IBrokerResponse,
  ITTNMessageBroker,
  SOSTransactionalMessageBroker,
  STAMQTTMessageBroker,
} from './brokers'

export const backends = {
  SOSTransactionalMessageBroker,
  STAMQTTMessageBroker,
}

export interface ITTNOptions {
  accessToken: string
  applicationID: string
  options?: {
    ca: string,
    protocol: 'mqtts'
  }
  region: string
}

export class TTNMessageBridge {

  private readonly ttnClient: ttn.data.MQTT
  private readonly broker: ITTNMessageBroker
  private readonly logger: Console

  constructor(ttnOptions: ITTNOptions, broker: ITTNMessageBroker, logger?: Console) {
    const { region, applicationID, accessToken } = ttnOptions

    this.logger = logger || console

    // init ttn mqtt connection
    this.ttnClient = new ttn.data.MQTT(region, applicationID, accessToken, {
      ca: readFileSync(join(__dirname, '../../mqtt-ca.pem')),
      protocol: 'mqtts',
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
      .catch((err) => {
        this.logger.error(`unable to connect to backend broker: ${err}`)
      })
  }

  private handleMessage(deviceID: string, message: ttn.data.IUplinkMessage) {
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
