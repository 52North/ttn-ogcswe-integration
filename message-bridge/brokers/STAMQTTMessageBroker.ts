import * as ttn from 'ttn'

import { IBridgeOptions, ITTNMessageBroker } from '.'

// implements a broker against the SensorThings MQTT backend
// eg. Geodan GOST implementation

interface ISTAMQTTMessage {} // TODO

export class STAMQTTMessageBroker implements ITTNMessageBroker {

  private readonly mqttConnectionString: string

  constructor(bridgeOpts: IBridgeOptions) {
    this.mqttConnectionString = bridgeOpts.broker.options.mqttConnectionString
  }

  public init(): Promise<any> {
    return Promise.resolve('connected :^I')
  }

  public createMessage(message: ttn.data.IUplinkMessage): Promise<ISTAMQTTMessage> {
    return Promise.resolve(<ISTAMQTTMessage> message)
  }

  public submitMessage(message: ISTAMQTTMessage): Promise<any> {
    return Promise.resolve('yeah!')
  }
}
