import * as t from 'io-ts'
import { ThrowReporter } from 'io-ts/lib/ThrowReporter'

/**
 * type definition of the bridge config, with runtime validation using io-ts
 */

const TTNOptions = t.intersection([
  t.interface({
    accessToken: t.string,
    applicationID: t.string,
  }),
  t.partial({ options: t.interface({ ca: t.string }) }),
], 'TTNOptions')

const BrokerType = t.keyof({
  'SOS:transactional': null,
  'SOS:mqtt': null,
  // 'SensorThings:mqtt': null,
}, 'BrokerType')

const BrokerOptions = t.intersection([
    t.interface({ type: BrokerType }),
    t.partial({ options: t.dictionary(t.string, t.string) }),
], 'BrokerOptions')

const Sensor = t.intersection([
  t.interface({
    bytes: t.Integer,
    observedProperty: t.string,
    observedPropertyName: t.string,
    unitOfMeasurement: t.string,
  }),
  t.partial({ transformer: t.string }), // proper validation of the JS string happens when parsing
], 'SensorDefinition')

const BridgeOptions = t.intersection([
  t.interface({
    broker: BrokerOptions,
    sensors: t.array(Sensor),
    ttn: TTNOptions,
  }),
  t.partial({
    logger: t.any,
  }),
], 'BridgeOptions')

// infer the static TS type from the runtime type
export type IBridgeOptions = t.TypeOf<typeof BridgeOptions>
export type ISensorDefinition = t.TypeOf<typeof Sensor>

/**
 * validates an object to the IBridgeOptions interface, and throws if invalid
 * @param data the options object to validate
 */
export function validate(data: object): void {
  const validation = BridgeOptions.decode(data)
  ThrowReporter.report(validation)
}
