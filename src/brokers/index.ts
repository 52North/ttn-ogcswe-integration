import { IBridgeOptions } from '../BridgeOptions'
import { SOSMQTTMessageBroker } from './SOSMQTTMessageBroker'
import { SOSTransactionalMessageBroker } from './SOSTransactionalMessageBroker'
import { STAMQTTMessageBroker } from './STAMQTTMessageBroker'

export { IBridgeOptions } // export for classes implementing ITTNMessageBroker

// interface to be implemented by any backend measurement broker instance
export interface ITTNMessageBroker {
  init(): Promise<any>
  createMessage(ttnMsg: any): Promise<any> // FIXME: message typings
  submitMessage(message: any): Promise<any>
}

// constructor signature definition for classes implementing ITTNMessageBroker
// we need to define the constructor type separately and use a factory function
// to create brokers, because a TypeScript interface defines the structure of
// a class *instance* only!
interface IBridgeOptsConstructable {
  new (bridgeOptions: IBridgeOptions): ITTNMessageBroker
}

type BrokerType =
  'SOS:mqtt' |
  'SOS:transactional' |
  'SensorThings:mqtt'

// just a name mapping for easier access
const brokers: { [k in BrokerType]: IBridgeOptsConstructable } = {
  'SOS:mqtt': SOSMQTTMessageBroker,
  'SOS:transactional': SOSTransactionalMessageBroker,
  'SensorThings:mqtt': STAMQTTMessageBroker,
}

// finally, the factory for new brokers!
export function messageBroker(brokerType: BrokerType, bridgeOptions: IBridgeOptions) {
  return new brokers[brokerType](bridgeOptions)
}
