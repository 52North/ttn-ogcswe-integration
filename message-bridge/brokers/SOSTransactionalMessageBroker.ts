import * as ttn from 'ttn'

import { IBrokerResponse, ITTNMessageBroker } from '.'
import {
  types,
  SOSTransactionalInterface,
} from './SOSTransactionalInterface'

// implements a broker against the SOS Transactional Interface

export class SOSTransactionalMessageBroker implements ITTNMessageBroker {

  private sos: SOSTransactionalInterface
  private sensorCache: types.ISensor[] = []

  constructor(sosHost: string) {
    this.sos = new SOSTransactionalInterface(sosHost)
  }

  public async connect(): Promise<any> {
    return this.fetchSensors()
  }

  // TODO: test me
  public async createMessage(message: ITTNMessageOM): Promise<InsertObservationParams> {
    const sensor = await this.devID2Sensor(message.dev_id)
    return this.makeInsertObservationPayload(sensor, message)
  }

  // TODO: test me
  public async submitMessage(message: InsertObservationParams): Promise<IBrokerResponse> {
    try {
      const { offering, observation } = message
      await this.sos.insertObservation(offering, observation)
      return { status: 201, message: 'created' }
    } catch (err) {
      throw new Error(`could not submit observation: ${err}`)
    }
  }

  // TODO: test me
  private async devID2Sensor(devID: string): Promise<types.ISensor> {
    const findByID = (sensor: types.ISensor) => sensor.identifier === `thethingsnetwork-${devID}`

    // match a sensor from local cache by its prefixed ID
    let sensor = this.sensorCache.find(findByID)
    if (sensor) return sensor

    try {
      // if sensor is not found, refresh the cache
      await this.fetchSensors()
      sensor = this.sensorCache.find(findByID)
      if (sensor) return sensor

      // if still nothing found, insert a new sensor
      return await this.sos.insertSensor()
    } catch (err) {
      throw new Error(`error getting the corresponding sensor for dev_id ${devID}: ${err}`)
    }
  }

  private async fetchSensors(): Promise<types.ISensor[]> {
    try {
      const { contents: sensors } = await this.sos.getCapabilities(['Contents'])

      // keep a cache of relevant sensors, filtering via identifier prefix
      this.sensorCache = sensors
        .filter((sensor) => /^thethingsnetwork-.+/i.test(sensor.identifier))

      return this.sensorCache
    } catch (err) {
      throw new Error (`could not fetch sensors from SOS: ${err}`)
    }
  }

  private makeInsertObservationPayload(sensor: types.ISensor, ttnMsg: ITTNMessageOM): InsertObservationParams {
    // validate if ttn payload contains a valid OM_Measurement value
    if (
      !ttnMsg.payload_fields ||
      typeof ttnMsg.payload_fields.value !== 'number' ||
      typeof ttnMsg.payload_fields.uom !== 'string'
    ) {
      throw new Error('ttn payload does not contain a valid Observation Result')
    }

    // extract timestamp of transmission: use time of gatewaytime if available
    const resultTime = ttnMsg.metadata.gateways[0].time || ttnMsg.metadata.time
    const phenomenonTime = ttnMsg.payload_fields.time || resultTime
    const featureOfInterest = Array.isArray(sensor.observableProperty)
      ? sensor.relatedFeature[0].featureOfInterest // TODO: check if relatedFeature actually exists
      : 'http://www.opengis.net/def/nil/OGC/0/unknown'

    // assumptions:
    // - a procedure has only one observable property and procedure
    // - the offering associated with a procedure has the same value as sensor.identifier
    const message = {
      observation: {
        featureOfInterest,
        observedProperty: sensor.observableProperty[0], // TODO: choose a specific one!
        phenomenonTime,
        procedure: sensor.procedure[0],
        result: ttnMsg.payload_fields,
        resultTime,
        type: 'http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_Measurement',
      },
      offering: sensor.procedure[0],
    }

    return message
  }
}

// specialisation of TTNMessage with specific payload fields structure for this backend
// the TTN application needs a payload function returning this format!
interface ITTNMessageOM extends ttn.data.IUplinkMessage {
  payload_fields: types.IResult_OMMeasurement
}

type InsertObservationParams = {
  observation: types.IObservation | types.IObservation[]
  offering: string | string[]
}
