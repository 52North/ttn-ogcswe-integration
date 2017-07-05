import * as r from 'request-promise-native'
import * as ttn from 'ttn'

import { IBrokerResponse, ITTNMessageBroker } from '.'

// implements a broker against the SOS Transactional Interface

// reference: https://52north.github.io/sensor-web-tutorial/05_web-services.html#insertobservation
// TODO: check out InsertResult in ResultHandlingExtension ( "This is useful, if the remaining metadata elements of an observation are equal" )
interface ISOSTransactionalMessage {
  observation: IObservation
  offering: URI
  request: string
  service: string
  version: string
}

type URI = string
type ISODate = string

interface ICodedValue {
  value: any
  codespace: URI
}

interface IGeometry {
  type: string
  coordinates: number[]
  crs?: {
    type: string
    properties: any,
  }
}

interface IFeatureOfInterest {
  identifier: ICodedValue
  name?: ICodedValue[]
  sampledFeature?: URI[]
  geometry?: IGeometry
}

interface IMeasurementResult {
  uom?: string // ideally a UCUM value
  time?: ISODate
  value: number
}

// reference: https://52north.github.io/sensor-web-tutorial/04_o-and-m.html
interface IObservation {
  identifier?: ICodedValue
  type: URI                 // always an O&M Measurement for our case
  procedure: URI            // represents the associated sensor
  observedProperty: URI     // the measured phenomenon
  featureOfInterest: IFeatureOfInterest // must be specified once completely, afterwards just `identifier`
  sampledFeature: URI[],
  phenomenonTime: ISODate   // time of measurement
  resultTime: ISODate       // time of publication
  result: IMeasurementResult // actual measurement value
}

// specialisation of TTNMessage with specific payload fields structure for this backend
// then TTN application needs a payload function returning this format!
interface ITTNMessageOM extends ttn.data.IUplinkMessage {
  payload_fields: IMeasurementResult
}

interface ISensor {
  // TODO: select a variable for mapping between ttn.dev_id and sensor...
  // TODO: where is this `offering` thingy?
  identifier: string
  procedure: string[]
  observableProperty: string[]
  relatedFeature: Array<{
    featureOfInterest: string // ID of the FeatureOfInterest
    role: any[],
  }>
  observedArea: {
    lowerLeft: number[]
    upperRight: number[]
    crs?: { type: string, properties: any },
  },
  phenomenonTime: ISODate[]
  resultTime: ISODate[]
  responseFormat: string[]
  observationType: URI[]
  featureOfInterestType: URI[]
  procedureDescriptionFormat: URI[]
}

export class SOSTransactionalMessageBroker implements ITTNMessageBroker {

  private sos: SOSTransactionalInterface
  private sensorCache: ISensor[] = []

  constructor(sosHost: string) {
    this.sos = new SOSTransactionalInterface(sosHost)
  }

  public connect(): Promise<any> {
    return this.fetchSensors()
  }

  // TODO: test me
  public createMessage(message: ITTNMessageOM): Promise<ISOSTransactionalMessage> {
    return this.devID2Sensor(message.dev_id)
      .then((sensor) => this.makeInsertObservationPayload(sensor, message))
  }

  // TODO: test me
  public submitMessage(message: ISOSTransactionalMessage): Promise<IBrokerResponse> {
    const { offering, observation } = message
    return this.sos.insertObservation(offering, observation)
      .then(() => Promise.resolve(<IBrokerResponse> { status: 201, message: 'created' }))
      .catch((err) => Promise.reject(`could not submit observation: ${err}`))
  }

  // TODO: test me
  private devID2Sensor(devID: string): Promise<ISensor> {
    // match a sensor from local cache by its prefixed ID
    const findByID = (sensor: ISensor) => sensor.identifier === `thethingsnetwork-${devID}`
    let sensor = this.sensorCache.find(findByID)

    if (sensor) return Promise.resolve(sensor)

    // if sensor is not found, refresh the cache
    return this.fetchSensors()
      .then((sensors: ISensor[]) => sensors.find(findByID))
      .then((sensor) => {
        if (sensor) return sensor

        // if still nothing found, insert a new sensor
        return this.sos.insertSensor()
      })
      // TODO: proper error handling
      //.catch('error getting the corresponding sensor:')
  }

  private fetchSensors(): Promise<ISensor[]> {
    return this.sos.getCapabilities(['Contents'])
      // keep a cache of relevant sensors, filtering via identifier prefix
      .then((res: { contents: ISensor[] }) => {
        this.sensorCache = res.contents
          .filter((sensor) => /^thethingsnetwork-.+/i.test(sensor.identifier))

        return this.sensorCache
      })
      .catch((err: Error) => console.error(`could not fetch sensors from SOS: ${err}`))
  }

  private makeInsertObservationPayload(sensor: ISensor, ttnMsg: ITTNMessageOM): ISOSTransactionalMessage {
    // extract timestamp of transmission: use time of gatewaytime if available
    const resultTime = ttnMsg.metadata.gateways[0].time || ttnMsg.metadata.time
    const phenomenonTime = ttnMsg.payload_fields.time || resultTime

    // TODO: validate that payload_fields has the correct format

    // assumptions:
    // - a procedure has only one observable property and procedure
    // - the offering associated with a procedure has the same value as sensor.identifier
    const message = <ISOSTransactionalMessage> {
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

class SOSTransactionalInterface {

  private readonly endpoint: string

  constructor(host: string) {
    // TODO: uri validation
    this.endpoint = host + '/service'
  }

  public getCapabilities(sections?: CapabilitySections[]) {
    return this.makeRequest('GetCapabilities', { sections })
  }

  public insertObservation(offering: string, observation: object) {
    return this.makeRequest('InsertObservation', { offering, observation })
  }

  private makeRequest(request: RequestMethod, payload: object) {
    const reqOpts = {
      body: {
        request,
        service: 'SOS',
        version: '2.0.0',
      },
      json: true,
      method: 'POST',
      uri: this.endpoint,
    }

    Object.assign(reqOpts.body, payload);

    return r(reqOpts)
  }
}

type CapabilitySections =
  'Contents' |
  'ServiceIdentification' |
  'ServiceProvider' |
  'OperationsMetadata' |
  'FilterCapabilities'

type RequestMethod =
  'Batch' |
  'DescribeSensor' |
  'GetCapabilities' |
  'GetDataAvailability' |
  'GetFeatureOfInterest' |
  'GetObservation' |
  'GetObservationById' |
  'GetResult' |
  'GetResultTemplate' |
  'InsertObservation' |
  'InsertSensor' |
  'UpdateSensorDescription'
