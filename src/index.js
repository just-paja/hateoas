import qsm from 'query-string-manipulator'

const EXPANSION_REGEX = /(?<=\{)[^\{]*(?=\})/g

const OPERATORS = [
  { 'operator': '+', 'separator': ',', includeVarName: false },
  { 'operator': '#', 'separator': ',', includeVarName: false },
  { 'operator': '.', 'separator': '.', includeVarName: false },
  { 'operator': '/', 'separator': '/', includeVarName: false },
  { 'operator': ';', 'separator': ';', includeVarName: true },
  { 'operator': '?', 'separator': '&', includeVarName: true },
  { 'operator': '&', 'separator': '&', includeVarName: true },
]

// TODO
function isExploded (variable) {
  return variable.endsWith('*')
}

function getValueFor (args, varName) {
  if (args[varName] instanceof Array) {
    return args[varName].flatMap(el => {
      if (el instanceof Object) {
        return Object.keys(el).map(
          k => `${k},${el[k]}`)
      }
      return [el]
    })
  }
  if (args[varName] instanceof Object) {
    return Object.keys(args[varName]).map(k => `${k},${arguments[varName][k]}`)
  }
  return [`${args[varName]}`]
}

function containsArgument (args, v) {
  return !!args[v]
}

function getOptionsToken (link, args) {
  let returnLink = link
  link.match(EXPANSION_REGEX).forEach(str => {
    const ops = OPERATORS.filter(operator => str.startsWith(operator.operator))
    if (ops.length > 1) {
      throw new Error(`${str} starts with more than one operator`)
    }
    if (ops.length === 0) {
      returnLink = returnLink.replace(`{${str}}`,
        str.split(',').filter(v => containsArgument(args, v)).flatMap(
          v => getValueFor(args, v, ',')).join(','))
    } else {
      returnLink = returnLink.replace(`{${str}}`,
        `${ops[0].operator}${str.slice(1).split(',').filter(
          v => containsArgument(args, v)).map(
          v => {
            if (ops[0].includeVarName) {
              return `${v}=${getValueFor(args, v, ops[0])}`
            } else {
              return `${getValueFor(args, v, ops[0])}`
            }
          }).join(ops[0].separator)}`)
    }
  })
  return returnLink
}

function getLinkOptions (link) {
  const [token, tokenIndex] = getOptionsToken(link)
  if (token) {
    const strippedLink = link.substr(0, tokenIndex)
    const optionsStr = link.substr(tokenIndex + token.length).split('}')[0]
    return {
      url: strippedLink,
      options: optionsStr.split(',')
    }
  }
  return { url: link, options: [] }
}

function translateDestructuredLink (url, options, params) {
  if (params) {
    return qsm(url, {
      set: options
      .filter(option => option in params)
      .reduce((aggr, option) => ({
        ...aggr,
        [option]: params[option]
      }), {})
    })
  }
  return url
}

function translateTemplatedLink (link, params) {
  const { url, options } = getLinkOptions(link.href)
  return params
    ? translateDestructuredLink(url, options, params)
    : url
}

function translateLink (link, params) {
  if (!link.href) {
    return null
  }
  if (link.templated) {
    return translateTemplatedLink(link, params)
  }
  return link.href
}

function getMatchQuotient (options, params) {
  return params
    ? options.filter(option => option in params).length
    : 0
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
  return link
    ? translateDestructuredLink(link.url, link.options, params)
    : null
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
  return object
    ? resolveLinksObject(object, linkName, params)
    : null
}

export default resolve
