import { BrokerResponse, TTNMessageBroker } from '.'

// implements a broker against the SensorThings MQTT backend
// eg. Geodan GOST implementation

interface STAMQTTMessage {} // TODO

export class STAMQTTMessageBroker implements TTNMessageBroker {

  private readonly mqttConnectionString: string

  constructor(mqttConnectionString: string) {
    this.mqttConnectionString = mqttConnectionString
  }

  connect(): Promise<any> {
    return Promise.resolve('connected :^I')
  }

  createMessage(message: TTNMessage): Promise<STAMQTTMessage> {
    return Promise.resolve(<STAMQTTMessage>message)
  }

  submitMessage(message: STAMQTTMessage): Promise<BrokerResponse> {
    return Promise.resolve(<BrokerResponse>{ status: 201, message: 'created' })
  }
}
