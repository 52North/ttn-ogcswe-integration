import * as r from 'request-promise-native'

import {
  ISensor,
  RequestMethod,
  ServiceType,
  ServiceVersion,
} from './datatypes'

export interface IResponse {
  request: RequestMethod
  service: ServiceType
  version: ServiceVersion
}

export interface IGetCapabilitiesResponse extends IResponse {
  contents?: ISensor[]
  filterCapabilities?: object
  operationMetadata?: object
  serviceIdentification?: object
  serviceProvider?: object
}

export interface IInsertSensorResponse extends IResponse { }
export interface IInsertObservationResponse extends IResponse { }