function Decoder (bytes, port) {
  var result = {};
  var transformers = {
    {{#each sensors}}
    '{{observedProperty}}': {{{transformer}}},
    {{/each}}
  }

  {{#each sensors}}
  result['{{{observedProperty}}}'] = {
    value: transformers['{{{observedProperty}}}'](bytes.slice(0, {{bytes}})),
    uom: '{{{unitOfMeasurement}}}',
  }

  {{/each}}

  return result;
}
