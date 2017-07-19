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

export interface RequestParams {
  uri: URI
  token?: string
}

class Request {
  public request: RequestMethod
  public readonly service: ServiceType = 'SOS'
  public readonly version: ServiceVersion = '2.0.0'

  private responseTransformer(body: IResponse, response: r.FullResponse, resolveWithFullResponse: boolean) {
    if (body.exceptions && /^4/.test('' + response.statusCode)) {
      // exception text comes as json string, make it readable
      for (const ex of body.exceptions) {
        try { ex.text = JSON.parse(ex.text) } catch (err) {}
      }
    }

    return resolveWithFullResponse ? response : body
  }

  public async submit(opts: RequestParams) : Promise<IResponse> {
    const { uri, token } = opts

    return r({
      body: this,
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      json: true,
      method: 'POST',
      transform: this.responseTransformer,
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

  public async submit(opts: RequestParams) : Promise<IGetCapabilitiesResponse> {
    return <Promise<IGetCapabilitiesResponse>> super.submit(opts)
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

  public async submit(opts: RequestParams) : Promise<IInsertSensorResponse> {
    return <Promise<IInsertSensorResponse>> super.submit(opts)
  }
}

// reference: https://52north.github.io/sensor-web-tutorial/05_web-services.html#insertobservation
// TODO: check out InsertResult in ResultHandlingExtension ( "This is useful, if the remaining metadata elements of an observation are equal" )
export class InsertObservationRequest extends Request {
  public readonly request = 'InsertObservation'
  public readonly offering: URI | URI[]
  public readonly observation: IObservation | IObservation[]

  constructor(offering: URI | URI[], observation: IObservation | IObservation[]) {
    super()
    this.offering = offering
    this.observation = observation
  }

  public async submit(opts: RequestParams) : Promise<IInsertObservationResponse> {
    return <Promise<IInsertObservationResponse>> super.submit(opts)
  }
}
