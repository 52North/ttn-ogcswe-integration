import { IBrokerResponse, ITTNMessageBroker } from '.'

// implements a broker against the SensorThings MQTT backend
// eg. Geodan GOST implementation

interface ISTAMQTTMessage {} // TODO

export class STAMQTTMessageBroker implements ITTNMessageBroker {

  private readonly mqttConnectionString: string

  constructor(mqttConnectionString: string) {
    this.mqttConnectionString = mqttConnectionString
  }

  public connect(): Promise<any> {
    return Promise.resolve('connected :^I')
  }

  public createMessage(message: ITTNMessage): Promise<ISTAMQTTMessage> {
    return Promise.resolve(<ISTAMQTTMessage> message)
  }

  public submitMessage(message: ISTAMQTTMessage): Promise<IBrokerResponse> {
    return Promise.resolve(<IBrokerResponse> { status: 201, message: 'created' })
  }
}
