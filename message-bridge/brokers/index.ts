// response format for any broker
export interface BrokerResponse {
  status: number
  message: string
}

// interface to be implemented by any backend measurement broker
export interface TTNMessageBroker {
  connect(): Promise<any>
  createMessage(message: TTNMessage): Promise<any>
  submitMessage(message: any): Promise<BrokerResponse>
}

export * from './STAMQTTMessageBroker'
