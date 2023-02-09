const isRequest = arg => arg?.constructor?.name === 'IncomingMessage'

class LinkItem {
  templated = false
  templatable = true

  constructor(...args) {
    this.args = []
    this.append(...args)
  }

  append(...args) {
    for (const arg of args) {
      if ([undefined, null, false].includes(arg)) {
        continue
      }
      if (arg instanceof this.constructor) {
        if (arg.args.length) {
          this.args.push(...arg.args)
          if (this.templatable) {
            this.templated = true
          }
        }
      } else {
        if (arg instanceof LinkItem && arg.templatable) {
          this.templated = true
        }
        this.args.push(arg)
      }
    }
  }

  isEmpty() {
    return this.args.length === 0
  }
}

class HalLink extends LinkItem {
  /** Return href of the link. This is here to keep HalLink class compatible
   *  with the HATEOAS HAL Link resolver
   *
   *  @returns {string}
   */
  get href() {
    const json = this.toJSON()
    return json.templated ? json.href : json
  }

  toJSON() {
    const origin = new HalOrigin()
    const path = new HalPath()
    const paramValues = new HalParamValue()
    const params = new HalParam()

    for (const arg of this.args) {
      if (arg instanceof HalParamValue) {
        paramValues.append(arg)
      } else if (arg instanceof HalParam) {
        params.append(arg)
      } else if (arg instanceof HalOrigin || isRequest(arg)) {
        origin.append(arg)
      } else {
        path.append(arg)
      }
    }

    if (!paramValues.isEmpty()) {
      params.leadSymbol = '&'
      params.ignoreParams(paramValues)
    }

    const href = [
      origin.toString(),
      path.toString(),
      paramValues.toString(),
      params.toString(),
    ].join('')
    return origin.templated || params.templated || path.templated
      ? { href, templated: true }
      : href
  }
}

class HalOrigin extends LinkItem {
  templatable = false

  append(...args) {
    for (const arg of args) {
      if (isRequest(arg)) {
        this.args.push(`${arg.protocol}://${arg.get('host')}`)
      } else {
        super.append(arg)
      }
    }
  }

  toString() {
    return this.args.length ? this.args[this.args.length - 1] : ''
  }
}

class HalPath extends LinkItem {
  templatable = false

  toString() {
    return `/${this.args.map(this.transformArg).join('/')}`
  }

  transformArg(arg) {
    if (arg instanceof LinkItem) {
      return arg.toString()
    }
    return String(arg).replace(/\/+/g, '')
  }
}

class HalSegmentVariable extends LinkItem {
  toString() {
    return `{${this.args.join('/')}}`
  }
}

class HalParam extends LinkItem {
  leadSymbol = '?'

  toString() {
    return this.args.length
      ? `{${this.getLeadSymbol()}${this.args.join(',')}}`
      : ''
  }

  getLeadSymbol() {
    return this.leadSymbol
  }

  ignoreParams(paramValues) {
    const usedParams = paramValues.args.map(Object.keys).flat()
    this.args = this.args.flat().filter(arg => !usedParams.includes(arg))
    return this
  }
}

class HalParamValue extends LinkItem {
  leadSymbol = '?'

  toString() {
    return this.args.length
      ? `${this.getLeadSymbol()}${this.args.map(this.transformArg).join(',')}`
      : ''
  }

  getLeadSymbol() {
    return this.leadSymbol
  }

  transformArg(arg) {
    return Object.entries(arg)
      .map(([field, value]) => `${field}=${value}`)
      .join('&')
  }
}

export const origin = (...args) => new HalOrigin(...args)
export const segment = (...args) => new HalSegmentVariable(...args)
export const param = (...args) => new HalParam(...args)
export const paramValue = (...args) => new HalParamValue(...args)
export const link = (...args) => new HalLink(...args)
