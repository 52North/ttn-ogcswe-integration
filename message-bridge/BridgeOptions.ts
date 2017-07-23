import * as t from 'io-ts'
import { ThrowReporter } from 'io-ts/lib/ThrowReporter'

/**
 * type definition of the bridge config, with runtime validation using io-ts
 */

const TTNOptions = t.intersection([
  t.interface({
    accessToken: t.string,
    applicationID: t.string,
    region: t.string,
  }),
  t.partial({ options: t.interface({ ca: t.string }) }),
])

const BrokerType = t.union([
  t.literal('SOS:transactional'),
  // t.literal('SensorThings:mqtt'),
])

const BrokerOptions = t.intersection([
    t.interface({ type: BrokerType }),
    t.partial({ options: t.Dictionary }),
])

const ObservationTransformer: t.Type<string> = {
  _A: t._A,
  name: 'ObservationTransformer',
  validate(value, context) {
    // TODO: proper validation!
    return typeof value === 'string'
      ? t.success(value)
      : t.failure(value, context)
  },
}

const Sensor = t.intersection([
  t.interface({
    bytes: t.Integer,
    observedProperty: t.string,
    observedPropertyDefinition: t.string,
    unitOfMeasurement: t.string,
  }),
  t.partial({ transformer: ObservationTransformer }),
])

const BridgeOptions = t.intersection([
  t.interface({
    broker: BrokerOptions,
    sensors: t.array(Sensor),
    ttn: TTNOptions,
  }),
  t.partial({
    logger: t.any,
  }),
])

// infer the static TS type from the runtime type
export type IBridgeOptions = t.TypeOf<typeof BridgeOptions>

/**
 * validates an object to the IBridgeOptions interface, and throws if invalid
 * @param data the options object to validate
 */
export function validate(data: object): void {
  const validation = t.validate(data, BridgeOptions)
  ThrowReporter.report(validation)
}
