import * as r from 'request-promise-native'

import {
  IGetCapabilitiesResponse,
  IInsertObservationResponse,
  IInsertSensorResponse,
  IResponse,
} from './responses'

import {
  CapabilitySections,
  IObservation,
  ISensor,
  RequestMethod,
  ServiceType,
  ServiceVersion,
  URI,
} from './datatypes'

// reference: https://github.com/52North/sos/tree/master/coding/json-common/src/main/resources/schema/sos/request

export interface IRequestParams {
  uri: URI
  token?: string
}

class Request {
  public request: RequestMethod
  public readonly service: ServiceType = 'SOS'
  public readonly version: ServiceVersion = '2.0.0'

  public async submit(opts: IRequestParams): Promise<IResponse> {
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

  private responseTransformer(body: IResponse, response: r.FullResponse, resolveWithFullResponse: boolean) {
    if (body.exceptions && response.statusCode >= 400) {
      // exception text comes as json string (not always!), make it readable
      for (const ex of body.exceptions) {
        try { ex.text = JSON.parse(ex.text) } catch (err) { return }
      }
    }

    return resolveWithFullResponse ? response : body
  }
}

export class GetCapabilitiesRequest extends Request {
  public readonly request = 'GetCapabilities'
  public readonly sections: CapabilitySections[]

  constructor(sections?: CapabilitySections[]) {
    super()
    this.sections = sections
  }

  public async submit(opts: IRequestParams): Promise<IGetCapabilitiesResponse> {
    return <Promise<IGetCapabilitiesResponse>> super.submit(opts)
  }
}

export class InsertSensorRequest extends Request {
  public readonly request = 'InsertSensor'
  public readonly procedureDescription: any
  public readonly procedureDescriptionFormat: URI
  public readonly observableProperty: URI[]
  public readonly observationType: URI[]
  public readonly featureOfInterestType: URI

  constructor(procedureDescriptionFormat: URI, procedureDescription: any,
              observableProperty: URI[], observationType: URI[],
              featureOfInterestType: URI) {
    super()
    this.procedureDescriptionFormat = procedureDescriptionFormat
    this.procedureDescription = procedureDescription
    this.observableProperty = observableProperty
    this.observationType = observationType
    this.featureOfInterestType = featureOfInterestType
  }

  public async submit(opts: IRequestParams): Promise<IInsertSensorResponse> {
    return <Promise<IInsertSensorResponse>> super.submit(opts)
  }
}

// reference: https://52north.github.io/sensor-web-tutorial/05_web-services.html#insertobservation
// TODO: check out InsertResult in ResultHandlingExtension
// ("This is useful, if the remaining metadata elements of an observation are equal" )
export class InsertObservationRequest extends Request {
  public readonly request = 'InsertObservation'
  public readonly offering: URI | URI[]
  public readonly observation: IObservation | IObservation[]

  constructor(offering: URI | URI[], observation: IObservation | IObservation[]) {
    super()
    this.offering = offering
    this.observation = observation
  }

  public async submit(opts: IRequestParams): Promise<IInsertObservationResponse> {
    return <Promise<IInsertObservationResponse>> super.submit(opts)
  }
}
