import { readFileSync } from 'fs'
import * as handlebars from 'handlebars'
import * as ttn from 'ttn'

import { IBridgeOptions, ITTNMessageBroker } from '.'
import {
  InsertObservationParams,
  InsertSensorParams,
  SOSTransactionalInterface,
  types,
} from './SOSTransactionalInterface'
import { TTNPayloadFunctionManager } from './TTNPayloadFunctionManager'

export class SOSTransactionalMessageBroker implements ITTNMessageBroker {

  private readonly bridgeOpts: IBridgeOptions
  private readonly logger: Console
  private sensorCache: types.ISensor[] = []
  private readonly sos: SOSTransactionalInterface
  private readonly payloadFuncManager: TTNPayloadFunctionManager
  private readonly sensorIdPrefix: string
  private sensorTemplate: HandlebarsTemplateDelegate

  constructor(bridgeOpts: IBridgeOptions) {
    this.bridgeOpts = bridgeOpts
    this.logger = bridgeOpts.logger || console
    this.sensorIdPrefix = `ttn_${bridgeOpts.ttn.applicationID}_`

    const { host, token } = bridgeOpts.broker.options
    this.sos = new SOSTransactionalInterface(host, token)

    this.payloadFuncManager = new TTNPayloadFunctionManager(bridgeOpts, {
      decoder: './decoderTemplate.sostransactional.js'
    })
  }

  public async init(): Promise<any> {
    // precompile the sensor template
    const templateString = readFileSync('./sensorTemplate.xml', 'utf8')
    this.sensorTemplate = handlebars.compile(templateString)

    // initialize the TTN app.
    await this.payloadFuncManager.setPayloadFunctions()
    this.logger.log('TTN payload function set up')

    // fill the sensor cache
    await this.fetchSensors()
    this.logger.log(`found ${this.sensorCache.length} matching sensors`)
  }

  public async createMessage(ttnMsg: ITTNMessageOM): Promise<InsertObservationParams> {
    const sensor = await this.dev2Sensor(ttnMsg)
    return this.makeInsertObservationPayload(sensor, ttnMsg)
  }

  public async submitMessage(message: InsertObservationParams): Promise<any> {
    try {
      const { offering, observation } = message
      return this.sos.insertObservation(offering, observation)
    } catch (err) {
      throw new Error(`could not submit observation: ${err}`)
    }
  }

  private async dev2Sensor(ttnMsg: ITTNMessageOM): Promise<types.ISensor> {
    const findByID = (s: types.ISensor) => {
      return s.name === `${this.sensorIdPrefix}${ttnMsg.dev_id}`
    }

    // match a sensor from local cache by its prefixed ID
    let sensor = this.sensorCache.find(findByID)
    if (sensor) {
      return sensor
    }

    try {
      // if sensor is not found, refresh the cache
      await this.fetchSensors()
      sensor = this.sensorCache.find(findByID)
      if (sensor) {
        return sensor
      }

      // if still nothing found, insert a new sensor
      const sensorPayload = this.makeInsertSensorPayload(ttnMsg)
      await this.sos.insertSensor(sensorPayload)
      await this.fetchSensors() // TODO: do this without another fetch?
      return this.sensorCache.find(findByID)
    } catch (err) {
      throw new Error(`could not get corresponding sensor for dev_id '${ttnMsg.dev_id}': ${err}`)
    }
  }

  private async fetchSensors(): Promise<types.ISensor[]> {
    try {
      const { contents: sensors } = await this.sos.getCapabilities(['Contents'])

      // keep a cache of relevant sensors, filtering via name prefix
      this.sensorCache = sensors
        .filter((sensor) => RegExp(`^${this.sensorIdPrefix}.+$`).test(sensor.name))

      return this.sensorCache
    } catch (err) {
      throw new Error (`could not fetch sensors from SOS: ${err}`)
    }
  }

  private makeInsertObservationPayload(sensor: types.ISensor, ttnMsg: ITTNMessageOM): InsertObservationParams {
    // validate if ttn payload contains a valid OM_Measurement value
    for (const observedProp in ttnMsg.payload_fields) {
      if (
        typeof ttnMsg.payload_fields[observedProp].value !== 'number' ||
        typeof ttnMsg.payload_fields[observedProp].uom !== 'string'
      ) {
        throw new Error('ttn payload does not contain a valid Observation Result')
      }
    }

    const featureOfInterest = sensor.relatedFeature
      ? sensor.relatedFeature[0].featureOfInterest
      : 'http://www.opengis.net/def/nil/OGC/0/unknown'

    // extract timestamp of transmission: use time of gatewaytime if available
    let resultTime = ttnMsg.metadata.gateways
      ? ttnMsg.metadata.gateways[0].time
      : ttnMsg.metadata.time

    // "fun" fact: SOS accepts at most 3 decimals accuracy for timestamps..
    resultTime = resultTime.replace(/(\,|\.)(\d{3})\d*/, '.$2')

    const message = {
      observation: <types.IObservation[]> [],
      offering: sensor.identifier,
    }

    // payload_fields may contain multiple observations, with the observedProperty as key
    for (const observedProperty of Object.keys(ttnMsg.payload_fields)) {
      const phenomenonTime = (
         ttnMsg.payload_fields[observedProperty].time ||
         resultTime
      ).replace(/(\,|\.)(\d{3})\d*/, '.$2') // truncate date decimals

      message.observation.push({
        featureOfInterest,
        observedProperty,
        phenomenonTime,
        procedure: sensor.procedure[0],
        result: ttnMsg.payload_fields[observedProperty],
        resultTime,
        type: 'http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_Measurement',
      })
    }

    return message
  }

  private makeInsertSensorPayload(ttnMsg: ITTNMessageOM): InsertSensorParams {
    // generate SensorML from template
    const procedureDescription = this.sensorTemplate({
      ALTITUDE: ttnMsg.altitude,
      HOST: this.bridgeOpts.broker.options.host,
      LATITUDE: ttnMsg.latitude,
      LONGITUDE: ttnMsg.longitude,
      SENSORS: this.bridgeOpts.sensors,
      SENSOR_ID: `${this.sensorIdPrefix}${ttnMsg.dev_id}`,
    }).replace(/\s+/g, ' ') // deflate whitespace

    return {
      featureOfInterestType: 'http://www.opengis.net/def/nil/OGC/0/unknown',
      observableProperty: this.bridgeOpts.sensors.map((s) => s.observedProperty),
      observationType: ['http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_Measurement'],
      procedureDescription,
      procedureDescriptionFormat: 'http://www.opengis.net/sensorml/2.0',
    }
  }
}

/**
 * specialisation of TTNMessage with specific payload fields structure for this backend
 * the TTN application needs a payload function returning this format!
 */
interface ITTNMessageOM extends ttn.data.IUplinkMessage {
  payload_fields: {
    [k: string]: types.IResultMeasurement,
  }
}
