import { readFileSync } from 'fs'
import { join } from 'path'
import * as ttn from 'ttn'

import { IBridgeOptions } from './BridgeOptions'
import { ITTNMessageBroker, messageBroker } from './brokers'
import { generateDecoderFunc } from './TTNDecoding'

export class TTNMessageBridge {

  private readonly ttnClient: ttn.data.MQTT
  private readonly broker: ITTNMessageBroker
  private readonly logger: Console
  private readonly bridgeOptions: IBridgeOptions

  constructor(bridgeOptions: IBridgeOptions) {
    const { region, applicationID, accessToken } = bridgeOptions.ttn

    this.bridgeOptions = bridgeOptions
    this.logger = bridgeOptions.logger || console

    // FIXME: only proceed once this has succeeded
    this.setupTTNApp()
      .catch(err => this.logger.error(`WARNING: unable to set the decoder for the TTN application: ${err}`))

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

  private async setupTTNApp(): Promise<any> {
    const { applicationID, accessToken, region } = this.bridgeOptions.ttn

    // init ttn application manager
    const manager = new ttn.manager.HTTP({
      key: this.bridgeOptions.ttn.accessToken,
      region: this.bridgeOptions.ttn.region,
    })

    // set the payload function for decoding
    // TODO: create an application, if it wasnt found
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
