import { SOSTransactionalInterface } from '.'

const sos = new SOSTransactionalInterface(
  process.env.SOS_URL || 'http://localhost:8080/52n-sos-webapp',
  process.env.SOS_TOKEN || 'asdftoken',
)

let sensors = []

function generateObservation(sensor, result) {
  return {
    featureOfInterest: 'http://www.opengis.net/def/nil/OGC/0/unknown',
    observedProperty: sensor.observableProperty[0],
    phenomenonTime: '2017-07-06T21:11:37.976Z',
    procedure: sensor.procedure[0],
    result,
    resultTime: '2017-07-06T21:11:37.976Z',
    type: 'http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_Measurement',
  }
}

// get available sensors
async function test () {
  try {
    console.log(`fetching sensors from SOS..`)
    const { contents: sensors } = await sos.getCapabilities(['Contents'])

    console.log(`SOS instance has ${sensors.length} sensors`)
    if (!sensors.length) throw new Error('no sensors found')
    console.log(`sensor props: ${JSON.stringify(Object.keys(sensors[0]), null, 2)}`)
    console.log(`sensor: ${JSON.stringify(sensors[0], null, 2)}`)

    // const observation = getSampleTextObservation()
    const observation = generateObservation(sensors[0],{
      uom: 'evilness',
      value: 66.6,
    })

    console.log(`inserting an observation for sensor ${sensors[0].identifier}, (procedure/offering ${sensors[0].procedure[0]})`)
    console.log(`with keys: ${Object.keys(observation)}`)
    const insertObsResponse = await sos.insertObservation(sensors[0].procedure[0], observation)

    console.log(insertObsResponse)
  } catch (err) {
    try{
      console.error(`ERROR: ${JSON.stringify(err, null, 2)}`)
    } catch (err) {
      console.error(`ERROR: ${err}`)
    }
  }
}

test();
