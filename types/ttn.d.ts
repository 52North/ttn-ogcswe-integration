/* tslint:disable interface-name max-classes-per-file */

declare module 'ttn' {

  import { EventEmitter } from 'events'

  export function application(appId: string, accessKey: string): Promise<types.ApplicationClient>
  export function data(appId: string, accessKey: string): Promise<types.DataClient>

  export namespace types {
    export interface ApplicationClient {
      get(): Promise<types.IApplication>
      setPayloadFormat(format: types.IPayloadFormat): Promise<void>
      setCustomPayloadFunctions(fns: types.IPayloadFunctions): Promise<void>
      setRegisterOnJoinAccessKey(to: string): Promise<void>
      unregister(): Promise<void>
      devices(): Promise<types.IDevice[]>
      registerDevice(devID: string, device: types.IDevice): Promise<types.IDevice[]>
      updateDevice(devID: string, device: types.IDevice): Promise<void>
      deleteDevice(devID: string): Promise<void>
    }

    export type IPayloadFormat = 'custom' | 'cayenne'

    export type IPayloadFunctions = {
      converter?: string
      decoder?: string
      encoder?: string
      validator?: string
      [k: string]: string
    }

    export type IApplication = {
      appId: string
      payloadFormat: IPayloadFormat
      registerOnJoinAccessKey?: string
    } & IPayloadFunctions

    export interface IDevice {
      altitude: number
      app_id: string
      description: string
      dev_id: string
      latitude: number
      longitude: number
      lorawan_device: {
        activation_constraints: string;
        app_eui: string;
        app_id: string;
        app_key: string;
        app_s_key: string;
        dev_addr: string;
        dev_eui: string;
        dev_id: string;
        disable_f_cnt_check: boolean;
        f_cnt_down: number;
        f_cnt_up: number;
        last_seen: number;
        nwk_s_key: string;
        uses32_bit_f_cnt: boolean;
      }
    }

    //////////////////////////////////////////////////////////////

    export interface DataClient extends EventEmitter {
      on(message: 'error', handler: (err: Error) => void): this
      on(message: 'connect', handler: (connack: object) => void): this

      on(message: DataEvent,
                handler: (devID: string, data: types.IActivationMessage | types.IDownlinkMessage) => void): void
      on(message: DataEvent, devID: string,
                handler: (devID: string, data: types.IActivationMessage | types.IDownlinkMessage) => void): void
      on(message: DataEvent, devID: string, event: DeviceEvent,
                handler: (devID: string, data: types.IActivationMessage | types.IDownlinkMessage) => void): void

      off(message: DataEvent,
                handler: (devID: string, data: types.IActivationMessage | types.IDownlinkMessage) => void): void
      off(message: DataEvent, devID: string,
                handler: (devID: string, data: types.IActivationMessage | types.IDownlinkMessage) => void): void
      off(message: DataEvent, devID: string, event: DeviceEvent,
                handler: (devID: string, data: types.IActivationMessage | types.IDownlinkMessage) => void): void

      send(devID: string, payload: Buffer | any[] | object, port?: number, confirmed?: boolean): void
    }

    type DataEvent =
      'uplink' | 'message' |
      'activation' |
      'event' | 'device'

    type DeviceEvent =
      'downlink/scheduled' | 'downlink/sent' |
      'activations' |
      'create' | 'update' | 'delete' |
      'down/acks' |
      'up/errors' | 'down/errors' | 'activations/errors' |
      string // devID

    // reference: https://www.thethingsnetwork.org/docs/applications/mqtt/api.html
    export interface IUplinkMessage {
      app_id: string
      dev_id: string
      hardware_serial: string
      port: number
      counter: number
      is_retry: boolean
      confirmed: boolean
      payload_raw: string
      payload_fields?: object
      metadata: Metadata
    }

    export interface IActivationMessage {
      app_eui: string
      dev_eui: string
      dev_addr: string
      metadata: Metadata
    }

    export interface IDownlinkMessage {
      port: number
      payload_raw: {
        type: 'Buffer'
        data: number[],
      }
    }

    interface Metadata {
      time: ISODate
      frequency: number
      modulation: 'LORA' | 'FSK'
      data_rate?: string
      bit_rate?: number
      coding_rate: string
      gateways: Gateway[]
      latitude?: number
      longitude?: number
      altitude?: number
    }

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
  }
}
