import * as ttn from 'ttn'

import { IBridgeOptions, ITTNMessageBroker } from '.'
import { TTNPayloadFunctionManager } from './TTNPayloadFunctionManager'

export class SOSMQTTMessageBroker implements ITTNMessageBroker {

  private readonly bridgeOpts: IBridgeOptions
  private readonly logger: Console
  private readonly payloadFuncManager: TTNPayloadFunctionManager

  constructor(bridgeOpts: IBridgeOptions) {
    this.bridgeOpts = bridgeOpts
    this.logger = bridgeOpts.logger || console

    // the decode function must generate an OM Measurement a la
    // https://github.com/52North/sos/blob/master/coding/json/src/main/resources/examples/measurement-geometry-ref.json
    this.payloadFuncManager = new TTNPayloadFunctionManager(bridgeOpts, {
      decoder: './templates/sosmqtt_decoder.js',
    })
  }

  public async init(): Promise<any> {
    // initialize the TTN app.
    await this.payloadFuncManager.setPayloadFunctions()
    this.logger.log('TTN payload function set up')

    // TODO: subscribe the SOS MQTT client to the TTN MQTT broker
  }

  public async createMessage(ttnMsg: ttn.data.IUplinkMessage): Promise<any> {
    // nothing todo here, the SOS should be subscribed to the messages itself
    this.logger.log(ttnMsg)
    return
  }

  public async submitMessage(message: any): Promise<any> {
    // nothing todo here, the SOS should be subscribed to the messages itself
    return
  }
}
