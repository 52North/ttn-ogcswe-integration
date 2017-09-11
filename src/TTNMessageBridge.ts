import { types as ttn } from 'ttn'
import { join } from 'path'
import { data as ttnClient } from 'ttn'

import { IBridgeOptions } from './BridgeOptions'
import { ITTNMessageBroker, messageBroker } from './brokers'

export class TTNMessageBridge {

  private ttnClient: ttn.DataClient
  private readonly broker: ITTNMessageBroker
  private readonly logger: Console
  private readonly bridgeOptions: IBridgeOptions

  constructor(bridgeOptions: IBridgeOptions) {
    const { applicationID, accessToken } = bridgeOptions.ttn

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
        ttnClient(applicationID, accessToken).then((client: ttn.DataClient) => {
          this.ttnClient = client
          this.ttnClient.on('connect', () => this.logger.log(`connected to TTN app '${applicationID}'`))
          this.ttnClient.on('error', this.logger.error)
          this.ttnClient.on('uplink', this.handleTTNMessage.bind(this))
        })
      })
  }

  private async handleTTNMessage(deviceID: string, message: any) {
    try {
      this.logger.log(`parsing message from device '${deviceID}'`)
      const brokerMsg = await this.broker.createMessage(message)

      this.logger.log(`submitting message to backend`)
      await this.broker.submitMessage(brokerMsg)

      this.logger.log('message submitted')
    } catch (err) {
      this.logger.error(`could not handle message: ${err.message}`)
    }
  }
}
