function Decoder (bytes, port) {
  var now = new Date().toISOString();

  var result = { observation: [] };

  var transformers = {
    {{#each sensors}}
    '{{observedProperty}}': {{{transformer}}},
    {{/each}}
  }

  {{#each sensors}}
  result.observation.push({
    type: 'http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_Measurement',
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
