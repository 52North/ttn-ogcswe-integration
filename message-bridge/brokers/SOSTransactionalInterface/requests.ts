import * as r from 'request-promise-native'

import {
  IResponse,
  IGetCapabilitiesResponse,
  IInsertSensorResponse,
  IInsertObservationResponse,
} from './responses'

import {
  CapabilitySections,
  ISensor,
  IObservation,
  RequestMethod,
  ServiceType,
  ServiceVersion,
  URI,
} from './datatypes'

class Request {
  public request: RequestMethod
  public readonly service: ServiceType = 'SOS'
  public readonly version: ServiceVersion = '2.0.0'

  public async submit(uri: string) : Promise<IResponse> {
    return r({
      body: this,
      json: true,
      method: 'POST',
      uri,
    })
  }
}

export class GetCapabilitiesRequest extends Request {
  public readonly request = 'GetCapabilities'
  public readonly sections: CapabilitySections[]

  constructor(sections?: CapabilitySections[]) {
    super()
    this.sections = sections
  }

  public async submit(uri: string) : Promise<IGetCapabilitiesResponse> {
    return <Promise<IGetCapabilitiesResponse>> super.submit(uri)
  }
}

export class InsertSensorRequest extends Request {
  public readonly request = 'InsertSensor'
  public readonly procedureDescription: any
  public readonly procedureDescriptionFormat: URI
  public readonly observableProperty: URI[]
  public readonly observationType: URI[]
  public readonly featureOfInterestType: URI[]

  constructor(procedureDescriptionFormat: URI, procedureDescription: any,
              observableProperty: URI[], observationType: URI[],
              featureOfInterestType: URI[]) {
    super()
    this.procedureDescriptionFormat = procedureDescriptionFormat
    this.procedureDescription= procedureDescription
    this.observableProperty = observableProperty
    this.observationType = observationType
    this.featureOfInterestType = featureOfInterestType
  }

  public async submit(uri: string) : Promise<IInsertSensorResponse> {
    return <Promise<IInsertSensorResponse>> super.submit(uri)
  }
}

// reference: https://52north.github.io/sensor-web-tutorial/05_web-services.html#insertobservation
// TODO: check out InsertResult in ResultHandlingExtension ( "This is useful, if the remaining metadata elements of an observation are equal" )
export class InsertObservationRequest extends Request {
  public readonly request = 'InsertObservation'
  public readonly offering: URI
  public readonly observation: IObservation

  constructor(offering: URI, observation: IObservation) {
    super()
    this.offering = offering
    this.observation = observation
  }

  public async submit(uri: string) : Promise<IInsertObservationResponse> {
    return <Promise<IInsertObservationResponse>> super.submit(uri)
  }
}
