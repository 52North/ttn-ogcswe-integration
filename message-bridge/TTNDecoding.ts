import { readFileSync } from 'fs'
import * as handlebars from 'handlebars'

import { ISensorDefinition } from './BridgeOptions'

// load & precompile template
const templateString = readFileSync('./decoderTemplate.js', 'utf8')
const decoderTemplate = handlebars.compile(templateString)

export function generateDecoderFunc (sensors: ISensorDefinition[]) {
  for (const s of sensors) {
    // validate transformer function, or set default if not defined.
    if (s.transformer) {
      validateTransformer(s.transformer);
    } else {
      s.transformer = getDefaultTransformer(s.bytes)
    }

    s.transformer = wrapTransformer(s.transformer)
  }

  return decoderTemplate({ sensors })
}

export function validateTransformer (transformer: string) {
  // setup fake environment in closure
  const bytes = Array(100).fill(1);

  // try to eval the transformer expression
  // TODO: eval in separated environment: https://www.npmjs.com/package/vm2
  try {
    eval(transformer);
  } catch (err) {
    throw new Error(`invalid transformer function ${transformer}: ${err.message}`)
  }
}

// default transformer interprets all the bytes as little endian integer
// the TTN Payload Function has no Buffer.readUIntLE(), so we roll our own..
function getDefaultTransformer (bytes: number): string {
  let expression = 'bytes[0]'
  for (let i = 1; i < bytes; i++) {
    expression += ` + (bytes[${i}] << ${i * 8})`
  }

  return expression
}

function wrapTransformer (transformer: string): string {
  return /^function.+/.test(transformer)
    ? transformer
    : `function transform (bytes) {
      return ${transformer}
    }`
}
