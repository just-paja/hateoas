// Cannot use lookbehind in regex because of safari
const EXPANSION_REGEX = /(\{)[^{]*(\})/g

const RESOURCE_VALUE = 10000
const DEFAULT_OPERATOR = {
  operator: '',
  separator: ',',
  named: false,
  ifEmpty: false,
}

const OPERATORS = [
  { operator: '#', separator: ',', named: false, ifEmpty: false, value: 1 },
  {
    operator: '.',
    separator: '.',
    named: false,
    ifEmpty: false,
    value: RESOURCE_VALUE,
  },
  {
    operator: '/',
    separator: '/',
    named: false,
    ifEmpty: false,
    value: RESOURCE_VALUE,
  },
  { operator: ';', separator: ';', named: true, ifEmpty: false, value: 10 },
  { operator: '?', separator: '&', named: true, ifEmpty: true, value: 100 },
  { operator: '&', separator: '&', named: true, ifEmpty: true, value: 100 },
]

function getNamedOperatorIfNeeded(operator, varName, el) {
  if (operator.named) {
    return `${varName}=${el}`
  }
  return el
}

function getValueFor(params, varName, operator) {
  return []
    .concat(params[varName])
    .reduce(
      (acc, el) => acc.concat(getNamedOperatorIfNeeded(operator, varName, el)),
      []
    )
    .join(operator.separator)
}

function containsParam(params, v, canBeEmpty) {
  if (canBeEmpty) {
    return Boolean(params && typeof params[v] !== 'undefined')
  }
  return Boolean(params && params[v])
}

const detectOperator = str =>
  OPERATORS.find(operator => str.startsWith(operator.operator))

function getLinkOptions(link) {
  const groups = link.match(EXPANSION_REGEX)
  const desc = {
    url: link,
  }
  if (groups) {
    let lastValue = 0
    desc.options = groups
      // need to slice of the surrounding '{' and '}' -> slice(1, -1)
      .reduce((acc, str) => acc.concat(str.slice(1, -1).split(',')), [])
      .map(str => {
        let name = str
        const op = detectOperator(str)
        if (op) {
          lastValue = op.value
          name = str.slice(1)
        }
        return { name, value: lastValue }
      })
  } else {
    desc.options = []
  }
  return desc
}

function translateArgumentsWithOperator(str, params, operator) {
  return str
    .split(',')
    .filter(v => containsParam(params, v, operator.ifEmpty))
    .map(v => getValueFor(params, v, operator))
    .join(operator.separator)
}

function translateTemplatedLink(link, params) {
  const groups = link.match(EXPANSION_REGEX)
  if (!groups) {
    return link
  }
  return groups.reduce((returnLink, str) => {
    // need to slice of the surrounding '{' and '}' -> slice(1, -1)
    const slicedStr = str.slice(1, -1)
    const matchedOperator = detectOperator(slicedStr)
    const operator = matchedOperator || DEFAULT_OPERATOR
    if (!matchedOperator) {
      return returnLink.replace(
        `{${slicedStr}}`,
        translateArgumentsWithOperator(slicedStr, params, operator)
      )
    }
    const argumentList = translateArgumentsWithOperator(
      slicedStr.slice(1),
      params,
      operator
    )
    return returnLink.replace(
      `{${slicedStr}}`,
      `${argumentList.length > 0 ? operator.operator : ''}${argumentList}`
    )
  }, link)
}

function translateLink(link, params) {
  if (!link.href) {
    return null
  }
  if (link.templated) {
    return translateTemplatedLink(link.href, params)
  }
  return link.href
}

const getParamMatch = (option, params) =>
  option.name in params ? option.value || RESOURCE_VALUE : 0

const reduceParamMatch = params => (aggr, option) =>
  aggr + getParamMatch(option, params)

const getMatchQuotient = (options, params) =>
  params ? options.reduce(reduceParamMatch(params), 0) : 0

function findBestTemplatedLinkForParams(linkList, params) {
  return linkList
    .map(mapLink => mapLink.href)
    .filter(mapLink => mapLink)
    .map(getLinkOptions)
    .reduce((bestLink, currentLink) => {
      const linkDescriptor = {
        ...currentLink,
        matchQuotient: getMatchQuotient(currentLink.options, params),
      }
      if (!bestLink || linkDescriptor.matchQuotient > bestLink.matchQuotient) {
        return linkDescriptor
      }
      return bestLink
    }, null)
}

function translateArrayIntoLink(linkList, params) {
  if (!params) {
    const link = linkList.find(linkCheck => !linkCheck.templated)
    if (link) {
      return translateLink(link, params)
    }
  }
  const link = findBestTemplatedLinkForParams(linkList, params)
  return link ? translateTemplatedLink(link.url, params) : null
}

function resolveLinksArray(links, linkName) {
  const link = links.find(item => item.rel === linkName)
  return (link && link.href) || null
}

function resolveNamedLink(link, params) {
  if (typeof link === 'string') {
    return link
  } else if (link instanceof Array) {
    if (link.length > 0) {
      return translateArrayIntoLink(link, params)
    }
  } else if (link instanceof Object) {
    return translateLink(link, params)
  }
  return null
}

function getObjectLinks(object) {
  // eslint-disable-next-line no-underscore-dangle
  return object._links || object.links || object
}

function resolveLinksObject(object, linkName, params) {
  const links = getObjectLinks(object)
  if (links instanceof Array) {
    return resolveLinksArray(links, linkName)
  }
  if (links[linkName]) {
    return resolveNamedLink(links[linkName], params)
  }
  return null
}

export function resolve(object, linkName, params) {
  if (!linkName) {
    throw new Error('No link name was passed to hal link resolver')
  }
  return object ? resolveLinksObject(object, linkName, params) : null
}

export default resolve
