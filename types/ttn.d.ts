declare interface TTNMessage {
  readonly app_id: string
  readonly dev_id: string
  readonly payload_raw: string
  readonly payload_fields?: object
  readonly metadata: object
}

declare interface TTNAuthOptions {
  readonly region: string
  readonly applicationID: string
  readonly accessToken: string
}

declare interface TTN {
  data: {
    MQTT: object
  }

  manager: {
    HTTP: object
  }
}
