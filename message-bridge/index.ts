import { readFileSync } from 'fs'
import { join } from 'path'
import * as ttn from 'ttn'

import { IBridgeOptions } from './BridgeOptions'
import { ITTNMessageBroker, messageBroker } from './brokers'
import { generateDecoderFunc } from './TTNDecoding'

export class TTNMessageBridge {

  private ttnClient: ttn.data.MQTT
  private broker: ITTNMessageBroker
  private readonly logger: Console
  private readonly bridgeOptions: IBridgeOptions

  constructor(bridgeOptions: IBridgeOptions) {
    this.bridgeOptions = bridgeOptions
    this.logger = bridgeOptions.logger || console
  }

  public async init() {
    const { region, applicationID, accessToken } = this.bridgeOptions.ttn

    try {
      await this.setupTTNApp()
    } catch (err) {
      throw new Error(`unable to set the decoder for the TTN application: ${err}`)
    }

    // init ttn mqtt connection
    this.ttnClient = new ttn.data.MQTT(region, applicationID, accessToken, {
      ca: readFileSync(join(__dirname, '../../mqtt-ca.pem')),
    })

    // setup mqtt event handlers
    this.ttnClient.on('connect', () => this.logger.log(`connected to TTN app '${applicationID}'`))
    this.ttnClient.on('error', this.logger.error)

    // init backend broker
    this.broker = messageBroker(this.bridgeOptions.broker.type, this.bridgeOptions)

    return this.broker.init()
      .then(() => {
        this.logger.log('backend broker initialized')
        this.ttnClient.on('message', this.handleTTNMessage.bind(this))
      })
      .catch((err: Error) => {
        this.logger.error(`unable to initialize backend broker: ${err}`)
        process.exit(1)
      })
  }

  private async setupTTNApp(): Promise<any> {
    const { applicationID, accessToken, region } = this.bridgeOptions.ttn

    // init ttn application manager
    const manager = new ttn.manager.HTTP({
      key: this.bridgeOptions.ttn.accessToken,
      region: this.bridgeOptions.ttn.region,
    })

    // set the payload function for decoding
    const app = await manager.getApplication(applicationID)
    app.decoder = generateDecoderFunc(this.bridgeOptions.sensors)

    return manager.setApplication(applicationID, app)
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
