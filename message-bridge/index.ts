import { join } from 'path'
import * as ttn from 'ttn'

import { IBridgeOptions } from './BridgeOptions'
import { ITTNMessageBroker, messageBroker } from './brokers'

export class TTNMessageBridge {

  private ttnClient: ttn.data.MQTT
  private readonly broker: ITTNMessageBroker
  private readonly logger: Console
  private readonly bridgeOptions: IBridgeOptions

  constructor(bridgeOptions: IBridgeOptions) {
    const { region, applicationID, accessToken } = bridgeOptions.ttn

    this.bridgeOptions = bridgeOptions
    this.logger = bridgeOptions.logger || console

    // init backend broker
    this.broker = messageBroker(bridgeOptions.broker.type, bridgeOptions)

    this.broker.init()
      .catch((err: Error) => {
        this.logger.error(`unable to initialize backend broker: ${err}`)
        process.exit(1)
      })
      .then(() => {
        this.logger.log('backend broker initialized')

        // init ttn mqtt connection
        this.ttnClient = new ttn.data.MQTT(region, applicationID, accessToken)

        // setup mqtt event handlers
        this.ttnClient.on('connect', () => this.logger.log(`connected to TTN app '${applicationID}'`))
        this.ttnClient.on('error', this.logger.error)
        this.ttnClient.on('message', this.handleTTNMessage.bind(this))
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
