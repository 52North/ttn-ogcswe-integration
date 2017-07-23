// reference: https://52north.github.io/sensor-web-tutorial/04_o-and-m.html
export interface IObservation {
  identifier?: ICodedValue
  type: URI               // always an O&M Measurement for our case
  procedure: URI          // represents the associated sensor
  observedProperty: URI   // the measured phenomenon
  featureOfInterest: URI | IFeatureOfInterest // must be specified once completely, afterwards just `identifier`
  sampledFeature?: URI[],
  phenomenonTime: ISODate // time of measurement
  resultTime: ISODate     // time of publication
  result: IResultMeasurement // actual measurement value // TODO: support other types
}

export interface IResultMeasurement {
  uom?: string // ideally a UCUM value
  time?: ISODate
  value: number
}

export interface ISensor {
  identifier: URI
  name: URI
  procedure: URI[]
  observableProperty: URI[]
  relatedFeature: Array<{
    featureOfInterest: URI
    role: any[],
  }>
  observedArea: {
    lowerLeft: number[]
    upperRight: number[]
    crs?: { type: string, properties: any },
  }
  phenomenonTime: ISODate[]
  resultTime: ISODate[]
  responseFormat: string[]
  observationType: URI[]
  featureOfInterestType: URI[]
  procedureDescriptionFormat: URI[]
}

interface ICodedValue {
  value: any
  codespace: URI
}

interface IFeatureOfInterest {
  identifier: ICodedValue
  name?: ICodedValue[]
  sampledFeature?: URI[]
  geometry?: IGeometry
}

interface IGeometry {
  type: string
  coordinates: number[]
  crs?: {
    type: string
    properties: any,
  }
}

/**
 * general API parameters
 */
export type CapabilitySections =
  'Contents' |
  'ServiceIdentification' |
  'ServiceProvider' |
  'OperationsMetadata' |
  'FilterCapabilities'

export type RequestMethod =
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

export type ServiceType = 'SOS' | 'AQD'
export type ServiceVersion = '1.0.0' | '2.0.0'

export type URI = string
export type ISODate = string
