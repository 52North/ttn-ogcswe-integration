import { readFileSync } from 'fs'
import { join } from 'path'
import * as ttn from 'ttn'

import {
  ITTNMessageBroker,
  messageBroker,
} from './brokers'

export interface IBridgeOptions {
  ttn: {
    accessToken: string
    applicationID: string
    options?: { ca: string }
    region: string
  }

  broker: {
    type: 'SOS:transactional'
    options: {
      host: string
      token: string
    }
  } | {
    type: 'SensorThings:mqtt'
    options: { mqttConnectionString: string }
  }

  sensors: {
    observedProperty: string
    observedPropertyDefinition: string
    unitOfMeasurement: string
    bytes: number
    transformer?: string
  }[]

  logger?: Console
}

export class TTNMessageBridge {

  private readonly ttnClient: ttn.data.MQTT
  private readonly broker: ITTNMessageBroker
  private readonly logger: Console
  private readonly bridgeOptions: IBridgeOptions

  constructor(bridgeOptions: IBridgeOptions) {
    const { region, applicationID, accessToken } = bridgeOptions.ttn

    this.bridgeOptions = bridgeOptions
    this.logger = bridgeOptions.logger || console

    // init ttn mqtt connection
    this.ttnClient = new ttn.data.MQTT(region, applicationID, accessToken, {
      ca: readFileSync(join(__dirname, '../../mqtt-ca.pem')),
    })

    // setup mqtt event handlers
    this.ttnClient.on('connect', () => this.logger.log(`connected to TTN app '${applicationID}'`))
    this.ttnClient.on('error', this.logger.error)

    // init backend broker
    this.broker = messageBroker(bridgeOptions.broker.type, bridgeOptions)

    this.broker.init()
      .then(() => {
        this.logger.log('backend broker initialized')
        this.ttnClient.on('message', this.handleTTNMessage.bind(this))
      })
      .catch((err: Error) => {
        this.logger.error(`unable to initialize backend broker: ${err}`)
        process.exit(1)
      })
  }

  private async handleTTNMessage(deviceID: string, message: ttn.data.IUplinkMessage) {
    try {
      this.logger.log(`parsing message from device '${deviceID}'`)
      const brokerMsg = await this.broker.createMessage(message)

      this.logger.log(`submitting message to backend`)
      await this.broker.submitMessage(brokerMsg)

      this.logger.log('message submitted')
    } catch (err) {
      this.logger.error(`could not handle message: ${JSON.stringify(err, null, 2)}`)
    }
  }
}
