const EXPANSION_REGEX = /(?<=\{)[^{]*(?=\})/g

const DEFAULT_OPERATOR = {
  operator: '',
  separator: ',',
  named: false,
  ifEmpty: false
}

const OPERATORS = [
  { operator: '#', separator: ',', named: false, ifEmpty: false },
  { operator: '.', separator: '.', named: false, ifEmpty: false },
  { operator: '/', separator: '/', named: false, ifEmpty: false },
  { operator: ';', separator: ';', named: true, ifEmpty: false },
  { operator: '?', separator: '&', named: true, ifEmpty: true },
  { operator: '&', separator: '&', named: true, ifEmpty: true }
]

function getNamedOperatorIfNeeded (operator, varName, el) {
  if (operator.named) {
    return `${varName}=${el}`
  }
  return el
}

function getValueFor (params, varName, operator) {
  return []
    .concat(params[varName])
    .flatMap(el => getNamedOperatorIfNeeded(operator, varName, el))
    .join(operator.separator)
}

function containsParam (params, v, canBeEmpty) {
  if (canBeEmpty) {
    return Boolean(params && typeof params[v] !== 'undefined')
  }
  return Boolean(params && params[v])
}

function getLinkOptions (link) {
  const groups = link.match(EXPANSION_REGEX)
  if (groups) {
    return {
      url: link,
      options: groups
        .flatMap(str => str.split(','))
        .map(str => {
          if (OPERATORS.some(operator => str.startsWith(operator.operator))) {
            return str.slice(1)
          }
          return str
        })
    }
  }
  return {
    url: link,
    options: []
  }
}

function translateArgumentsWithOperator (str, params, operator) {
  return str
    .split(',')
    .filter(v => containsParam(params, v, operator.ifEmpty))
    .map(v => getValueFor(params, v, operator))
    .join(operator.separator)
}

function translateTemplatedLink (link, params) {
  let returnLink = link
  const groups = link.match(EXPANSION_REGEX)
  if (!groups) {
    return link
  }
  groups.forEach(str => {
    const operator =
      OPERATORS.find(operator => str.startsWith(operator.operator)) ||
      DEFAULT_OPERATOR
    if (!OPERATORS.some(operator => str.startsWith(operator.operator))) {
      returnLink = returnLink.replace(
        `{${str}}`,
        translateArgumentsWithOperator(str, params, operator)
      )
    } else {
      const argumentList = translateArgumentsWithOperator(
        str.slice(1),
        params,
        operator
      )
      returnLink = returnLink.replace(
        `{${str}}`,
        `${argumentList.length > 0 ? operator.operator : ''}${argumentList}`
      )
    }
  })
  return returnLink
}

function translateLink (link, params) {
  if (!link.href) {
    return null
  }
  if (link.templated) {
    return translateTemplatedLink(link.href, params)
  }
  return link.href
}

function getMatchQuotient (options, params) {
  return params ? options.filter(option => option in params).length : 0
}

function findBestTemplatedLinkForParams (linkList, params) {
  return linkList
    .map(mapLink => mapLink.href)
    .filter(mapLink => mapLink)
    .map(getLinkOptions)
    .reduce((bestLink, currentLink) => {
      const linkDescriptor = {
        ...currentLink,
        matchQuotient: getMatchQuotient(currentLink.options, params)
      }
      if (!bestLink || linkDescriptor.matchQuotient > bestLink.matchQuotient) {
        return linkDescriptor
      }
      return bestLink
    }, null)
}

function translateArrayIntoLink (linkList, params) {
  if (!params) {
    const link = linkList.find(linkCheck => !linkCheck.templated)
    if (link) {
      return translateLink(link, params)
    }
  }
  const link = findBestTemplatedLinkForParams(linkList, params)
  return link ? translateTemplatedLink(link.url, params) : null
}

function resolveLinksArray (links, linkName) {
  const link = links.find(item => item.rel === linkName)
  return (link && link.href) || null
}

function resolveNamedLink (link, params) {
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

function resolveLinksObject (object, linkName, params) {
  const links = object._links || object.links || object
  if (links instanceof Array) {
    return resolveLinksArray(links, linkName)
  }
  if (links[linkName]) {
    return resolveNamedLink(links[linkName], params)
  }
  return null
}

export function resolve (object, linkName, params) {
  if (!linkName) {
    throw new Error('No link name was passed to hal link resolver')
  }
  return object ? resolveLinksObject(object, linkName, params) : null
}

export default resolve
