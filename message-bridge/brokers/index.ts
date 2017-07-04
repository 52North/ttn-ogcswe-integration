// response format for any broker
export interface IBrokerResponse {
  status: number
  message: string
}

// interface to be implemented by any backend measurement broker
export interface ITTNMessageBroker {
  connect(): Promise<any>
  createMessage(message: ITTNMessage): Promise<any>
  submitMessage(message: any): Promise<IBrokerResponse>
}

export * from './STAMQTTMessageBroker'
export * from './SOSTransactionalMessageBroker'
