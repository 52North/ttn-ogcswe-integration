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

  public connect(): Promise<any> {
    return this.fetchSensors()
  }

  // TODO: test me
  public createMessage(message: ITTNMessageOM): Promise<InsertObservationParams> {
    return this.devID2Sensor(message.dev_id)
      .then((sensor) => this.makeInsertObservationPayload(sensor, message))
  }

  // TODO: test me
  public submitMessage(message: InsertObservationParams): Promise<IBrokerResponse> {
    const { offering, observation } = message
    return this.sos.insertObservation(offering, observation)
      .then(() => Promise.resolve(<IBrokerResponse> { status: 201, message: 'created' }))
      .catch((err) => Promise.reject(`could not submit observation: ${err}`))
  }

  // TODO: test me
  private devID2Sensor(devID: string): Promise<types.ISensor> {
    // match a sensor from local cache by its prefixed ID
    const findByID = (sensor: types.ISensor) => sensor.identifier === `thethingsnetwork-${devID}`
    let sensor = this.sensorCache.find(findByID)

    if (sensor) return Promise.resolve(sensor)

    // if sensor is not found, refresh the cache
    return this.fetchSensors()
      .then((sensors: types.ISensor[]) => sensors.find(findByID))
      .then((sensor) => {
        if (sensor) return sensor

        // if still nothing found, insert a new sensor
        return this.sos.insertSensor()
      })
      // TODO: proper error handling
      //.catch('error getting the corresponding sensor:')
  }

  private fetchSensors(): Promise<types.ISensor[]> {
    return this.sos.getCapabilities(['Contents'])
      // keep a cache of relevant sensors, filtering via identifier prefix
      .then((res) => {
        this.sensorCache = res.contents
          .filter((sensor) => /^thethingsnetwork-.+/i.test(sensor.identifier))

        return this.sensorCache
      })
      .catch((err: Error) => console.error(`could not fetch sensors from SOS: ${err}`))
  }

  private makeInsertObservationPayload(sensor: types.ISensor, ttnMsg: ITTNMessageOM): InsertObservationParams {
    // extract timestamp of transmission: use time of gatewaytime if available
    const resultTime = ttnMsg.metadata.gateways[0].time || ttnMsg.metadata.time
    const phenomenonTime = ttnMsg.payload_fields.time || resultTime

    // TODO: validate that payload_fields has the correct format

    // assumptions:
    // - a procedure has only one observable property and procedure
    // - the offering associated with a procedure has the same value as sensor.identifier
    const message = <InsertObservationParams> {
      observation: {
        featureOfInterest: {
          identifier: {
            codespace: 'http://www.opengis.net/def/nil/OGC/0/unknown',
            value: sensor.relatedFeature[0].featureOfInterest,
          },
        },
        observedProperty: sensor.observableProperty[0],
        phenomenonTime,
        procedure: sensor.procedure[0],
        result: ttnMsg.payload_fields,
        resultTime,
        sampledFeature: ['http://www.opengis.net/def/nil/OGC/0/unknown'],
        type: 'http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_Measurement',
      },
      offering: sensor.procedure[0],
    }

    return message
  }
}

// specialisation of TTNMessage with specific payload fields structure for this backend
// then TTN application needs a payload function returning this format!
interface ITTNMessageOM extends ttn.data.IUplinkMessage {
  payload_fields: types.IResult
}

type InsertObservationParams= {
  observation: types.IObservation
  offering: string
}
