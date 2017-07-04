import * as request from 'request-promise-native'

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
interface ITTNMessageOM extends ITTNMessage {
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

  private readonly baseUrl: string
  private sensorCache: ISensor[]

  constructor(sosHost: string) {
    // TODO: uri validation
    this.baseUrl = sosHost + '/service'
  }

  public connect(): Promise<any> {
    return Promise.resolve('no persistent connection required')
  }

  public createMessage(message: ITTNMessageOM): Promise<ISOSTransactionalMessage> {
    // sensor = devID2Sensor()
    // makeInsertObservationPayload(sensor, message)

    return Promise.resolve(<ISOSTransactionalMessage> {})
  }

  public submitMessage(message: ISOSTransactionalMessage): Promise<IBrokerResponse> {
    // request(this.baseUrl, message).then()
    return Promise.resolve(<IBrokerResponse> { status: 201, message: 'created' })
  }

  private devID2Sensor(devID: string): Promise<ISensor> {
    // let sensor = sensorCache.find(devID)
    // if (!sensor) { fetchSensors() }
    // if (!sensor) { insertSensor() }
    // return sensor

  }

  private fetchSensors(): Promise<ISensor[]> {
    // request(baseUrl, { "request": "GetCapabilities", "service": "SOS", "sections": ["Contents"] }).then()
  }

  private makeInsertObservationPayload(sensor: ISensor, ttnMsg: ITTNMessageOM): ISOSTransactionalMessage {
    // extract timestamp of transmission: use time of gatewaytime if available
    const resultTime = ttnMsg.metadata.gateways[0].time || ttnMsg.metadata.time
    const phenomenonTime = ttnMsg.payload_fields.time || resultTime

    // TODO: validate that payload_fields has the correct format

    // assume that a sensor only has one observable property and procedure
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
      offering: sensor.offering, // TODO: where do we get this?
      request: 'InsertObservation',
      service: 'SOS',
      version: '2.0.0',
    }

    return message
  }
}
