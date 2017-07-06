import {
  GetCapabilitiesRequest,
  InsertSensorRequest,
  InsertObservationRequest,
} from './requests'


import * as types from './datatypes'
export { types }

export class SOSTransactionalInterface {

  private readonly endpoint: string

  constructor(host: string) {
    // TODO: uri validation
    this.endpoint = host + '/service'
  }

  public getCapabilities(sections?: types.CapabilitySections[]) {
    return new GetCapabilitiesRequest(sections)
      .submit(this.endpoint)
  }

  // public insertSensor() {
  //   return new InsertSensorRequest()
  //     .submit(this.endpoint)
  // }

  public insertObservation(offering: string, observation: types.IObservation) {
    return new InsertObservationRequest(offering, observation)
      .submit(this.endpoint)
  }
}
