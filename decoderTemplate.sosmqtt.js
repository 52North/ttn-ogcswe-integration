function Decoder (bytes, port) {
  var now = new Date().toISOString();

  var result = {
    // TODO: how to get the fucking device ID at runtime?
    offering: 'TODO!1!',
    observation: [],
  };

  var transformers = {
    {{#each sensors}}
    '{{observedProperty}}': {{{transformer}}},
    {{/each}}
  }

  {{#each sensors}}
  result.observation.push({
    type: 'http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_Measurement',
    // TODO: how to get the fucking device ID?
    procedure: '{{../broker.options.host}}/procedure/TODO',
    observedProperty: '{{{observedProperty}}}',
    featureOfInterest: 'http://www.opengis.net/def/nil/OGC/0/unknown',
    phenomenonTime: now,
    resultTime: now,
    result: {
      value: transformers['{{{observedProperty}}}'](bytes.slice(0, {{bytes}})),
      uom: '{{{unitOfMeasurement}}}',
    }
  });

  {{/each}}

  return result;
}
