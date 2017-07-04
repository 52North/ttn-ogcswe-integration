/* tslint:disable interface-name */

type ISODate = string

interface Gateway {
  gtw_id: string
  timestamp: number
  time?: ISODate
  channel: number
  rssi: number
  snr: number
  rf_chain: number
  latitude: number
  longitude: number
  altitude: number
}

// reference: https://www.thethingsnetwork.org/docs/applications/mqtt/api.html
declare interface ITTNMessage {
  app_id: string
  dev_id: string
  hardware_serial: string
  port: number
  counter: number
  is_retry: boolean
  confirmed: boolean
  payload_raw: string
  payload_fields?: any
  metadata: {
    time: ISODate
    frequency: number
    modulation: string
    data_rate?: string
    bit_rate?: number
    coding_rate: string
    gateways: Gateway[]
    latitude: number
    longitude: number
    altitude: number,
  }
}

declare interface ITTNAuthOptions {
  readonly region: string
  readonly applicationID: string
  readonly accessToken: string
  readonly options?: {
    protocol: string
    ca: string,
  }
}

declare interface TTN {
  data: {
    MQTT: object,
  }

  manager: {
    HTTP: object,
  }
}
