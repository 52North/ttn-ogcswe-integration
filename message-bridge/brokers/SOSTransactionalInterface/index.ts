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

  // public insertSensor() {
  //   return new InsertSensorRequest()
  //     .submit(this.endpoint)
  // }

  public async insertObservation(offering: string | string[], observation: types.IObservation | types.IObservation[]) {
    return new InsertObservationRequest(offering, observation)
      .submit(this.endpoint)
  }
}
