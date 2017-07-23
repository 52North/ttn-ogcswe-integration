import {
  GetCapabilitiesRequest,
  InsertSensorRequest,
  InsertObservationRequest,
  RequestParams,
} from './requests'

import * as types from './datatypes'
export { types }

export class SOSTransactionalInterface {

  private readonly endpoint: RequestParams

  constructor(host: string, token?: string) {
    // TODO: uri validation
    this.endpoint = {
      uri: host + '/service/json',
      token
    }
  }

  public async getCapabilities(sections?: types.CapabilitySections[]) {
    return new GetCapabilitiesRequest(sections)
      .submit(this.endpoint)
  }

  public insertSensor(sensor: InsertSensorParams) {
    const {
      procedureDescriptionFormat,
      procedureDescription,
      observableProperty,
      observationType,
      featureOfInterestType,
    } = sensor

    return new InsertSensorRequest(procedureDescriptionFormat, procedureDescription,
                                   observableProperty, observationType, featureOfInterestType)
      .submit(this.endpoint)
  }

  public async insertObservation(offering: string | string[], observation: types.IObservation | types.IObservation[]) {
    return new InsertObservationRequest(offering, observation)
      .submit(this.endpoint)
  }
}

export type InsertSensorParams = {
  procedureDescription: any
  procedureDescriptionFormat: string
  observableProperty: string[]
  observationType: string[]
  featureOfInterestType: string
}

export type InsertObservationParams = {
  observation: types.IObservation | types.IObservation[]
  offering: string | string[]
}
