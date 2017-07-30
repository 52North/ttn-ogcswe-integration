import { readFileSync } from 'fs'
import * as handlebars from 'handlebars'
import * as ttn from 'ttn'

import { IBridgeOptions } from '../BridgeOptions'

type PayloadFunctions<T> = {
  converter?: T
  decoder?: T
  encoder?: T
  validator?: T
  [k: string]: T
}

export class TTNPayloadFunctionManager {
  private readonly bridgeOpts: IBridgeOptions
  private readonly templates: PayloadFunctions<HandlebarsTemplateDelegate> {}
  private readonly ttnManager: ttn.manager.HTTP

  constructor (bridgeOpts: IBridgeOptions, templatePaths: PayloadFunctions<string>) {
    this.bridgeOpts = bridgeOpts

    // load & precompile each template
    for (const func in templatePaths) {
      this.templates[func] = handlebars.compile(readFileSync(templatePaths[func], 'utf8'))
    }

    this.ttnManager = new ttn.manager.HTTP({
      key: this.bridgeOpts.ttn.accessToken,
      region: this.bridgeOpts.ttn.region,
    })
  }

  public async setPayloadFunctions(): Promise<any> {
    const functions = this.generatePayloadFunctions()

    const app: ttn.manager.Application = await this.ttnManager.getApplication(this.bridgeOpts.ttn.applicationID)

    let changes = false
    for (const func in functions) {
      if (app[func] !== functions[func]) {
        app[func] = functions[func]
        changes = true
      }
    }

    return changes
      ? this.ttnManager.setApplication(this.bridgeOpts.ttn.applicationID, app)
      : Promise.resolve()

  }

  private generatePayloadFunctions(): PayloadFunctions<string> {
    // validate transformer function for each sensor
    // or set default if not defined.
    for (const s of this.bridgeOpts.sensors) {
      if (s.transformer) {
        this.validateTransformer(s.transformer);
      } else {
        s.transformer = this.getDefaultTransformer(s.bytes)
      }

      s.transformer = this.wrapTransformer(s.transformer)
    }

    // generate the function strings by feeding bridgeOpts to each template
    const result: PayloadFunctions<string> = {}
    for (const func in this.templates) {
      result[func] = this.templates[func](this.bridgeOpts)
    }

    return result
  }

  // default transformer interprets all the bytes as little endian integer
  // the TTN Payload Function has no Buffer.readUIntLE(), so we roll our own..
  private getDefaultTransformer(bytes: number): string {
    let expression = 'bytes[0]'
    for (let i = 1; i < bytes; i++) {
      expression += ` + (bytes[${i}] << ${i * 8})`
    }

    return expression
  }

  // wrap an expression in a function `(bytes: Buffer) => number`
  private wrapTransformer(transformer: string): string {
    return /^function.+/.test(transformer)
      ? transformer
      : `function transform (bytes) {
        return ${transformer}
      }`
  }

  private validateTransformer (transformer: string) {
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

}
