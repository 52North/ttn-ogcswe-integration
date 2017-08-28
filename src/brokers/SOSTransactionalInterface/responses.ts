import {
  ISensor,
  RequestMethod,
  ServiceType,
  ServiceVersion,
  URI,
} from './datatypes'

// reference: https://github.com/52North/sos/tree/master/coding/json-common/src/main/resources/schema/sos/response

export interface IResponse {
  request: RequestMethod
  service: ServiceType
  version: ServiceVersion
  exceptions?: [{
    code: string
    text: any,
  }]
}

export interface IGetCapabilitiesResponse extends IResponse {
  request: 'GetCapabilities'
  contents?: ISensor[]
  filterCapabilities?: object
  operationMetadata?: object
  serviceIdentification?: object
  serviceProvider?: object
}

export interface IInsertSensorResponse extends IResponse {
  request: 'InsertSensor'
  assignedOffering: URI
  assignedProcedure: URI
}

export interface IInsertObservationResponse extends IResponse {
  request: 'InsertObservation'
}
